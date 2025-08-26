import { User } from "@shared/schema";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "teacher" | "student";
}

export const getCurrentUser = (): AuthUser | null => {
  const userStr = localStorage.getItem("currentUser");
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: AuthUser) => {
  localStorage.setItem("currentUser", JSON.stringify(user));
};

export const clearCurrentUser = () => {
  localStorage.removeItem("currentUser");
};

export const isTeacher = (user: AuthUser | null): boolean => {
  return user?.role === "teacher";
};

export const isStudent = (user: AuthUser | null): boolean => {
  return user?.role === "student";
};
