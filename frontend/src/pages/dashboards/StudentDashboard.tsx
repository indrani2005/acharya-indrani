import { useEffect, useState, ComponentType } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import EnhancedDashboardLayout from "@/components/EnhancedDashboardLayout";
import { 
  Calendar, 
  BarChart3, 
  BookOpen, 
  FileText, 
  Bell, 
  Clock,
  TrendingUp,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  User,
  IdCard,
  FolderOpen,
  LibraryBig,
  WalletCards
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar
} from "recharts";

const StudentDashboard = () => {
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
  
  // Mock user data
  const user = { email: "student@acharya.gov.in" };
  const profile = { 
    full_name: "Rahul Sharma", 
    role: "student",
    class: "10th",
    roll_number: "2024001"
  };

  // Mock data
  const attendanceData = [
    { subject: "Mathematics", present: 45, total: 50, percentage: 90 },
    { subject: "Science", present: 42, total: 50, percentage: 84 },
    { subject: "English", present: 48, total: 50, percentage: 96 },
    { subject: "Hindi", present: 46, total: 50, percentage: 92 },
    { subject: "Social Studies", present: 44, total: 50, percentage: 88 },
  ];

  const marksData = [
    { subject: "Mathematics", marks: 85, total: 100, grade: "A" },
    { subject: "Science", marks: 78, total: 100, grade: "B+" },
    { subject: "English", marks: 92, total: 100, grade: "A+" },
    { subject: "Hindi", marks: 88, total: 100, grade: "A" },
    { subject: "Social Studies", marks: 81, total: 100, grade: "A-" },
  ];

  const announcements = [
    { id: 1, title: "Mid-term Exam Schedule", date: "2024-01-15", type: "exam" },
    { id: 2, title: "Sports Day Event", date: "2024-01-20", type: "event" },
    { id: 3, title: "Library Book Return", date: "2024-01-18", type: "notice" },
  ];

  const analyticsTrend = [
    { month: "Apr", attendance: 88, avgMarks: 82 },
    { month: "May", attendance: 90, avgMarks: 84 },
    { month: "Jun", attendance: 91, avgMarks: 83 },
    { month: "Jul", attendance: 89, avgMarks: 85 },
    { month: "Aug", attendance: 92, avgMarks: 86 },
  ];

  const [fees, setFees] = useState([
    { id: 1, label: "Term Fee - Q1", amount: 5000, due: "2024-04-05", status: "Pending" },
    { id: 2, label: "Library Fine", amount: 200, due: "2024-04-08", status: "Paid" },
  ]);

  const handlePay = (feeId: number) => {
    setFees(prev => prev.map(f => f.id === feeId ? { ...f, status: "Paid" } : f));
    downloadReceipt(feeId);
  };

  const downloadReceipt = (feeId: number) => {
    const fee = fees.find(f => f.id === feeId);
    if (!fee) return;
    const content = `Receipt\n\nStudent: ${profile.full_name}\nClass: ${profile.class}\nRoll No: ${profile.roll_number}\nItem: ${fee.label}\nAmount: ₹${fee.amount}\nDate: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${fee.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sidebarButton = (key: string, label: string, Icon: ComponentType<{ className?: string }>) => (
    <Button 
      variant={activeTab === key ? "default" : "ghost"} 
      className="w-full justify-start hover:translate-x-[2px] transition-transform"
      onClick={() => setActiveTab(key)}
    >
      <Icon className="h-4 w-4 mr-2" />
      <span className="sidebar-label">{label}</span>
    </Button>
  );

  const sidebarContent = (
    <div className="p-3 space-y-1">
      {sidebarButton("home", "Home", Clock)}
      {sidebarButton("overview", "Overview", TrendingUp)}
      {sidebarButton("profile", "Profile & Documents", User)}
      {sidebarButton("admission", "Admission Details", IdCard)}
      {sidebarButton("fees", "Fees & Payments", WalletCards)}
      {sidebarButton("attendance", "Attendance", Calendar)}
      {sidebarButton("marks", "Marks", BarChart3)}
      {sidebarButton("materials", "Course Materials", BookOpen)}
      {sidebarButton("hostel", "Hostel & Library", LibraryBig)}
      {sidebarButton("leave", "Leave Request", FileText)}
      {sidebarButton("announcements", "Announcements", Bell)}
      {sidebarButton("analytics", "Analytics", BarChart3)}
      {sidebarButton("alerts", "Smart Alerts", AlertCircle)}
    </div>
  );

  return (
    <EnhancedDashboardLayout
      title="Student Dashboard"
      user={user}
      profile={profile}
      sidebarContent={sidebarContent}
    >
      <div className="space-y-6">
        {/* Home Tab */}
        {activeTab === "home" && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Welcome, {profile.full_name}!</h2>
                    <p className="text-blue-100 text-lg">Class: {profile.class} • Roll No: {profile.roll_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-100">Indian Standard Time</p>
                    <p className="text-2xl font-semibold font-mono tracking-tight">{istString}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-28 justify-start hover:shadow-xl hover:-translate-y-0.5 transition-all bg-white" variant="outline" onClick={() => setActiveTab('attendance')}>
                <Calendar className="h-5 w-5 mr-3 text-blue-600" /> <span className="text-left">View Attendance</span>
              </Button>
              <Button className="h-28 justify-start hover:shadow-xl hover:-translate-y-0.5 transition-all bg-white" variant="outline" onClick={() => setActiveTab('marks')}>
                <BarChart3 className="h-5 w-5 mr-3 text-green-600" /> <span className="text-left">Check Marks</span>
              </Button>
              <Button className="h-28 justify-start hover:shadow-xl hover:-translate-y-0.5 transition-all bg-white" variant="outline" onClick={() => setActiveTab('fees')}>
                <WalletCards className="h-5 w-5 mr-3 text-emerald-600" /> <span className="text-left">Pay Fees</span>
              </Button>
            </div>

            {/* Gamified Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="hover:shadow-lg transition">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Level</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">10</div>
                  <p className="text-xs text-muted-foreground">Next level at 1200 XP</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition">
                <CardHeader className="pb-2"><CardTitle className="text-sm">XP Progress</CardTitle></CardHeader>
                <CardContent>
                  <Progress value={72} className="h-3" />
                  <p className="text-xs mt-1 text-muted-foreground">864 / 1200 XP</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Attendance Streak</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">days present in a row</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Achievements</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">🏅 Top Scorer • 📚 Library Star • 🎯 Perfect Attendance</CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Welcome Banner for other tabs */}
        {activeTab !== "home" && (
          <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Welcome back, {profile.full_name}!</h2>
                  <p className="text-blue-100">Class: {profile.class} | Roll No: {profile.roll_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-100">Academic Year</p>
                  <p className="text-lg font-semibold">2024-25</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile & Documents */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle>Profile & Documents</CardTitle>
              <CardDescription>View and update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input defaultValue={profile.full_name} />
                </div>
                <div>
                  <Label>Class</Label>
                  <Input defaultValue={profile.class} />
                </div>
                <div>
                  <Label>Roll Number</Label>
                  <Input defaultValue={profile.roll_number} />
                </div>
                <div>
                  <Label>Upload Missing Documents</Label>
                  <Input type="file" multiple />
                </div>
              </div>
              <Button className="mt-2">Save Changes</Button>
            </CardContent>
          </Card>
        )}

        {/* Admission Details */}
        {activeTab === "admission" && (
          <Card>
            <CardHeader>
              <CardTitle>Admission Details</CardTitle>
              <CardDescription>Admission status, fee status, and hostel status</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Admission Status</CardTitle></CardHeader>
                <CardContent>Confirmed</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Fee Status</CardTitle></CardHeader>
                <CardContent>Pending: ₹{fees.filter(f=>f.status!=="Paid").reduce((s,f)=>s+f.amount,0)}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Hostel Status</CardTitle></CardHeader>
                <CardContent>Allotted: Boys Hostel A, Room 101</CardContent>
              </Card>
            </CardContent>
          </Card>
        )}

        {/* Fees & Payments */}
        {activeTab === "fees" && (
          <Card>
            <CardHeader>
              <CardTitle>Fees & Payments</CardTitle>
              <CardDescription>View dues and pay online (dummy)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.label}</TableCell>
                      <TableCell>₹{f.amount}</TableCell>
                      <TableCell>{f.due}</TableCell>
                      <TableCell>
                        <Badge variant={f.status === "Paid" ? "default" : "destructive"}>{f.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {f.status !== "Paid" ? (
                          <Button size="sm" onClick={() => handlePay(f.id)}>Pay Now</Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => downloadReceipt(f.id)}>
                            <Download className="h-4 w-4 mr-1" /> Receipt
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Overall Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">90%</div>
                  <p className="text-xs text-muted-foreground">+2% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Average Marks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">84.8%</div>
                  <p className="text-xs text-muted-foreground">+1.2% from last term</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Due this week</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Announcements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {announcements.slice(0, 3).map((announcement) => (
                    <div key={announcement.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:shadow-sm">
                      <Bell className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium">{announcement.title}</p>
                        <p className="text-sm text-gray-600">{announcement.date}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium">Mid-term Exams</p>
                      <p className="text-sm text-gray-600">Starting Jan 15, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <div className="flex-1">
                      <p className="font-medium">Sports Day</p>
                      <p className="text-sm text-gray-600">Jan 20, 2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Record</CardTitle>
              <CardDescription>Your attendance for the current academic year</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Total Classes</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData.map((item) => (
                    <TableRow key={item.subject}>
                      <TableCell className="font-medium">{item.subject}</TableCell>
                      <TableCell>{item.present}</TableCell>
                      <TableCell>{item.total}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Progress value={item.percentage} className="w-20" />
                          <span>{item.percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.percentage >= 75 ? "default" : "destructive"}>
                          {item.percentage >= 75 ? "Good" : "Low"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Marks Tab */}
        {activeTab === "marks" && (
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>Your marks and grades for the current term</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks Obtained</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marksData.map((item) => (
                    <TableRow key={item.subject}>
                      <TableCell className="font-medium">{item.subject}</TableCell>
                      <TableCell>{item.marks}</TableCell>
                      <TableCell>{item.total}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.grade}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Course Materials Tab */}
        {activeTab === "materials" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Materials</CardTitle>
                <CardDescription>Download study materials and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["Mathematics Notes", "Science Lab Manual", "English Literature", "History Textbook", "Geography Maps", "Computer Science"].map((material) => (
                    <Card key={material} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <BookOpen className="h-8 w-8 text-blue-600" />
                          <div className="flex-1">
                            <h3 className="font-medium">{material}</h3>
                            <p className="text-sm text-gray-600">PDF • 2.5 MB</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Hostel & Library */}
        {activeTab === "hostel" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Hostel Allocation</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p>Room: 101, Boys Hostel A</p>
                <Button variant="outline" className="hover:shadow">Request Room Change</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Library Account</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p>Books Issued: 2</p>
                <p>Fines: ₹0</p>
                <Button variant="outline" className="hover:shadow">View Borrowed Books</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leave Request Tab */}
        {activeTab === "leave" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Request</CardTitle>
                <CardDescription>Submit and track your leave applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Submit New Leave Request
                  </Button>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium">Recent Leave Requests</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Medical Leave</p>
                          <p className="text-sm text-gray-600">Jan 10-12, 2024</p>
                        </div>
                        <Badge variant="outline">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Family Function</p>
                          <p className="text-sm text-gray-600">Jan 25, 2024</p>
                        </div>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <Card>
            <CardHeader>
              <CardTitle>School Announcements</CardTitle>
              <CardDescription>Important notices and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <Bell className="h-5 w-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{announcement.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">Published on {announcement.date}</p>
                        <Badge variant="outline" className="text-xs">
                          {announcement.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Attendance Trend</CardTitle></CardHeader>
              <CardContent style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="attendance" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Average Marks Trend</CardTitle></CardHeader>
              <CardContent style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgMarks" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Smart Alerts */}
        {activeTab === "alerts" && (
          <Card>
            <CardHeader>
              <CardTitle>Smart Alerts</CardTitle>
              <CardDescription>Fee reminders, exam schedules, and assignments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border rounded bg-yellow-50 text-yellow-800">Fee due soon: Term Fee - Q1</div>
              <div className="p-3 border rounded bg-blue-50 text-blue-800">Exam schedule: Mid-term starts Jan 15</div>
              <div className="p-3 border rounded bg-emerald-50 text-emerald-800">Assignment deadline: Science Project - Jan 12</div>
            </CardContent>
          </Card>
        )}
      </div>
    </EnhancedDashboardLayout>
  );
};

export default StudentDashboard;