import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  location: varchar("location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Skills table
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User skills - what users can teach or want to learn
export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  skillId: integer("skill_id").notNull().references(() => skills.id),
  type: varchar("type", { length: 20 }).notNull(), // 'teach' or 'learn'
  level: varchar("level", { length: 20 }).notNull(), // 'beginner', 'intermediate', 'advanced'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Skill swaps
export const swaps = pgTable("swaps", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  providerId: varchar("provider_id").notNull().references(() => users.id),
  requesterSkillId: integer("requester_skill_id").notNull().references(() => skills.id),
  providerSkillId: integer("provider_skill_id").notNull().references(() => skills.id),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending', 'accepted', 'rejected', 'completed'
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learning sessions
export const sessions_table = pgTable("learning_sessions", {
  id: serial("id").primaryKey(),
  swapId: integer("swap_id").notNull().references(() => swaps.id),
  teacherId: varchar("teacher_id").notNull().references(() => users.id),
  studentId: varchar("student_id").notNull().references(() => users.id),
  skillId: integer("skill_id").notNull().references(() => skills.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").notNull(), // in minutes
  status: varchar("status", { length: 20 }).notNull().default("scheduled"), // 'scheduled', 'in_progress', 'completed', 'cancelled'
  meetingLink: varchar("meeting_link"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  swapId: integer("swap_id").notNull().references(() => swaps.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews and ratings
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => sessions_table.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  revieweeId: varchar("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User availability
export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, etc.
  startTime: varchar("start_time", { length: 5 }).notNull(), // HH:MM format
  endTime: varchar("end_time", { length: 5 }).notNull(), // HH:MM format
  timezone: varchar("timezone", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userSkills: many(userSkills),
  requestedSwaps: many(swaps, { relationName: "requester" }),
  providedSwaps: many(swaps, { relationName: "provider" }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  taughtSessions: many(sessions_table, { relationName: "teacher" }),
  learnedSessions: many(sessions_table, { relationName: "student" }),
  givenReviews: many(reviews, { relationName: "reviewer" }),
  receivedReviews: many(reviews, { relationName: "reviewee" }),
  availability: many(availability),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
  sessions: many(sessions_table),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, { fields: [userSkills.userId], references: [users.id] }),
  skill: one(skills, { fields: [userSkills.skillId], references: [skills.id] }),
}));

export const swapsRelations = relations(swaps, ({ one, many }) => ({
  requester: one(users, { fields: [swaps.requesterId], references: [users.id], relationName: "requester" }),
  provider: one(users, { fields: [swaps.providerId], references: [users.id], relationName: "provider" }),
  requesterSkill: one(skills, { fields: [swaps.requesterSkillId], references: [skills.id], relationName: "requesterSkill" }),
  providerSkill: one(skills, { fields: [swaps.providerSkillId], references: [skills.id], relationName: "providerSkill" }),
  sessions: many(sessions_table),
  messages: many(messages),
}));

export const sessionsRelations = relations(sessions_table, ({ one, many }) => ({
  swap: one(swaps, { fields: [sessions_table.swapId], references: [swaps.id] }),
  teacher: one(users, { fields: [sessions_table.teacherId], references: [users.id], relationName: "teacher" }),
  student: one(users, { fields: [sessions_table.studentId], references: [users.id], relationName: "student" }),
  skill: one(skills, { fields: [sessions_table.skillId], references: [skills.id] }),
  reviews: many(reviews),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  swap: one(swaps, { fields: [messages.swapId], references: [swaps.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "sender" }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id], relationName: "receiver" }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  session: one(sessions_table, { fields: [reviews.sessionId], references: [sessions_table.id] }),
  reviewer: one(users, { fields: [reviews.reviewerId], references: [users.id], relationName: "reviewer" }),
  reviewee: one(users, { fields: [reviews.revieweeId], references: [users.id], relationName: "reviewee" }),
}));

export const availabilityRelations = relations(availability, ({ one }) => ({
  user: one(users, { fields: [availability.userId], references: [users.id] }),
}));

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertSkill = typeof skills.$inferInsert;
export type Skill = typeof skills.$inferSelect;

export type InsertUserSkill = typeof userSkills.$inferInsert;
export type UserSkill = typeof userSkills.$inferSelect;

export type InsertSwap = typeof swaps.$inferInsert;
export type Swap = typeof swaps.$inferSelect;

export type InsertSession = typeof sessions_table.$inferInsert;
export type Session = typeof sessions_table.$inferSelect;

export type InsertMessage = typeof messages.$inferInsert;
export type Message = typeof messages.$inferSelect;

export type InsertReview = typeof reviews.$inferInsert;
export type Review = typeof reviews.$inferSelect;

export type InsertAvailability = typeof availability.$inferInsert;
export type Availability = typeof availability.$inferSelect;

// Zod schemas
export const insertUserSkillSchema = createInsertSchema(userSkills);
export const insertSwapSchema = createInsertSchema(swaps);
export const insertSessionSchema = createInsertSchema(sessions_table);
export const insertMessageSchema = createInsertSchema(messages);
export const insertReviewSchema = createInsertSchema(reviews);
export const insertAvailabilitySchema = createInsertSchema(availability);
