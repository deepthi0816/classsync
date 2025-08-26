import { 
  type User, 
  type InsertUser, 
  type Class, 
  type InsertClass,
  type Enrollment, 
  type InsertEnrollment,
  type Cancellation, 
  type InsertCancellation,
  type Notification, 
  type InsertNotification,
  type Attendance,
  type InsertAttendance
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Classes
  getClass(id: string): Promise<Class | undefined>;
  getClassesByTeacher(teacherId: string): Promise<Class[]>;
  getClassesByStudent(studentId: string): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, updates: Partial<Class>): Promise<Class | undefined>;
  
  // Enrollments
  enrollStudent(enrollment: InsertEnrollment): Promise<Enrollment>;
  getEnrollmentsByClass(classId: string): Promise<Enrollment[]>;
  getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]>;
  
  // Cancellations
  createCancellation(cancellation: InsertCancellation): Promise<Cancellation>;
  getCancellationsByTeacher(teacherId: string): Promise<Cancellation[]>;
  getCancellationsByClass(classId: string): Promise<Cancellation[]>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  
  // Attendance
  markAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getAttendanceByClass(classId: string, date: string): Promise<Attendance[]>;
  getAttendanceByStudent(studentId: string): Promise<Attendance[]>;
  getAttendanceByClassAndDate(classId: string, date: string): Promise<Attendance[]>;
  updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private classes: Map<string, Class> = new Map();
  private enrollments: Map<string, Enrollment> = new Map();
  private cancellations: Map<string, Cancellation> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private attendance: Map<string, Attendance> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create teacher
    const teacher: User = {
      id: "teacher-1",
      email: "professor.anderson@university.edu",
      name: "Prof. Anderson",
      role: "teacher",
      password: "password123"
    };
    this.users.set(teacher.id, teacher);

    // Create students
    const students: User[] = [
      {
        id: "student-1",
        email: "john.doe@student.edu",
        name: "John Doe",
        role: "student",
        password: "password123"
      },
      {
        id: "student-2",
        email: "sarah.johnson@student.edu",
        name: "Sarah Johnson",
        role: "student",
        password: "password123"
      },
      {
        id: "student-3",
        email: "mike.chen@student.edu",
        name: "Mike Chen",
        role: "student",
        password: "password123"
      }
    ];
    students.forEach(student => this.users.set(student.id, student));

    // Create classes
    const classes: Class[] = [
      {
        id: "class-1",
        name: "Data Structures",
        code: "CS 201",
        teacherId: teacher.id,
        room: "Engineering Hall 205",
        dayOfWeek: 2, // Tuesday
        startTime: "09:00",
        endTime: "10:30",
        isActive: true
      },
      {
        id: "class-2",
        name: "Database Systems",
        code: "CS 301",
        teacherId: teacher.id,
        room: "Engineering Hall 210",
        dayOfWeek: 2, // Tuesday
        startTime: "14:00",
        endTime: "15:30",
        isActive: true
      },
      {
        id: "class-3",
        name: "Software Engineering",
        code: "CS 401",
        teacherId: teacher.id,
        room: "Engineering Hall 301",
        dayOfWeek: 2, // Tuesday
        startTime: "16:00",
        endTime: "17:30",
        isActive: true
      }
    ];
    classes.forEach(cls => this.classes.set(cls.id, cls));

    // Create enrollments
    const enrollments: Enrollment[] = [
      {
        id: "enrollment-1",
        studentId: "student-1",
        classId: "class-1",
        enrolledAt: new Date()
      },
      {
        id: "enrollment-2",
        studentId: "student-2",
        classId: "class-1",
        enrolledAt: new Date()
      },
      {
        id: "enrollment-3",
        studentId: "student-3",
        classId: "class-1",
        enrolledAt: new Date()
      },
      {
        id: "enrollment-4",
        studentId: "student-1",
        classId: "class-2",
        enrolledAt: new Date()
      },
      {
        id: "enrollment-5",
        studentId: "student-2",
        classId: "class-2",
        enrolledAt: new Date()
      },
      {
        id: "enrollment-6",
        studentId: "student-1",
        classId: "class-3",
        enrolledAt: new Date()
      }
    ];
    enrollments.forEach(enrollment => this.enrollments.set(enrollment.id, enrollment));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getClass(id: string): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    return Array.from(this.classes.values()).filter(cls => cls.teacherId === teacherId);
  }

  async getClassesByStudent(studentId: string): Promise<Class[]> {
    const studentEnrollments = Array.from(this.enrollments.values())
      .filter(enrollment => enrollment.studentId === studentId);
    
    const classIds = studentEnrollments.map(enrollment => enrollment.classId);
    return Array.from(this.classes.values())
      .filter(cls => classIds.includes(cls.id));
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const id = randomUUID();
    const cls: Class = { ...classData, id, isActive: classData.isActive ?? true };
    this.classes.set(id, cls);
    return cls;
  }

  async updateClass(id: string, updates: Partial<Class>): Promise<Class | undefined> {
    const existingClass = this.classes.get(id);
    if (!existingClass) return undefined;
    
    const updatedClass = { ...existingClass, ...updates };
    this.classes.set(id, updatedClass);
    return updatedClass;
  }

  async enrollStudent(enrollment: InsertEnrollment): Promise<Enrollment> {
    const id = randomUUID();
    const newEnrollment: Enrollment = { 
      ...enrollment, 
      id, 
      enrolledAt: new Date() 
    };
    this.enrollments.set(id, newEnrollment);
    return newEnrollment;
  }

  async getEnrollmentsByClass(classId: string): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values())
      .filter(enrollment => enrollment.classId === classId);
  }

  async getEnrollmentsByStudent(studentId: string): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values())
      .filter(enrollment => enrollment.studentId === studentId);
  }

  async createCancellation(cancellation: InsertCancellation): Promise<Cancellation> {
    const id = randomUUID();
    const newCancellation: Cancellation = { 
      ...cancellation, 
      id, 
      cancelledAt: new Date(),
      additionalNotes: cancellation.additionalNotes ?? null,
      willReschedule: cancellation.willReschedule ?? false
    };
    this.cancellations.set(id, newCancellation);
    return newCancellation;
  }

  async getCancellationsByTeacher(teacherId: string): Promise<Cancellation[]> {
    return Array.from(this.cancellations.values())
      .filter(cancellation => cancellation.teacherId === teacherId);
  }

  async getCancellationsByClass(classId: string): Promise<Cancellation[]> {
    return Array.from(this.cancellations.values())
      .filter(cancellation => cancellation.classId === classId);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const newNotification: Notification = { 
      ...notification, 
      id, 
      createdAt: new Date(),
      isRead: notification.isRead ?? false
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      this.notifications.set(id, { ...notification, isRead: true });
    }
  }

  async markAttendance(attendance: InsertAttendance): Promise<Attendance> {
    const id = randomUUID();
    const newAttendance: Attendance = {
      ...attendance,
      id,
      markedAt: new Date(),
      notes: attendance.notes ?? null
    };
    this.attendance.set(id, newAttendance);
    return newAttendance;
  }

  async getAttendanceByClass(classId: string, date: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values())
      .filter(attendance => attendance.classId === classId && attendance.date === date);
  }

  async getAttendanceByStudent(studentId: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values())
      .filter(attendance => attendance.studentId === studentId)
      .sort((a, b) => b.markedAt.getTime() - a.markedAt.getTime());
  }

  async getAttendanceByClassAndDate(classId: string, date: string): Promise<Attendance[]> {
    return Array.from(this.attendance.values())
      .filter(attendance => attendance.classId === classId && attendance.date === date);
  }

  async updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance | undefined> {
    const existingAttendance = this.attendance.get(id);
    if (!existingAttendance) return undefined;
    
    const updatedAttendance = { ...existingAttendance, ...updates };
    this.attendance.set(id, updatedAttendance);
    return updatedAttendance;
  }
}

export const storage = new MemStorage();
