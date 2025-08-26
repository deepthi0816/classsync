import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { BookOpen, Clock, MapPin, AlertCircle, CheckCircle, XCircle, ClipboardCheck } from "lucide-react";
import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import type { Class, Notification, Attendance } from "@shared/schema";

export default function StudentDashboard() {
  const currentUser = getCurrentUser();

  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes/student", currentUser?.id],
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications/user", currentUser?.id],
  });

  const { data: attendance = [] } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance/student", currentUser?.id],
  });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayOfWeek];
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  const getAttendanceStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-700";
      case "absent":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Calculate attendance stats
  const attendanceStats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === "present").length,
    absent: attendance.filter(a => a.status === "absent").length,
  };

  const attendanceRate = attendanceStats.total > 0 
    ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
    : 0;

  const isLowAttendance = attendanceRate < 75;

  if (classesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">
            Student Dashboard
          </h1>
          <p className="text-gray-600" data-testid="text-welcome-message">
            Welcome back, {currentUser?.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Enrolled Classes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900" data-testid="text-enrolled-classes-title">
                    My Enrolled Classes
                  </h2>
                  <Badge className="bg-navy-100 text-navy-700" data-testid="badge-class-count">
                    {classes.length} Classes
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  {classes.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500" data-testid="text-no-classes">
                        No enrolled classes
                      </p>
                    </div>
                  ) : (
                    classes.map((cls) => (
                      <div
                        key={cls.id}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        data-testid={`card-enrolled-class-${cls.id}`}
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-navy-600" />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900" data-testid={`text-class-name-${cls.id}`}>
                                {cls.code} - {cls.name}
                              </h3>
                              <div className="flex items-center text-xs text-gray-600 mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                <span data-testid={`text-class-schedule-${cls.id}`}>
                                  {getDayName(cls.dayOfWeek)} {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                                </span>
                              </div>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span data-testid={`text-class-room-${cls.id}`}>
                                  {cls.room}
                                </span>
                              </div>
                            </div>
                            <Badge 
                              className="bg-green-100 text-green-700 hover:bg-green-100"
                              data-testid={`badge-class-status-${cls.id}`}
                            >
                              Enrolled
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900" data-testid="text-attendance-overview-title">
                    Attendance Overview
                  </h2>
                  <Badge className={isLowAttendance ? "bg-red-100 text-red-700" : "bg-navy-100 text-navy-700"} data-testid="badge-attendance-rate">
                    {attendanceRate}% Attendance Rate
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600" data-testid="text-present-count">
                      {attendanceStats.present}
                    </div>
                    <div className="text-xs text-gray-500">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600" data-testid="text-absent-count">
                      {attendanceStats.absent}
                    </div>
                    <div className="text-xs text-gray-500">Absent</div>
                  </div>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {attendance.length === 0 ? (
                    <div className="text-center py-8">
                      <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500" data-testid="text-no-attendance">
                        No attendance records yet
                      </p>
                    </div>
                  ) : (
                    attendance.slice(0, 10).map((record) => {
                      const cls = classes.find(c => c.id === record.classId);
                      return (
                        <div
                          key={record.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                          data-testid={`attendance-record-${record.id}`}
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900" data-testid={`text-attendance-class-${record.id}`}>
                              {cls?.code} - {cls?.name}
                            </p>
                            <p className="text-xs text-gray-500" data-testid={`text-attendance-date-${record.id}`}>
                              {format(new Date(record.date), "MMM d, yyyy")}
                            </p>
                            {record.notes && (
                              <p className="text-xs text-gray-600 mt-1" data-testid={`text-attendance-notes-${record.id}`}>
                                Note: {record.notes}
                              </p>
                            )}
                          </div>
                          <Badge 
                            className={getAttendanceStatusColor(record.status)}
                            data-testid={`badge-attendance-status-${record.id}`}
                          >
                            {getAttendanceStatusIcon(record.status)}
                            <span className="ml-1 capitalize">{record.status}</span>
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Notifications */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900" data-testid="text-notifications-title">
                    Notifications
                  </h3>
                  {unreadNotifications.length > 0 && (
                    <Badge className="bg-red-100 text-red-700" data-testid="badge-unread-count">
                      {unreadNotifications.length} new
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500" data-testid="text-no-notifications">
                        No notifications
                      </p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          !notification.isRead 
                            ? 'border-red-200 bg-red-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                        data-testid={`notification-${notification.id}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            notification.type === 'cancellation' 
                              ? 'bg-red-100' 
                              : 'bg-blue-100'
                          }`}>
                            {notification.type === 'cancellation' ? (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <BookOpen className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`} data-testid={`text-notification-title-${notification.id}`}>
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1" data-testid={`text-notification-message-${notification.id}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1" data-testid={`text-notification-time-${notification.id}`}>
                              {format(notification.createdAt, "MMM d 'at' h:mm a")}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-red-500 rounded-full" data-testid={`indicator-unread-${notification.id}`}></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
