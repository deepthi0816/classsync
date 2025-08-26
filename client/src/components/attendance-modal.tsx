import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getCurrentUser } from "@/lib/auth";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, AlertTriangle, Users } from "lucide-react";
import type { Class, Attendance, Enrollment } from "@shared/schema";

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: Class[];
}

export default function AttendanceModal({ isOpen, onClose, classes }: AttendanceModalProps) {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: string; notes: string }>>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();

  // Get enrollments for selected class
  const { data: enrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments/class", selectedClassId],
    enabled: !!selectedClassId,
  });

  // Get existing attendance for the selected class and date
  const { data: existingAttendance = [] } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance/class", selectedClassId, "date", selectedDate],
    enabled: !!selectedClassId && !!selectedDate,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: any) => {
      return apiRequest("POST", "/api/attendance", attendanceData);
    },
    onSuccess: () => {
      toast({
        title: "Attendance Marked",
        description: "Student attendance has been successfully recorded.",
      });
      
      // Invalidate attendance queries
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClassId) {
      toast({
        title: "Missing Information",
        description: "Please select a class to mark attendance.",
        variant: "destructive",
      });
      return;
    }

    // Submit attendance for all students with marked status
    const attendancePromises = Object.entries(attendanceRecords)
      .filter(([_, record]) => record.status)
      .map(([studentId, record]) => 
        markAttendanceMutation.mutateAsync({
          classId: selectedClassId,
          studentId,
          teacherId: currentUser?.id,
          date: selectedDate,
          status: record.status,
          notes: record.notes || null
        })
      );

    try {
      await Promise.all(attendancePromises);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleClose = () => {
    setSelectedClassId("");
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
    setAttendanceRecords({});
    onClose();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "late":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "excused":
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-700";
      case "absent":
        return "bg-red-100 text-red-700";
      case "late":
        return "bg-yellow-100 text-yellow-700";
      case "excused":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Check if attendance already exists for this date
  const hasExistingAttendance = existingAttendance.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mark Attendance
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="class-select">Select Class</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger data-testid="select-attendance-class">
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id} data-testid={`option-attendance-class-${cls.id}`}>
                      {cls.code} - {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-select">Date</Label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="input-attendance-date"
              />
            </div>
          </div>

          {hasExistingAttendance && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Attendance already recorded for this date
                </span>
              </div>
              <p className="text-sm text-amber-600 mt-1">
                You can still update individual records below.
              </p>
            </div>
          )}

          {selectedClassId && enrollments.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Students ({enrollments.length})</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newRecords: Record<string, { status: string; notes: string }> = {};
                      enrollments.forEach(enrollment => {
                        newRecords[enrollment.studentId] = { status: "present", notes: "" };
                      });
                      setAttendanceRecords(newRecords);
                    }}
                    data-testid="button-mark-all-present"
                  >
                    Mark All Present
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {enrollments.map((enrollment) => {
                  const studentRecord = attendanceRecords[enrollment.studentId] || { status: "", notes: "" };
                  const existingRecord = existingAttendance.find(a => a.studentId === enrollment.studentId);
                  
                  return (
                    <div
                      key={enrollment.studentId}
                      className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50"
                      data-testid={`attendance-row-${enrollment.studentId}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">Student {enrollment.studentId}</p>
                        {existingRecord && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(existingRecord.status)}>
                              {getStatusIcon(existingRecord.status)}
                              <span className="ml-1 capitalize">{existingRecord.status}</span>
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Previously marked
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Select
                          value={studentRecord.status}
                          onValueChange={(value) => handleAttendanceChange(enrollment.studentId, value)}
                        >
                          <SelectTrigger className="w-32" data-testid={`select-status-${enrollment.studentId}`}>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="late">Late</SelectItem>
                            <SelectItem value="excused">Excused</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Textarea
                          placeholder="Notes (optional)"
                          value={studentRecord.notes}
                          onChange={(e) => handleNotesChange(enrollment.studentId, e.target.value)}
                          className="w-48 h-8 text-xs"
                          data-testid={`textarea-notes-${enrollment.studentId}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedClassId && enrollments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No students enrolled in this class</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              data-testid="button-cancel-attendance"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={markAttendanceMutation.isPending || !selectedClassId}
              data-testid="button-save-attendance"
            >
              {markAttendanceMutation.isPending ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}