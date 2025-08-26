import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import TeacherDashboard from "@/pages/teacher-dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import { getCurrentUser, isTeacher, isStudent } from "@/lib/auth";

function Router() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/">
        {isTeacher(currentUser) ? <TeacherDashboard /> : <StudentDashboard />}
      </Route>
      <Route path="/teacher" component={TeacherDashboard} />
      <Route path="/student" component={StudentDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
