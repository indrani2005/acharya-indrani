import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EnhancedDashboardLayout from "@/components/EnhancedDashboardLayout";
import { 
  Settings, 
  Users, 
  BarChart3, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  Building,
  Calendar,
  Bell,
  Shield,
  Database,
  Clock
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";

const AdminDashboard = () => {
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
  const user = { email: "admin@acharya.gov.in" };
  const profile = { 
    full_name: "Dr. Suresh Mehta", 
    role: "admin",
    designation: "Principal",
    employee_id: "ADM001"
  };

  // Mock data
  const schoolStats = [
    { title: "Total Students", value: "1250", change: "+5%", trend: "up" },
    { title: "Total Faculty", value: "45", change: "+2%", trend: "up" },
    { title: "Total Classes", value: "25", change: "0%", trend: "stable" },
    { title: "Active Users", value: "1295", change: "+3%", trend: "up" },
  ];

  const recentActivities = [
    { action: "New Student Admission", user: "Rahul Sharma", time: "2 hours ago", type: "admission" },
    { action: "Faculty Login", user: "Dr. Priya Singh", time: "3 hours ago", type: "login" },
    { action: "Fee Payment", user: "Rajesh Kumar", time: "4 hours ago", type: "payment" },
    { action: "Leave Approved", user: "Mr. Amit Patel", time: "5 hours ago", type: "approval" },
  ];

  const systemAlerts = [
    { id: 1, type: "warning", message: "Low disk space on server", priority: "High", date: "2024-01-15" },
    { id: 2, type: "info", message: "Scheduled maintenance tonight", priority: "Medium", date: "2024-01-15" },
    { id: 3, type: "success", message: "Backup completed successfully", priority: "Low", date: "2024-01-14" },
  ];

  const userManagement = [
    { name: "Dr. Priya Singh", role: "Faculty", department: "Mathematics", status: "Active", lastLogin: "Today" },
    { name: "Mr. Rajesh Kumar", role: "Warden", department: "Hostel", status: "Active", lastLogin: "Yesterday" },
    { name: "Rahul Sharma", role: "Student", class: "10th A", status: "Active", lastLogin: "Today" },
    { name: "Rajesh Sharma", role: "Parent", student: "Rahul Sharma", status: "Active", lastLogin: "2 days ago" },
  ];

  // Mock datasets for aggregate analytics
  const instituteTrend = [
    { month: 'Apr', attendance: 88, feeCollection: 72, resultsAvg: 78 },
    { month: 'May', attendance: 90, feeCollection: 75, resultsAvg: 80 },
    { month: 'Jun', attendance: 87, feeCollection: 78, resultsAvg: 79 },
    { month: 'Jul', attendance: 89, feeCollection: 82, resultsAvg: 81 },
    { month: 'Aug', attendance: 91, feeCollection: 85, resultsAvg: 83 },
  ];

  const sidebarContent = (
    <div className="p-6 space-y-4">
      <Accordion type="single" collapsible defaultValue="menu">
        <AccordionItem value="menu">
          <AccordionTrigger className="text-base">Dashboard Menu</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              <Button variant={activeTab === "home" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("home")}><Clock className="h-4 w-4 mr-2"/> Home</Button>
              <Button variant={activeTab === "overview" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("overview")}><TrendingUp className="h-4 w-4 mr-2"/> Overview</Button>
              <Button variant={activeTab === "analytics" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("analytics")}><BarChart3 className="h-4 w-4 mr-2"/> Analytics</Button>
              <Button variant={activeTab === "users" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("users")}><Users className="h-4 w-4 mr-2"/> User Management</Button>
              <Button variant={activeTab === "reports" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("reports")}><BarChart3 className="h-4 w-4 mr-2"/> Reports & Analytics</Button>
              <Button variant={activeTab === "system" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("system")}><Settings className="h-4 w-4 mr-2"/> System Settings</Button>
              <Button variant={activeTab === "alerts" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("alerts")}><AlertCircle className="h-4 w-4 mr-2"/> System Alerts</Button>
              <Button variant={activeTab === "logs" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("logs")}><FileText className="h-4 w-4 mr-2"/> Activity Logs</Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <EnhancedDashboardLayout
      title="Admin Dashboard"
      user={user}
      profile={profile}
      sidebarContent={sidebarContent}
    >
      <div className="space-y-6">
        {activeTab === "home" && (
          <Card className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome, {profile.full_name}!</h2>
                  <p className="text-indigo-100 text-lg">{profile.designation} • ID: {profile.employee_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-indigo-100">Indian Standard Time</p>
                  <p className="text-2xl font-semibold font-mono tracking-tight">{istString}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "home" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition"><CardHeader className="pb-2"><CardTitle className="text-sm">Students</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">1250</div><p className="text-xs text-indigo-100/90">enrolled</p></CardContent></Card>
            <Card className="hover:shadow-lg transition"><CardHeader className="pb-2"><CardTitle className="text-sm">Fee Collected</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">82%</div><p className="text-xs text-indigo-100/90">this month</p></CardContent></Card>
            <Card className="hover:shadow-lg transition"><CardHeader className="pb-2"><CardTitle className="text-sm">Hostel Occupancy</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">91%</div><p className="text-xs text-indigo-100/90">current</p></CardContent></Card>
            <Card className="hover:shadow-lg transition"><CardHeader className="pb-2"><CardTitle className="text-sm">Alerts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">3</div><p className="text-xs text-indigo-100/90">open</p></CardContent></Card>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {schoolStats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className={stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-gray-600"}>
                        {stat.change}
                      </span> from last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className={`h-2 w-2 rounded-full ${
                        activity.type === "admission" ? "bg-green-500" :
                        activity.type === "login" ? "bg-blue-500" :
                        activity.type === "payment" ? "bg-purple-500" :
                        "bg-orange-500"
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.user} • {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {systemAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <AlertCircle className={`h-4 w-4 ${
                        alert.priority === "High" ? "text-red-600" :
                        alert.priority === "Medium" ? "text-yellow-600" :
                        "text-green-600"
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-gray-600">{alert.date} • {alert.priority} Priority</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all system users and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Search users..." className="flex-1" />
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="parent">Parents</SelectItem>
                      <SelectItem value="warden">Wardens</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department/Class</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userManagement.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>{user.department || user.class || user.student || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reports & Analytics Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>Generate and view system reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Attendance Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    Student Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    Fee Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Building className="h-6 w-6 mb-2" />
                    Hostel Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Calendar className="h-6 w-6 mb-2" />
                    Academic Report
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Database className="h-6 w-6 mb-2" />
                    System Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === "system" && (
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">General Settings</h3>
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input id="schoolName" defaultValue="Acharya School" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Academic Year</Label>
                      <Input id="academicYear" defaultValue="2024-25" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Security Settings</h3>
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input id="sessionTimeout" type="number" defaultValue="30" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passwordPolicy">Password Policy</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select policy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="strong">Strong</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Button>
                    <Shield className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                  <Button variant="outline">
                    Reset to Default
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Alerts Tab */}
        {activeTab === "alerts" && (
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Monitor system health and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className={`h-5 w-5 ${
                          alert.priority === "High" ? "text-red-600" :
                          alert.priority === "Medium" ? "text-yellow-600" :
                          "text-green-600"
                        }`} />
                        <div>
                          <h3 className="font-medium">{alert.message}</h3>
                          <p className="text-sm text-gray-600">{alert.date}</p>
                        </div>
                      </div>
                      <Badge variant={
                        alert.priority === "High" ? "destructive" :
                        alert.priority === "Medium" ? "secondary" :
                        "default"
                      }>
                        {alert.priority} Priority
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Acknowledge
                      </Button>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Logs Tab */}
        {activeTab === "logs" && (
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>View system activity and audit logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Search logs..." className="flex-1" />
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="action">Actions</SelectItem>
                      <SelectItem value="error">Errors</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" className="w-48" />
                </div>

                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-gray-600">User: {activity.user} • {activity.time}</p>
                        </div>
                        <Badge variant="outline">{activity.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Attendance Trend (Institute)</CardTitle></CardHeader>
              <CardContent style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={instituteTrend}>
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
              <CardHeader><CardTitle>Fee Collection %</CardTitle></CardHeader>
              <CardContent style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={instituteTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="feeCollection" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </EnhancedDashboardLayout>
  );
};

export default AdminDashboard;