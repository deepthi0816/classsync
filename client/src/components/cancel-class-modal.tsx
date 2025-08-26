import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getCurrentUser } from "@/lib/auth";
import type { Class } from "@shared/schema";
import { format } from "date-fns";

interface CancelClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: Class[];
}

export default function CancelClassModal({ isOpen, onClose, classes }: CancelClassModalProps) {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [reason, setReason] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [willReschedule, setWillReschedule] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();

  const today = format(new Date(), "yyyy-MM-dd");

  const cancelClassMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/cancellations", data);
    },
    onSuccess: async (response) => {
      const result = await response.json();
      toast({
        title: "Class Cancelled",
        description: `Class has been cancelled and ${result.notificationsCreated} students have been notified.`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/classes/teacher"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cancellations/teacher"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/teacher"] });
      
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel class. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClassId || !reason) {
      toast({
        title: "Missing Information",
        description: "Please select a class and provide a reason for cancellation.",
        variant: "destructive",
      });
      return;
    }

    cancelClassMutation.mutate({
      classId: selectedClassId,
      teacherId: currentUser?.id,
      reason,
      additionalNotes,
      willReschedule,
      date: today,
    });
  };

  const handleClose = () => {
    setSelectedClassId("");
    setReason("");
    setAdditionalNotes("");
    setWillReschedule(false);
    onClose();
  };

  const formatClassTime = (startTime: string, endTime: string) => {
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Class</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="class-select">Select Class</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger data-testid="select-class">
                <SelectValue placeholder="Choose a class to cancel" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id} data-testid={`option-class-${cls.id}`}>
                    {cls.code} - {cls.name} ({formatClassTime(cls.startTime, cls.endTime)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason-select">Reason for Cancellation</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger data-testid="select-reason">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="illness" data-testid="option-reason-illness">Professor illness</SelectItem>
                <SelectItem value="emergency" data-testid="option-reason-emergency">Emergency</SelectItem>
                <SelectItem value="weather" data-testid="option-reason-weather">Weather conditions</SelectItem>
                <SelectItem value="technical" data-testid="option-reason-technical">Technical difficulties</SelectItem>
                <SelectItem value="other" data-testid="option-reason-other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="additional-notes">Additional Details (optional)</Label>
            <Textarea
              id="additional-notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Additional details"
              rows={3}
              data-testid="textarea-notes"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="reschedule"
              checked={willReschedule}
              onCheckedChange={(checked) => setWillReschedule(checked as boolean)}
              data-testid="checkbox-reschedule"
            />
            <Label htmlFor="reschedule" className="text-sm">
              I plan to reschedule this class
            </Label>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              data-testid="button-cancel-modal"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={cancelClassMutation.isPending}
              data-testid="button-confirm-cancel"
            >
              {cancelClassMutation.isPending 
                ? "Cancelling..." 
                : "Cancel Class & Notify Students"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
