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
  Clock,
  GraduationCap,
  BookOpen,
  CreditCard,
  UserCheck,
  School,
  Home,
  DollarSign,
  Activity,
  UserPlus,
  FileX,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { adminAPI, SchoolStats, Student, Teacher, Staff, UserData, AdmissionApplication } from "@/services/adminAPI";

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real data states
  const [schoolStats, setSchoolStats] = useState<SchoolStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
    totalWardens: 0,
    activeParents: 0,
    totalClasses: 0,
    currentSemester: "N/A",
    school: {
      name: "Loading...",
      code: "N/A",
      email: "N/A",
      phone: "N/A",
      address: "N/A"
    }
  });
  
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [teachersData, setTeachersData] = useState<Teacher[]>([]);
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [admissionsData, setAdmissionsData] = useState<AdmissionApplication[]>([]);
  const [feesData, setFeesData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [examsData, setExamsData] = useState<any[]>([]);

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all data concurrently
        const [
          stats,
          students,
          teachers,
          staff,
          users,
          admissions,
          fees,
          attendance,
          exams
        ] = await Promise.all([
          adminAPI.getSchoolStats(),
          adminAPI.getStudents(),
          adminAPI.getTeachers(),
          adminAPI.getStaff(),
          adminAPI.getAllUsers(),
          adminAPI.getSchoolAdmissions(),
          adminAPI.getFeesData(),
          adminAPI.getAttendanceData(),
          adminAPI.getExamsData()
        ]);

        setSchoolStats(stats);
        setStudentsData(students);
        setTeachersData(teachers);
        setStaffData(staff);
        setAllUsers(users);
        setAdmissionsData(admissions);
        setFeesData(fees);
        setAttendanceData(attendance);
        setExamsData(exams);

      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const sidebarItems = [
    { id: "overview", label: "School Overview", icon: Building },
    { id: "students", label: "Students", icon: GraduationCap },
    { id: "teachers", label: "Teachers", icon: Users },
    { id: "staff", label: "Staff", icon: UserCheck },
    { id: "wardens", label: "Wardens", icon: Home },
    { id: "admissions", label: "Review Admissions", icon: UserPlus },
    { id: "fees", label: "Fees & Payments", icon: CreditCard },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "exams", label: "Examinations", icon: BookOpen },
    { id: "users", label: "User Management", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  const sidebarContent = (
    <div className="space-y-2">
      {sidebarItems.map((item) => (
        <Button
          key={item.id}
          variant={activeTab === item.id ? "default" : "ghost"}
          className="w-full justify-start gap-2"
          onClick={() => setActiveTab(item.id)}
        >
          <item.icon className="h-4 w-4" />
          <span className="sidebar-label">{item.label}</span>
        </Button>
      ))}
    </div>
  );

  const filterData = (data: any[], type: string) => {
    let filtered = data;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        Object.values(item).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    if (filterClass !== "all" && type === "students") {
      filtered = filtered.filter(item => item.course === filterClass);
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(item => 
        item.status?.toLowerCase() === filterStatus.toLowerCase() ||
        item.is_active?.toString() === filterStatus
      );
    }
    
    return filtered;
  };

  const renderFilters = (showClassFilter = false) => (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by name, email, or any field..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {showClassFilter && (
        <div className="min-w-[150px]">
          <Label htmlFor="class">Course/Class</Label>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {/* Dynamically populate based on available courses */}
              <SelectItem value="10th">10th Standard</SelectItem>
              <SelectItem value="11th">11th Standard</SelectItem>
              <SelectItem value="12th">12th Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="min-w-[150px]">
        <Label htmlFor="status">Status</Label>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Loading state
  if (loading) {
    return (
      <EnhancedDashboardLayout
        title="Management Dashboard - Loading..."
        user={user}
        profile={profile}
        sidebarContent={sidebarContent}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-lg">Loading dashboard data...</span>
        </div>
      </EnhancedDashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <EnhancedDashboardLayout
        title="Management Dashboard - Error"
        user={user}
        profile={profile}
        sidebarContent={sidebarContent}
      >
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <span className="ml-2 text-lg text-red-500">{error}</span>
        </div>
      </EnhancedDashboardLayout>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* School Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            School Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg">{schoolStats.school.name}</h3>
              <p className="text-muted-foreground">School Code: {schoolStats.school.code}</p>
              <p className="text-muted-foreground">Email: {schoolStats.school.email}</p>
              <p className="text-muted-foreground">Phone: {schoolStats.school.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address:</p>
              <p className="text-sm">{schoolStats.school.address}</p>
              <p className="text-sm font-medium mt-2">Current Semester: {schoolStats.currentSemester}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{schoolStats.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{schoolStats.totalTeachers}</p>
                <p className="text-sm text-muted-foreground">Teachers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{schoolStats.totalStaff}</p>
                <p className="text-sm text-muted-foreground">Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{schoolStats.totalWardens}</p>
                <p className="text-sm text-muted-foreground">Wardens</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{schoolStats.totalClasses}</p>
                <p className="text-sm text-muted-foreground">Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-2xl font-bold">{allUsers.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 rounded-full mt-2 bg-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">System running normally</p>
                <p className="text-xs text-muted-foreground">All services operational</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 rounded-full mt-2 bg-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Dashboard loaded successfully</p>
                <p className="text-xs text-muted-foreground">Connected to backend API</p>
              </div>
              <Badge variant="secondary">Connected</Badge>
            </div>
            
            {studentsData.length === 0 && (
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 rounded-full mt-2 bg-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">No student data found</p>
                  <p className="text-xs text-muted-foreground">Add students to see data</p>
                </div>
                <Badge variant="secondary">Empty</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStudentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Student Management</h2>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Student
        </Button>
      </div>
      
      {renderFilters(true)}
      
      <Card>
        <CardHeader>
          <CardTitle>All Students ({filterData(studentsData, "students").length})</CardTitle>
        </CardHeader>
        <CardContent>
          {studentsData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No students found. Add students to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterData(studentsData, "students").map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.admission_number || 'N/A'}</TableCell>
                    <TableCell>{`${student.user?.first_name || ''} ${student.user?.last_name || ''}`.trim() || 'N/A'}</TableCell>
                    <TableCell>{student.user?.email || 'N/A'}</TableCell>
                    <TableCell>{student.course || 'N/A'}</TableCell>
                    <TableCell>{student.batch || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                        {student.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTeachersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Teacher Management</h2>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Teacher
        </Button>
      </div>
      
      {renderFilters()}
      
      <Card>
        <CardHeader>
          <CardTitle>All Teachers ({filterData(teachersData, "teachers").length})</CardTitle>
        </CardHeader>
        <CardContent>
          {teachersData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No teachers found. Add teachers to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterData(teachersData, "teachers").map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">
                      {`${teacher.user?.first_name || ''} ${teacher.user?.last_name || ''}`.trim() || 'N/A'}
                    </TableCell>
                    <TableCell>{teacher.user?.email || 'N/A'}</TableCell>
                    <TableCell>{teacher.department || 'N/A'}</TableCell>
                    <TableCell>{teacher.designation || 'N/A'}</TableCell>
                    <TableCell>{teacher.experience_years ? `${teacher.experience_years} years` : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                        {teacher.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>
      
      {renderFilters()}
      
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filterData(allUsers, "users").length})</CardTitle>
        </CardHeader>
        <CardContent>
          {allUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterData(allUsers, "users").map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAdmissionsTab = () => {
    const filteredAdmissions = filterData(admissionsData, "admissions");

    const handleDecisionUpdate = async (decisionId: number, status: string, notes?: string) => {
      try {
        await adminAPI.updateAdmissionDecision(decisionId, status, notes);
        // Reload admissions data
        const updatedAdmissions = await adminAPI.getSchoolAdmissions();
        setAdmissionsData(updatedAdmissions);
      } catch (error) {
        console.error('Error updating admission decision:', error);
        // You might want to show a toast notification here
      }
    };

    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'pending':
          return <Badge variant="secondary">Pending</Badge>;
        case 'accepted':
          return <Badge variant="default" className="bg-green-500">Accepted</Badge>;
        case 'rejected':
          return <Badge variant="destructive">Rejected</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Review Admissions</h2>
          <div className="flex gap-4">
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admission Applications for Your School</CardTitle>
            <CardDescription>
              Review and manage admission applications submitted for your school
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading applications...</span>
              </div>
            ) : filteredAdmissions.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <UserPlus className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">No Applications Found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || filterStatus !== "all" 
                        ? "No applications match your current filters." 
                        : "No admission applications have been submitted for your school yet."}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmissions.map((application) => {
                    // Find the school decision for this school
                    const schoolDecision = application.school_decisions?.find(
                      decision => decision.school === profile?.school
                    );
                    
                    return (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">{application.reference_id}</TableCell>
                        <TableCell>{application.full_name}</TableCell>
                        <TableCell>{application.email}</TableCell>
                        <TableCell>{application.phone}</TableCell>
                        <TableCell>{new Date(application.date_of_birth).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {schoolDecision ? getStatusBadge(schoolDecision.status) : <Badge variant="secondary">Pending</Badge>}
                        </TableCell>
                        <TableCell>{new Date(application.submitted_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {(!schoolDecision || schoolDecision.status === 'pending') && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-500 hover:bg-green-600"
                                  onClick={() => handleDecisionUpdate(
                                    schoolDecision?.id || 0,
                                    'accepted'
                                  )}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDecisionUpdate(
                                    schoolDecision?.id || 0,
                                    'rejected'
                                  )}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {schoolDecision && schoolDecision.status !== 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDecisionUpdate(
                                  schoolDecision.id,
                                  'pending'
                                )}
                              >
                                Reset
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Other tabs with empty data states
  const renderEmptyTab = (title: string, description: string) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Card>
        <CardContent className="text-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Database className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No Data Available</h3>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverviewTab();
      case "students":
        return renderStudentsTab();
      case "teachers":
        return renderTeachersTab();
      case "users":
        return renderUsersTab();
      case "admissions":
        return renderAdmissionsTab();
      case "staff":
        return renderEmptyTab("Staff Management", "Staff data will be displayed here when available.");
      case "wardens":
        return renderEmptyTab("Warden Management", "Warden data will be displayed here when available.");
      case "fees":
        return renderEmptyTab("Fee Management", "Fee data will be displayed here when available.");
      case "attendance":
        return renderEmptyTab("Attendance Management", "Attendance data will be displayed here when available.");
      case "exams":
        return renderEmptyTab("Examination Management", "Exam data will be displayed here when available.");
      case "analytics":
        return renderEmptyTab("Analytics", "Analytics data will be displayed here when available.");
      case "reports":
        return renderEmptyTab("Reports", "Reports will be displayed here when available.");
      case "settings":
        return renderEmptyTab("Settings", "System settings will be displayed here when available.");
      default:
        return renderOverviewTab();
    }
  };

  return (
    <EnhancedDashboardLayout
      title={`Management Dashboard - ${schoolStats.school.name}`}
      user={user}
      profile={profile}
      sidebarContent={sidebarContent}
    >
      {renderTabContent()}
    </EnhancedDashboardLayout>
  );
}