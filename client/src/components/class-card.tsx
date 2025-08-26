import { CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Class, Cancellation } from "@shared/schema";

interface ClassCardProps {
  class: Class;
  enrollmentCount: number;
  cancellation?: Cancellation;
}

export default function ClassCard({ class: cls, enrollmentCount, cancellation }: ClassCardProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const timeRange = `${formatTime(cls.startTime)} - ${formatTime(cls.endTime)}`;

  const getStatusColor = () => {
    if (cancellation) return "border-red-200 bg-red-50";
    return "border-green-200 bg-green-50";
  };

  const getStatusIcon = () => {
    if (cancellation) return <XCircle className="h-6 w-6 text-red-600" />;
    return <CheckCircle className="h-6 w-6 text-green-600" />;
  };

  const getStatusBadge = () => {
    if (cancellation) {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100" data-testid="badge-status-cancelled">
          Cancelled
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100" data-testid="badge-status-active">
        Active
      </Badge>
    );
  };

  return (
    <div className={`flex items-center p-4 border rounded-lg ${getStatusColor()}`} data-testid={`card-class-${cls.id}`}>
      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
        {getStatusIcon()}
      </div>
      <div className="ml-4 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold text-gray-900" data-testid={`text-class-name-${cls.id}`}>
              {cls.code} - {cls.name}
            </h3>
            <p className="text-xs text-gray-600" data-testid={`text-class-time-${cls.id}`}>
              {timeRange}
            </p>
            {cancellation ? (
              <p className="text-xs text-red-600 font-medium" data-testid={`text-cancellation-reason-${cls.id}`}>
                Cancelled - {cancellation.reason}
              </p>
            ) : (
              <p className="text-xs text-gray-500" data-testid={`text-class-room-${cls.id}`}>
                Room: {cls.room}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            <div className="flex items-center text-xs text-gray-500">
              <Users className="h-3 w-3 mr-1" />
              <span data-testid={`text-enrollment-count-${cls.id}`}>
                {enrollmentCount} student{enrollmentCount !== 1 ? 's' : ''}
                {cancellation && ' notified'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
