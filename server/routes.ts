import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertSwapSchema, insertSessionSchema, insertMessageSchema, insertReviewSchema, insertUserSkillSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const userSkills = await storage.getUserSkills(userId);
      const stats = await storage.getUserStats(userId);
      const rating = await storage.getUserRating(userId);
      
      res.json({
        ...user,
        skills: userSkills,
        stats,
        rating
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bio, location } = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        bio,
        location,
        updatedAt: new Date()
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Skills routes
  app.get('/api/skills', async (req, res) => {
    try {
      const skills = await storage.getAllSkills();
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.post('/api/skills', isAuthenticated, async (req: any, res) => {
    try {
      const { name, category, description } = req.body;
      const skill = await storage.createSkill({ name, category, description });
      res.json(skill);
    } catch (error) {
      console.error("Error creating skill:", error);
      res.status(500).json({ message: "Failed to create skill" });
    }
  });

  app.get('/api/user-skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userSkills = await storage.getUserSkills(userId);
      res.json(userSkills);
    } catch (error) {
      console.error("Error fetching user skills:", error);
      res.status(500).json({ message: "Failed to fetch user skills" });
    }
  });

  app.post('/api/user-skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertUserSkillSchema.parse({
        ...req.body,
        userId
      });
      
      const userSkill = await storage.addUserSkill(validatedData);
      res.json(userSkill);
    } catch (error) {
      console.error("Error adding user skill:", error);
      res.status(500).json({ message: "Failed to add user skill" });
    }
  });

  app.delete('/api/user-skills/:skillId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const skillId = parseInt(req.params.skillId);
      
      await storage.removeUserSkill(userId, skillId);
      res.json({ message: "User skill removed successfully" });
    } catch (error) {
      console.error("Error removing user skill:", error);
      res.status(500).json({ message: "Failed to remove user skill" });
    }
  });

  // Swap routes
  app.get('/api/swaps', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const swaps = await storage.getSwapsByUser(userId);
      res.json(swaps);
    } catch (error) {
      console.error("Error fetching swaps:", error);
      res.status(500).json({ message: "Failed to fetch swaps" });
    }
  });

  app.post('/api/swaps', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertSwapSchema.parse({
        ...req.body,
        requesterId: userId
      });
      
      const swap = await storage.createSwap(validatedData);
      res.json(swap);
    } catch (error) {
      console.error("Error creating swap:", error);
      res.status(500).json({ message: "Failed to create swap" });
    }
  });

  app.put('/api/swaps/:swapId/status', isAuthenticated, async (req: any, res) => {
    try {
      const swapId = parseInt(req.params.swapId);
      const { status } = req.body;
      
      await storage.updateSwapStatus(swapId, status);
      res.json({ message: "Swap status updated successfully" });
    } catch (error) {
      console.error("Error updating swap status:", error);
      res.status(500).json({ message: "Failed to update swap status" });
    }
  });

  app.get('/api/swap-matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await storage.getSwapMatches(userId);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching swap matches:", error);
      res.status(500).json({ message: "Failed to fetch swap matches" });
    }
  });

  // Session routes
  app.get('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.post('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(validatedData);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.get('/api/sessions/upcoming', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUpcomingSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching upcoming sessions:", error);
      res.status(500).json({ message: "Failed to fetch upcoming sessions" });
    }
  });

  app.put('/api/sessions/:sessionId/status', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const { status } = req.body;
      
      await storage.updateSessionStatus(sessionId, status);
      res.json({ message: "Session status updated successfully" });
    } catch (error) {
      console.error("Error updating session status:", error);
      res.status(500).json({ message: "Failed to update session status" });
    }
  });

  // Message routes
  app.get('/api/messages/:swapId', isAuthenticated, async (req: any, res) => {
    try {
      const swapId = parseInt(req.params.swapId);
      const messages = await storage.getMessagesBySwap(swapId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId
      });
      
      const message = await storage.sendMessage(validatedData);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getRecentMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching recent messages:", error);
      res.status(500).json({ message: "Failed to fetch recent messages" });
    }
  });

  app.put('/api/messages/:messageId/read', isAuthenticated, async (req: any, res) => {
    try {
      const messageId = parseInt(req.params.messageId);
      await storage.markMessageAsRead(messageId);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Review routes
  app.get('/api/reviews/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const reviews = await storage.getReviewsByUser(userId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        reviewerId: userId
      });
      
      const review = await storage.createReview(validatedData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/rating/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const rating = await storage.getUserRating(userId);
      res.json({ rating });
    } catch (error) {
      console.error("Error fetching user rating:", error);
      res.status(500).json({ message: "Failed to fetch user rating" });
    }
  });

  // Stats routes
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Broadcast message to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
