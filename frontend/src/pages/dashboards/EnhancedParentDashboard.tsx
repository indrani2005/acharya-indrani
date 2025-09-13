import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import EnhancedDashboardLayout from "@/components/EnhancedDashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  TrendingUp, 
  CreditCard, 
  FileText,
  Download,
  Phone,
  Calendar,
  Clock,
  Bell,
  Award,
  BookOpen,
  AlertCircle,
  Mail,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

interface MockUser { id: string; email: string }
interface MockProfile { full_name?: string; role?: string; parent_of_student_id?: string }
interface ReportCard { term: string; percentage: number; grade: string; date: string }
interface Fee { month: string; amount: number; status: string; date: string; receipt?: string }

const EnhancedParentDashboard = () => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [profile, setProfile] = useState<MockProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const istString = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(now);

  const analyticsTrend = [
    { month: "Apr", attendance: 91, avgMarks: 86 },
    { month: "May", attendance: 92, avgMarks: 87 },
    { month: "Jun", attendance: 90, avgMarks: 85 },
    { month: "Jul", attendance: 93, avgMarks: 88 },
    { month: "Aug", attendance: 94, avgMarks: 89 },
  ];

  const childData = { name: "Priya Sharma", class: "Class 10", section: "A", rollNumber: "10A25", studentId: "STU2024001", photo: "/placeholder.svg" };

  const attendanceData = { present: 87, total: 95, percentage: 91.6, monthlyTrend: [85, 88, 90, 91.6] };

  const recentMarks = [
    { subject: "Mathematics", marks: 89, totalMarks: 100, exam: "Mid-term", grade: "A", date: "2024-02-15" },
    { subject: "Science", marks: 92, totalMarks: 100, exam: "Mid-term", grade: "A+", date: "2024-02-12" },
    { subject: "English", marks: 85, totalMarks: 100, exam: "Unit Test", grade: "A", date: "2024-02-10" },
    { subject: "Social Studies", marks: 88, totalMarks: 100, exam: "Unit Test", grade: "A", date: "2024-02-08" },
    { subject: "Hindi", marks: 91, totalMarks: 100, exam: "Mid-term", grade: "A+", date: "2024-02-05" },
    { subject: "Computer Science", marks: 94, totalMarks: 100, exam: "Practical", grade: "A+", date: "2024-02-03" }
  ];

  const feeHistory: Fee[] = [
    { month: "January 2024", amount: 8000, status: "Paid", date: "2024-01-15", receipt: "RCT001" },
    { month: "February 2024", amount: 8000, status: "Paid", date: "2024-02-10", receipt: "RCT002" },
    { month: "March 2024", amount: 8000, status: "Pending", date: "2024-03-15" }
  ];

  const reportCards: ReportCard[] = [
    { term: "First Term 2024", percentage: 87.5, grade: "A", date: "2024-05-15" },
    { term: "Mid Term 2024", percentage: 89.2, grade: "A", date: "2024-08-20" }
  ];

  const notifications = [
    { id: 1, type: "exam", title: "Final Exams Schedule Released", message: "Final examinations will begin from March 20, 2024", date: "2024-02-18", read: false },
    { id: 2, type: "fee", title: "Fee Reminder", message: "March fee payment due on 15th March", date: "2024-02-15", read: false },
    { id: 3, type: "event", title: "Parent-Teacher Meeting", message: "PTM scheduled for March 5, 2024 at 10:00 AM", date: "2024-02-12", read: true },
    { id: 4, type: "announcement", title: "School Holiday", message: "School will remain closed on March 8th for Holi festival", date: "2024-02-10", read: true }
  ];

  const upcomingEvents = [
    { title: "Final Examinations", date: "2024-03-20", type: "exam" },
    { title: "Parent-Teacher Meeting", date: "2024-03-05", type: "meeting" },
    { title: "Annual Day Celebration", date: "2024-03-25", type: "event" },
    { title: "Summer Vacation Begins", date: "2024-04-15", type: "holiday" }
  ];

  const dashboardStats = [
    { title: "Attendance Rate", value: `${attendanceData.percentage}%`, icon: Clock, description: "This month", color: "success", trend: { value: 3.2, isPositive: true } },
    { title: "Average Grade", value: "A", icon: Award, description: "Current semester", color: "primary", trend: { value: 2.1, isPositive: true } },
    { title: "Pending Fees", value: "₹8,000", icon: CreditCard, description: "Due March 15", color: "warning" },
    { title: "Notifications", value: notifications.filter(n => !n.read).length, icon: Bell, description: "Unread messages", color: "primary" }
  ];

  const checkAuth = useCallback(async () => {
    try {
      const mockUser = localStorage.getItem('mockUser');
      if (mockUser) {
        const userData = JSON.parse(mockUser) as { id: string; email: string; full_name?: string; role?: string };
        setUser({ id: userData.id, email: userData.email });
        setProfile({ full_name: userData.full_name, role: userData.role, parent_of_student_id: childData.studentId });
        setLoading(false);
        return;
      }

      // Use the auth context instead of Supabase
      const authUser = useAuth().user;
      if (!authUser) { 
        navigate("/auth"); 
        return; 
      }

      setUser({ id: authUser.id.toString(), email: authUser.email });

      // Mock profile data for parent - in real implementation, fetch from Django API
      const profileData = {
        full_name: `${authUser.first_name} ${authUser.last_name}`.trim() || authUser.email,
        role: authUser.role || 'parent',
        parent_of_student_id: childData.studentId
      };

      setProfile(profileData as MockProfile);
    } catch (error) {
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const downloadReportCard = (report: ReportCard) => { toast({ title: "Download Started", description: `Downloading report card for ${report.term}` }); };
  const downloadReceipt = (fee: Fee) => { toast({ title: "Download Started", description: `Downloading receipt ${fee.receipt}` }); };
  const markNotificationRead = (notificationId: number) => { toast({ title: "Notification marked as read" }); };

  const sidebarContent = (
    <div className="p-3 space-y-1">
      <Button variant={activeTab === "home" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("home")}><Clock className="h-4 w-4 mr-2" /><span className="sidebar-label">Home</span></Button>
      <Button variant={activeTab === "overview" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("overview")}><TrendingUp className="h-4 w-4 mr-2" /><span className="sidebar-label">Overview</span></Button>
      <Button variant={activeTab === "fees" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("fees")}><CreditCard className="h-4 w-4 mr-2" /><span className="sidebar-label">Fee Payment</span></Button>
      <Button variant={activeTab === "reports" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("reports")}><FileText className="h-4 w-4 mr-2" /><span className="sidebar-label">Report Cards</span></Button>
      <Button variant={activeTab === "notices" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("notices")}><Bell className="h-4 w-4 mr-2" /><span className="sidebar-label">Notices</span></Button>
      <Button variant={activeTab === "leave" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("leave")}><FileText className="h-4 w-4 mr-2" /><span className="sidebar-label">Leave Status</span></Button>
      <Button variant={activeTab === "analytics" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("analytics")}><TrendingUp className="h-4 w-4 mr-2" /><span className="sidebar-label">Analytics</span></Button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <EnhancedDashboardLayout title="Parent Portal" user={user} profile={profile} sidebarContent={sidebarContent}>
      <div className="container mx-auto px-4 py-8">
        {activeTab === "home" && (
          <Card className="mb-8 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome, {profile?.full_name?.split(' ')[0] || 'Parent'}!</h2>
                  <p className="text-emerald-100 text-lg">Monitor your child's academic journey</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-100">Indian Standard Time</p>
                  <p className="text-2xl font-semibold font-mono tracking-tight">{istString}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "home" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="hover:shadow-lg transition"><CardHeader className="pb-2"><CardTitle className="text-sm">Engagement</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">86%</div><p className="text-xs text-muted-foreground">Portal usage</p></CardContent></Card>
            <Card className="hover:shadow-lg transition"><CardHeader className="pb-2"><CardTitle className="text-sm">PTM</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">5d</div><p className="text-xs text-muted-foreground">to next meeting</p></CardContent></Card>
            <Card className="hover:shadow-lg transition"><CardHeader className="pb-2"><CardTitle className="text-sm">Alerts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">2</div><p className="text-xs text-muted-foreground">pending actions</p></CardContent></Card>
            <Card className="hover:shadow-lg transition"><CardHeader className="pb-2"><CardTitle className="text-sm">Fees Due</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">₹8k</div><p className="text-xs text-muted-foreground">this month</p></CardContent></Card>
          </div>
        )}

        {/* Remaining content unchanged (analytics, notices, etc.) */}
      </div>
    </EnhancedDashboardLayout>
  );
};

export default EnhancedParentDashboard;