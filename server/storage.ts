import {
  users,
  skills,
  userSkills,
  swaps,
  sessions_table,
  messages,
  reviews,
  availability,
  type User,
  type UpsertUser,
  type Skill,
  type InsertSkill,
  type UserSkill,
  type InsertUserSkill,
  type Swap,
  type InsertSwap,
  type Session,
  type InsertSession,
  type Message,
  type InsertMessage,
  type Review,
  type InsertReview,
  type Availability,
  type InsertAvailability,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, ne, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Skill operations
  getAllSkills(): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  getUserSkills(userId: string): Promise<UserSkill[]>;
  addUserSkill(userSkill: InsertUserSkill): Promise<UserSkill>;
  removeUserSkill(userId: string, skillId: number): Promise<void>;
  
  // Swap operations
  getSwapsByUser(userId: string): Promise<any[]>;
  createSwap(swap: InsertSwap): Promise<Swap>;
  updateSwapStatus(swapId: number, status: string): Promise<void>;
  getSwapMatches(userId: string): Promise<any[]>;
  
  // Session operations
  getSessionsByUser(userId: string): Promise<any[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSessionStatus(sessionId: number, status: string): Promise<void>;
  getUpcomingSessions(userId: string): Promise<any[]>;
  
  // Message operations
  getMessagesBySwap(swapId: number): Promise<any[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  getRecentMessages(userId: string): Promise<any[]>;
  markMessageAsRead(messageId: number): Promise<void>;
  
  // Review operations
  getReviewsByUser(userId: string): Promise<any[]>;
  createReview(review: InsertReview): Promise<Review>;
  getUserRating(userId: string): Promise<number>;
  
  // Availability operations
  getUserAvailability(userId: string): Promise<Availability[]>;
  setUserAvailability(availability: InsertAvailability[]): Promise<void>;
  
  // Stats operations
  getUserStats(userId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Skill operations
  async getAllSkills(): Promise<Skill[]> {
    return await db.select().from(skills).orderBy(asc(skills.name));
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db.insert(skills).values(skill).returning();
    return newSkill;
  }

  async getUserSkills(userId: string): Promise<UserSkill[]> {
    return await db
      .select()
      .from(userSkills)
      .where(eq(userSkills.userId, userId))
      .orderBy(asc(userSkills.type));
  }

  async addUserSkill(userSkill: InsertUserSkill): Promise<UserSkill> {
    const [newUserSkill] = await db.insert(userSkills).values(userSkill).returning();
    return newUserSkill;
  }

  async removeUserSkill(userId: string, skillId: number): Promise<void> {
    await db
      .delete(userSkills)
      .where(and(eq(userSkills.userId, userId), eq(userSkills.skillId, skillId)));
  }

  // Swap operations
  async getSwapsByUser(userId: string): Promise<any[]> {
    return await db
      .select({
        id: swaps.id,
        status: swaps.status,
        message: swaps.message,
        createdAt: swaps.createdAt,
        updatedAt: swaps.updatedAt,
        isRequester: sql<boolean>`${swaps.requesterId} = ${userId}`,
        partner: sql<any>`CASE 
          WHEN ${swaps.requesterId} = ${userId} THEN json_build_object(
            'id', provider.id, 
            'firstName', provider.first_name, 
            'lastName', provider.last_name, 
            'profileImageUrl', provider.profile_image_url
          )
          ELSE json_build_object(
            'id', requester.id, 
            'firstName', requester.first_name, 
            'lastName', requester.last_name, 
            'profileImageUrl', requester.profile_image_url
          )
        END`,
        requesterSkill: sql<any>`json_build_object(
          'id', req_skill.id, 
          'name', req_skill.name
        )`,
        providerSkill: sql<any>`json_build_object(
          'id', prov_skill.id, 
          'name', prov_skill.name
        )`,
      })
      .from(swaps)
      .innerJoin(users.as("requester"), eq(swaps.requesterId, users.id))
      .innerJoin(users.as("provider"), eq(swaps.providerId, users.id))
      .innerJoin(skills.as("req_skill"), eq(swaps.requesterSkillId, skills.id))
      .innerJoin(skills.as("prov_skill"), eq(swaps.providerSkillId, skills.id))
      .where(or(eq(swaps.requesterId, userId), eq(swaps.providerId, userId)))
      .orderBy(desc(swaps.updatedAt));
  }

  async createSwap(swap: InsertSwap): Promise<Swap> {
    const [newSwap] = await db.insert(swaps).values(swap).returning();
    return newSwap;
  }

  async updateSwapStatus(swapId: number, status: string): Promise<void> {
    await db
      .update(swaps)
      .set({ status, updatedAt: new Date() })
      .where(eq(swaps.id, swapId));
  }

  async getSwapMatches(userId: string): Promise<any[]> {
    // Find users who want to learn what the current user can teach
    // and who can teach what the current user wants to learn
    return await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        location: users.location,
        wantsToLearn: sql<any>`json_build_object(
          'id', want_skill.id, 
          'name', want_skill.name
        )`,
        offersToTeach: sql<any>`json_build_object(
          'id', offer_skill.id, 
          'name', offer_skill.name
        )`,
      })
      .from(users)
      .innerJoin(userSkills.as("want_skills"), and(
        eq(userSkills.userId, users.id),
        eq(userSkills.type, "learn")
      ))
      .innerJoin(skills.as("want_skill"), eq(userSkills.skillId, skills.id))
      .innerJoin(userSkills.as("offer_skills"), and(
        eq(userSkills.userId, users.id),
        eq(userSkills.type, "teach")
      ))
      .innerJoin(skills.as("offer_skill"), eq(userSkills.skillId, skills.id))
      .where(and(
        ne(users.id, userId),
        sql`EXISTS (
          SELECT 1 FROM user_skills us1 
          WHERE us1.user_id = ${userId} 
          AND us1.skill_id = want_skill.id 
          AND us1.type = 'teach'
        )`,
        sql`EXISTS (
          SELECT 1 FROM user_skills us2 
          WHERE us2.user_id = ${userId} 
          AND us2.skill_id = offer_skill.id 
          AND us2.type = 'learn'
        )`
      ))
      .limit(10);
  }

  // Session operations
  async getSessionsByUser(userId: string): Promise<any[]> {
    return await db
      .select({
        id: sessions_table.id,
        title: sessions_table.title,
        description: sessions_table.description,
        scheduledAt: sessions_table.scheduledAt,
        duration: sessions_table.duration,
        status: sessions_table.status,
        meetingLink: sessions_table.meetingLink,
        notes: sessions_table.notes,
        isTeacher: sql<boolean>`${sessions_table.teacherId} = ${userId}`,
        partner: sql<any>`CASE 
          WHEN ${sessions_table.teacherId} = ${userId} THEN json_build_object(
            'id', student.id, 
            'firstName', student.first_name, 
            'lastName', student.last_name, 
            'profileImageUrl', student.profile_image_url
          )
          ELSE json_build_object(
            'id', teacher.id, 
            'firstName', teacher.first_name, 
            'lastName', teacher.last_name, 
            'profileImageUrl', teacher.profile_image_url
          )
        END`,
        skill: sql<any>`json_build_object(
          'id', skill.id, 
          'name', skill.name
        )`,
      })
      .from(sessions_table)
      .innerJoin(users.as("teacher"), eq(sessions_table.teacherId, users.id))
      .innerJoin(users.as("student"), eq(sessions_table.studentId, users.id))
      .innerJoin(skills.as("skill"), eq(sessions_table.skillId, skills.id))
      .where(or(eq(sessions_table.teacherId, userId), eq(sessions_table.studentId, userId)))
      .orderBy(desc(sessions_table.scheduledAt));
  }

  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db.insert(sessions_table).values(session).returning();
    return newSession;
  }

  async updateSessionStatus(sessionId: number, status: string): Promise<void> {
    await db
      .update(sessions_table)
      .set({ status, updatedAt: new Date() })
      .where(eq(sessions_table.id, sessionId));
  }

  async getUpcomingSessions(userId: string): Promise<any[]> {
    return await db
      .select({
        id: sessions_table.id,
        title: sessions_table.title,
        scheduledAt: sessions_table.scheduledAt,
        duration: sessions_table.duration,
        meetingLink: sessions_table.meetingLink,
        isTeacher: sql<boolean>`${sessions_table.teacherId} = ${userId}`,
        partner: sql<any>`CASE 
          WHEN ${sessions_table.teacherId} = ${userId} THEN json_build_object(
            'id', student.id, 
            'firstName', student.first_name, 
            'lastName', student.last_name
          )
          ELSE json_build_object(
            'id', teacher.id, 
            'firstName', teacher.first_name, 
            'lastName', teacher.last_name
          )
        END`,
        skill: sql<any>`json_build_object(
          'id', skill.id, 
          'name', skill.name
        )`,
      })
      .from(sessions_table)
      .innerJoin(users.as("teacher"), eq(sessions_table.teacherId, users.id))
      .innerJoin(users.as("student"), eq(sessions_table.studentId, users.id))
      .innerJoin(skills.as("skill"), eq(sessions_table.skillId, skills.id))
      .where(and(
        or(eq(sessions_table.teacherId, userId), eq(sessions_table.studentId, userId)),
        sql`${sessions_table.scheduledAt} > NOW()`,
        eq(sessions_table.status, "scheduled")
      ))
      .orderBy(asc(sessions_table.scheduledAt))
      .limit(5);
  }

  // Message operations
  async getMessagesBySwap(swapId: number): Promise<any[]> {
    return await db
      .select({
        id: messages.id,
        content: messages.content,
        readAt: messages.readAt,
        createdAt: messages.createdAt,
        sender: sql<any>`json_build_object(
          'id', sender.id, 
          'firstName', sender.first_name, 
          'lastName', sender.last_name, 
          'profileImageUrl', sender.profile_image_url
        )`,
        receiver: sql<any>`json_build_object(
          'id', receiver.id, 
          'firstName', receiver.first_name, 
          'lastName', receiver.last_name, 
          'profileImageUrl', receiver.profile_image_url
        )`,
      })
      .from(messages)
      .innerJoin(users.as("sender"), eq(messages.senderId, users.id))
      .innerJoin(users.as("receiver"), eq(messages.receiverId, users.id))
      .where(eq(messages.swapId, swapId))
      .orderBy(asc(messages.createdAt));
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getRecentMessages(userId: string): Promise<any[]> {
    return await db
      .select({
        id: messages.id,
        content: messages.content,
        readAt: messages.readAt,
        createdAt: messages.createdAt,
        swapId: messages.swapId,
        sender: sql<any>`json_build_object(
          'id', sender.id, 
          'firstName', sender.first_name, 
          'lastName', sender.last_name, 
          'profileImageUrl', sender.profile_image_url
        )`,
        isFromUser: sql<boolean>`${messages.senderId} = ${userId}`,
      })
      .from(messages)
      .innerJoin(users.as("sender"), eq(messages.senderId, users.id))
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt))
      .limit(20);
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(eq(messages.id, messageId));
  }

  // Review operations
  async getReviewsByUser(userId: string): Promise<any[]> {
    return await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        reviewer: sql<any>`json_build_object(
          'id', reviewer.id, 
          'firstName', reviewer.first_name, 
          'lastName', reviewer.last_name, 
          'profileImageUrl', reviewer.profile_image_url
        )`,
        session: sql<any>`json_build_object(
          'id', session.id, 
          'title', session.title
        )`,
      })
      .from(reviews)
      .innerJoin(users.as("reviewer"), eq(reviews.reviewerId, users.id))
      .innerJoin(sessions_table.as("session"), eq(reviews.sessionId, sessions_table.id))
      .where(eq(reviews.revieweeId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getUserRating(userId: string): Promise<number> {
    const [result] = await db
      .select({
        avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      })
      .from(reviews)
      .where(eq(reviews.revieweeId, userId));
    
    return Math.round(result.avgRating * 10) / 10;
  }

  // Availability operations
  async getUserAvailability(userId: string): Promise<Availability[]> {
    return await db
      .select()
      .from(availability)
      .where(eq(availability.userId, userId))
      .orderBy(asc(availability.dayOfWeek));
  }

  async setUserAvailability(availabilityData: InsertAvailability[]): Promise<void> {
    if (availabilityData.length === 0) return;
    
    const userId = availabilityData[0].userId;
    
    // Delete existing availability
    await db.delete(availability).where(eq(availability.userId, userId));
    
    // Insert new availability
    await db.insert(availability).values(availabilityData);
  }

  // Stats operations
  async getUserStats(userId: string): Promise<any> {
    const [stats] = await db
      .select({
        activeSwaps: sql<number>`COUNT(DISTINCT CASE WHEN ${swaps.status} = 'accepted' THEN ${swaps.id} END)`,
        completedSwaps: sql<number>`COUNT(DISTINCT CASE WHEN ${swaps.status} = 'completed' THEN ${swaps.id} END)`,
        totalSessions: sql<number>`COUNT(DISTINCT ${sessions_table.id})`,
        avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
      })
      .from(swaps)
      .leftJoin(sessions_table, or(
        eq(sessions_table.teacherId, userId),
        eq(sessions_table.studentId, userId)
      ))
      .leftJoin(reviews, eq(reviews.revieweeId, userId))
      .where(or(eq(swaps.requesterId, userId), eq(swaps.providerId, userId)));

    return {
      activeSwaps: stats.activeSwaps || 0,
      completedSwaps: stats.completedSwaps || 0,
      totalSessions: stats.totalSessions || 0,
      avgRating: Math.round(stats.avgRating * 10) / 10 || 0,
    };
  }
}

export const storage = new DatabaseStorage();
