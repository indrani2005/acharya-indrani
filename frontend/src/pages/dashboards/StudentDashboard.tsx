import { useEffect, useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { 
  feeService, 
  attendanceService, 
  examService, 
  libraryService, 
  notificationService,
  FeeInvoice,
  AttendanceRecord,
  ExamResult,
  BookBorrowRecord,
  Notice
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    fees: [] as FeeInvoice[],
    attendance: [] as AttendanceRecord[],
    results: [] as ExamResult[],
    borrowedBooks: [] as BookBorrowRecord[],
    notices: [] as Notice[],
  });

  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.role === 'student') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all dashboard data in parallel
      const [feesData, attendanceData, resultsData, libraryData, noticesData] = await Promise.allSettled([
        feeService.getInvoices({ student: user?.id }),
        attendanceService.getAttendanceRecords({ student: user?.id }),
        examService.getExamResults({ student: user?.id }),
        libraryService.getBorrowRecords({ student: user?.id }),
        notificationService.getNotices({ target_roles: ['student', 'all'] }),
      ]);

      setData({
        fees: feesData.status === 'fulfilled' ? feesData.value.results : [],
        attendance: attendanceData.status === 'fulfilled' ? attendanceData.value.results : [],
        results: resultsData.status === 'fulfilled' ? resultsData.value.results : [],
        borrowedBooks: libraryData.status === 'fulfilled' ? libraryData.value.results : [],
        notices: noticesData.status === 'fulfilled' ? noticesData.value.results : [],
      });
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error Loading Data",
        description: error.error || "Failed to load dashboard information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayFee = async (invoiceId: number) => {
    try {
      await feeService.processPayment(invoiceId, {
        payment_method: 'online',
        transaction_id: `TXN${Date.now()}`,
      });
      
      toast({
        title: "Payment Successful",
        description: "Your fee payment has been processed successfully",
      });
      
      // Reload fees data
      const feesData = await feeService.getInvoices({ student: user?.id });
      setData(prev => ({ ...prev, fees: feesData.results }));
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.error || "Failed to process payment",
        variant: "destructive",
      });
    }
  };

  const calculateAttendancePercentage = () => {
    if (data.attendance.length === 0) return 0;
    const presentCount = data.attendance.filter(record => record.status === 'present').length;
    return Math.round((presentCount / data.attendance.length) * 100);
  };

  const getPendingFees = () => {
    return data.fees.filter(fee => fee.status === 'pending');
  };

  const getRecentResults = () => {
    return data.results.slice(0, 5); // Show latest 5 results
  };

  if (loading) {
    return (
      <EnhancedDashboardLayout title="Student Dashboard" user={user!} profile={profile}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </EnhancedDashboardLayout>
    );
  }

  const attendancePercentage = calculateAttendancePercentage();
  const pendingFees = getPendingFees();
  const recentResults = getRecentResults();

  return (
    <EnhancedDashboardLayout title="Student Dashboard" user={user!} profile={profile}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.first_name}!
            </h1>
            <p className="text-gray-600">
              {profile?.admission_number && `Admission No: ${profile.admission_number}`}
              {profile?.course && ` | ${profile.course}`}
              {profile?.semester && ` | Semester ${profile.semester}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendancePercentage}%</div>
              <p className="text-xs text-muted-foreground">
                {data.attendance.filter(a => a.status === 'present').length} present out of {data.attendance.length}
              </p>
              <Progress value={attendancePercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
              <WalletCards className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingFees.length}</div>
              <p className="text-xs text-muted-foreground">
                ₹{pendingFees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0).toLocaleString()} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Library Books</CardTitle>
              <LibraryBig className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.borrowedBooks.filter(b => b.status === 'borrowed').length}</div>
              <p className="text-xs text-muted-foreground">
                Currently borrowed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.notices.length}</div>
              <p className="text-xs text-muted-foreground">
                Active notices
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            {/* Recent Notices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Notices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.notices.length > 0 ? (
                  <div className="space-y-4">
                    {data.notices.slice(0, 3).map((notice) => (
                      <div key={notice.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{notice.title}</h4>
                          <Badge variant={notice.priority === 'high' ? 'destructive' : 'secondary'}>
                            {notice.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notice.publish_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No notices available</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {pendingFees.length > 0 && (
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex flex-col gap-2"
                      onClick={() => setActiveTab("fees")}
                    >
                      <WalletCards className="h-6 w-6" />
                      <span className="text-sm">Pay Fees</span>
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col gap-2"
                    onClick={() => setActiveTab("attendance")}
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">Attendance</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col gap-2"
                    onClick={() => setActiveTab("results")}
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Results</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col gap-2"
                    onClick={() => setActiveTab("library")}
                  >
                    <BookOpen className="h-6 w-6" />
                    <span className="text-sm">Library</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fee Status</CardTitle>
                <CardDescription>Manage your fee payments</CardDescription>
              </CardHeader>
              <CardContent>
                {data.fees.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice No</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.fees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell className="font-medium">{fee.invoice_number}</TableCell>
                          <TableCell>₹{parseFloat(fee.amount).toLocaleString()}</TableCell>
                          <TableCell>{new Date(fee.due_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={fee.status === 'paid' ? 'default' : fee.status === 'overdue' ? 'destructive' : 'secondary'}>
                              {fee.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {fee.status === 'pending' && (
                              <Button 
                                size="sm" 
                                onClick={() => handlePayFee(fee.id)}
                              >
                                Pay Now
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-500">No fee records found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
                <CardDescription>Your attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span>Overall Attendance</span>
                    <span className="font-semibold">{attendancePercentage}%</span>
                  </div>
                  <Progress value={attendancePercentage} />
                </div>
                
                {data.attendance.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Marked By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.attendance.slice(0, 10).map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{new Date(record.marked_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>Faculty</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-500">No attendance records found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exam Results</CardTitle>
                <CardDescription>Your academic performance</CardDescription>
              </CardHeader>
              <CardContent>
                {recentResults.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell>Exam {result.exam}</TableCell>
                          <TableCell>{result.marks_obtained}</TableCell>
                          <TableCell>
                            <Badge>{result.grade || 'N/A'}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-500">No exam results available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Borrowed Books</CardTitle>
                <CardDescription>Books you have borrowed from library</CardDescription>
              </CardHeader>
              <CardContent>
                {data.borrowedBooks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Borrowed Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.borrowedBooks.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>Book {record.book}</TableCell>
                          <TableCell>{new Date(record.borrowed_date).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(record.due_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={record.status === 'overdue' ? 'destructive' : 'default'}>
                              {record.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-500">No borrowed books</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedDashboardLayout>
  );
};

export default StudentDashboard;