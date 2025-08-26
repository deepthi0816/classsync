import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCancellationSchema, insertNotificationSchema, insertAttendanceSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Class routes
  app.get("/api/classes/teacher/:teacherId", async (req, res) => {
    try {
      const classes = await storage.getClassesByTeacher(req.params.teacherId);
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/classes/student/:studentId", async (req, res) => {
    try {
      const classes = await storage.getClassesByStudent(req.params.studentId);
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Enrollment routes
  app.get("/api/enrollments/class/:classId", async (req, res) => {
    try {
      const enrollments = await storage.getEnrollmentsByClass(req.params.classId);
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Cancellation routes
  app.post("/api/cancellations", async (req, res) => {
    try {
      const cancellationData = insertCancellationSchema.parse(req.body);
      const cancellation = await storage.createCancellation(cancellationData);
      
      // Get enrolled students for notification
      const enrollments = await storage.getEnrollmentsByClass(cancellationData.classId);
      const classInfo = await storage.getClass(cancellationData.classId);
      
      // Create notifications for all enrolled students
      const notifications = await Promise.all(
        enrollments.map(enrollment => 
          storage.createNotification({
            userId: enrollment.studentId,
            title: "Class Cancelled",
            message: `${classInfo?.code} - ${classInfo?.name} has been cancelled. Reason: ${cancellationData.reason}`,
            type: "cancellation"
          })
        )
      );

      res.json({ cancellation, notificationsCreated: notifications.length });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/cancellations/teacher/:teacherId", async (req, res) => {
    try {
      const cancellations = await storage.getCancellationsByTeacher(req.params.teacherId);
      res.json(cancellations);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/cancellations/class/:classId", async (req, res) => {
    try {
      const cancellations = await storage.getCancellationsByClass(req.params.classId);
      res.json(cancellations);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Notification routes
  app.get("/api/notifications/user/:userId", async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.params.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Attendance routes
  app.post("/api/attendance", async (req, res) => {
    try {
      const attendanceData = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.markAttendance(attendanceData);
      res.json(attendance);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.get("/api/attendance/class/:classId/date/:date", async (req, res) => {
    try {
      const attendance = await storage.getAttendanceByClassAndDate(req.params.classId, req.params.date);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/attendance/student/:studentId", async (req, res) => {
    try {
      const attendance = await storage.getAttendanceByStudent(req.params.studentId);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/attendance/:id", async (req, res) => {
    try {
      const updates = req.body;
      const attendance = await storage.updateAttendance(req.params.id, updates);
      if (!attendance) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Dashboard stats
  app.get("/api/stats/teacher/:teacherId", async (req, res) => {
    try {
      const classes = await storage.getClassesByTeacher(req.params.teacherId);
      const cancellations = await storage.getCancellationsByTeacher(req.params.teacherId);
      
      // Get enrollment count for each class
      const classEnrollments = [];
      for (const cls of classes) {
        const enrollments = await storage.getEnrollmentsByClass(cls.id);
        classEnrollments.push({
          classId: cls.id,
          className: cls.name,
          classCode: cls.code,
          enrollmentCount: enrollments.length
        });
      }

      // Get this week's cancellations (simplified - just count all for demo)
      const weekCancellations = cancellations.length;

      res.json({
        classEnrollments,
        activeClasses: classes.filter(cls => cls.isActive).length,
        weekCancellations
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
