import { Bell, ChevronDown, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentUser, clearCurrentUser } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import type { Notification } from "@shared/schema";

export default function Header() {
  const currentUser = getCurrentUser();
  
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications/user", currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    clearCurrentUser();
    window.location.reload();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-navy-600 mr-3" />
              <h1 className="text-2xl font-bold text-navy-800" data-testid="text-app-title">
                ClassSync
              </h1>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <a
                href="#"
                className="text-gray-900 hover:text-navy-600 px-3 py-2 text-sm font-medium"
                data-testid="link-dashboard"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-navy-600 px-3 py-2 text-sm font-medium"
                data-testid="link-classes"
              >
                Classes
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-navy-600 px-3 py-2 text-sm font-medium"
                data-testid="link-schedule"
              >
                Schedule
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-navy-600 px-3 py-2 text-sm font-medium"
                data-testid="link-history"
              >
                History
              </a>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="p-2 text-gray-400 hover:text-gray-500"
                data-testid="button-notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center p-0" data-testid="badge-notification-count">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Role Indicator */}
            <div className="bg-navy-100 text-navy-700 px-3 py-1 rounded-full text-sm font-medium" data-testid="badge-user-role">
              {currentUser?.role === "teacher" ? (
                <>
                  <GraduationCap className="w-4 h-4 mr-1 inline" />
                  Teacher
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4 mr-1 inline" />
                  Student
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2" data-testid="button-profile-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-navy-100 text-navy-700 text-sm">
                      {currentUser ? getInitials(currentUser.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-900" data-testid="text-user-name">
                    {currentUser?.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
