import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Ban, Users, BookOpen, AlertTriangle, ClipboardCheck } from "lucide-react";
import Header from "@/components/header";
import CancelClassModal from "@/components/cancel-class-modal";
import AttendanceModal from "@/components/attendance-modal";
import ClassCard from "@/components/class-card";
import StatsCard from "@/components/stats-card";
import NotificationBanner from "@/components/notification-banner";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import type { Class, Cancellation } from "@shared/schema";

export default function TeacherDashboard() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const currentUser = getCurrentUser();

  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes/teacher", currentUser?.id],
  });

  const { data: cancellations = [] } = useQuery<Cancellation[]>({
    queryKey: ["/api/cancellations/teacher", currentUser?.id],
  });

  const { data: stats } = useQuery<{
    classEnrollments: {
      classId: string;
      className: string;
      classCode: string;
      enrollmentCount: number;
    }[];
    activeClasses: number;
    weekCancellations: number;
  }>({
    queryKey: ["/api/stats/teacher", currentUser?.id],
  });

  // Get today's classes and their cancellation status
  const today = new Date();
  const todayClasses = classes.filter(cls => {
    return cls.dayOfWeek === today.getDay();
  });

  // Get today's cancellations
  const todayFormatted = format(today, "yyyy-MM-dd");
  const todayCancellations = cancellations.filter(c => c.date === todayFormatted);

  // Get enrollment counts for each class from stats data
  const getEnrollmentCount = (classId: string) => {
    const classData = stats?.classEnrollments?.find(c => c.classId === classId);
    return classData?.enrollmentCount || 0;
  };

  const getCancellationForClass = (classId: string) => {
    return todayCancellations.find(c => c.classId === classId);
  };

  const recentCancellation = cancellations[0];

  if (classesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
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
        {/* Alert Banner */}
        {showBanner && recentCancellation && (
          <NotificationBanner
            message={`Class Cancelled: ${classes.find(c => c.id === recentCancellation.classId)?.code} - ${classes.find(c => c.id === recentCancellation.classId)?.name} has been cancelled. Students have been notified.`}
            onDismiss={() => setShowBanner(false)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & Today's Schedule */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4" data-testid="text-quick-actions-title">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => setShowCancelModal(true)}
                    variant="outline"
                    className="flex items-center justify-center px-4 py-3 border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
                    data-testid="button-cancel-class"
                  >
                    <Ban className="mr-3 h-5 w-5" />
                    Cancel Class
                  </Button>
                  <Button
                    onClick={() => setShowAttendanceModal(true)}
                    variant="outline"
                    className="flex items-center justify-center px-4 py-3 border-green-200 bg-green-50 hover:bg-green-100 text-green-700"
                    data-testid="button-mark-attendance"
                  >
                    <ClipboardCheck className="mr-3 h-5 w-5" />
                    Mark Attendance
                  </Button>
                </div>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900" data-testid="text-schedule-title">
                    Today's Schedule
                  </h2>
                  <span className="text-sm text-gray-500" data-testid="text-today-date">
                    {format(today, "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {todayClasses.length === 0 ? (
                    <p className="text-gray-500 text-center py-8" data-testid="text-no-classes">
                      No classes scheduled for today
                    </p>
                  ) : (
                    todayClasses.map((cls) => (
                      <ClassCard
                        key={cls.id}
                        class={cls}
                        enrollmentCount={getEnrollmentCount(cls.id)}
                        cancellation={getCancellationForClass(cls.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Recent Activity */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="space-y-4">
              {/* Class Enrollments */}
              {stats?.classEnrollments?.map((classData) => (
                <StatsCard
                  key={classData.classId}
                  title={`${classData.classCode} Students`}
                  value={classData.enrollmentCount}
                  icon={<Users className="h-6 w-6 text-blue-600" />}
                  iconBgColor="bg-blue-100"
                  testId={`stats-class-${classData.classId}-students`}
                />
              ))}
              
              <StatsCard
                title="Active Classes"
                value={stats?.activeClasses || 0}
                icon={<BookOpen className="h-6 w-6 text-green-600" />}
                iconBgColor="bg-green-100"
                testId="stats-active-classes"
              />
              <StatsCard
                title="This Week's Cancellations"
                value={stats?.weekCancellations || 0}
                icon={<AlertTriangle className="h-6 w-6 text-amber-600" />}
                iconBgColor="bg-amber-100"
                testId="stats-week-cancellations"
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-testid="text-recent-activity-title">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {cancellations.slice(0, 3).map((cancellation) => {
                    const cls = classes.find(c => c.id === cancellation.classId);
                    return (
                      <div key={cancellation.id} className="flex items-start space-x-3" data-testid={`activity-${cancellation.id}`}>
                        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <Ban className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900" data-testid={`text-activity-description-${cancellation.id}`}>
                            Cancelled {cls?.code} - {cls?.name}
                          </p>
                          <p className="text-xs text-gray-500" data-testid={`text-activity-time-${cancellation.id}`}>
                            {format(cancellation.cancelledAt, "MMM d 'at' h:mm a")} • {cancellation.reason}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {cancellations.length === 0 && (
                    <p className="text-gray-500 text-sm" data-testid="text-no-recent-activity">
                      No recent activity
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CancelClassModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        classes={classes}
      />

      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        classes={classes}
      />
    </div>
  );
}
