import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationBannerProps {
  message: string;
  onDismiss: () => void;
}

export default function NotificationBanner({ message, onDismiss }: NotificationBannerProps) {
  return (
    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4" data-testid="banner-notification">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-amber-700" data-testid="text-notification-message">
            {message}
          </p>
        </div>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-amber-400 hover:text-amber-500 p-1"
            data-testid="button-dismiss-notification"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
