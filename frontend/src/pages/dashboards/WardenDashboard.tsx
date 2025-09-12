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
  Building, 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  FileText,
  Calendar,
  Shield,
  Bell
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const WardenDashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [now, setNow] = useState<Date>(new Date());
  
  // Mock user data
  const user = { email: "warden@acharya.gov.in" };
  const profile = { 
    full_name: "Mr. Rajesh Kumar", 
    role: "warden",
    hostel: "Boys Hostel A",
    employee_id: "WARD001"
  };

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

  // Mock data
  const hostelData = [
    { room: "101", capacity: 4, occupied: 4, status: "Full" },
    { room: "102", capacity: 4, occupied: 3, status: "Available" },
    { room: "103", capacity: 4, occupied: 4, status: "Full" },
    { room: "104", capacity: 4, occupied: 2, status: "Available" },
  ];

  const studentsData = [
    { name: "Rahul Sharma", room: "101", class: "10th A", contact: "9876543210", status: "Present" },
    { name: "Amit Kumar", room: "101", class: "10th B", contact: "9876543211", status: "Present" },
    { name: "Priya Patel", room: "102", class: "9th A", contact: "9876543212", status: "Absent" },
    { name: "Sneha Singh", room: "103", class: "10th A", contact: "9876543213", status: "Present" },
  ];

  const leaveRequests = [
    { id: 1, student: "Rahul Sharma", room: "101", reason: "Medical", dates: "Jan 10-12", status: "Pending" },
    { id: 2, student: "Amit Kumar", room: "101", reason: "Family Function", dates: "Jan 25", status: "Approved" },
  ];

  const complaints = [
    { id: 1, student: "Priya Patel", room: "102", issue: "Room Maintenance", status: "Under Review", date: "2024-01-15" },
    { id: 2, student: "Sneha Singh", room: "103", issue: "Food Quality", status: "Resolved", date: "2024-01-10" },
  ];

  const sidebarContent = (
    <div className="p-6 space-y-4">
      <Accordion type="single" collapsible defaultValue="menu">
        <AccordionItem value="menu">
          <AccordionTrigger className="text-base">Dashboard Menu</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              <Button variant={activeTab === "home" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("home")}><Clock className="h-4 w-4 mr-2"/> Home</Button>
              <Button variant={activeTab === "rooms" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("rooms")}><Building className="h-4 w-4 mr-2"/> Room Management</Button>
              <Button variant={activeTab === "students" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("students")}><Users className="h-4 w-4 mr-2"/> Student Records</Button>
              <Button variant={activeTab === "attendance" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("attendance")}><Clock className="h-4 w-4 mr-2"/> Hostel Attendance</Button>
              <Button variant={activeTab === "leave" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("leave")}><CheckCircle className="h-4 w-4 mr-2"/> Approve Leave</Button>
              <Button variant={activeTab === "complaints" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveTab("complaints")}><AlertCircle className="h-4 w-4 mr-2"/> Complaints</Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <EnhancedDashboardLayout
      title="Warden Dashboard"
      user={user}
      profile={profile}
      sidebarContent={sidebarContent}
    >
      <div className="space-y-6">
        {activeTab === "home" && (
          <Card className="bg-gradient-to-r from-orange-600 to-orange-800 text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome, {profile.full_name}!</h2>
                  <p className="text-orange-100 text-lg">{profile.hostel} • ID: {profile.employee_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-orange-100">Indian Standard Time</p>
                  <p className="text-2xl font-semibold font-mono tracking-tight">{istString}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "home" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition"><CardHeader className="pb-2"><CardTitle className="text-sm">Rooms Free</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">3</div><p className="text-xs text-muted-foreground">vacant beds</p></CardContent></Card>
            <Card className="hover:shadow-lg transition"><CardHeader className="pb-2"><CardTitle className="text-sm">Complaints</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">1</div><p className="text-xs text-muted-foreground">to resolve</p></CardContent></Card>
            <Card className="hover:shadow-lg transition"><CardHeader className="pb-2"><CardTitle className="text-sm">Hostel Attendance</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">92%</div><p className="text-xs text-muted-foreground">yesterday</p></CardContent></Card>
            <Card className="hover:shadow-lg transition"><CardHeader className="pb-2"><CardTitle className="text-sm">Notices</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">2</div><p className="text-xs text-muted-foreground">active</p></CardContent></Card>
          </div>
        )}

        {/* Keep existing sections below */}
        {activeTab !== "home" && (
          <Card className="bg-gradient-to-r from-orange-600 to-orange-800 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Welcome, {profile.full_name}!</h2>
                  <p className="text-orange-100">{profile.hostel} | ID: {profile.employee_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-orange-100">Academic Year</p>
                  <p className="text-lg font-semibold">2024-25</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "rooms" && (
          <Card>
            <CardHeader>
              <CardTitle>Room Management</CardTitle>
              <CardDescription>Manage hostel rooms and occupancy</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Occupied</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hostelData.map((room) => (
                    <TableRow key={room.room}>
                      <TableCell className="font-medium">{room.room}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>{room.occupied}</TableCell>
                      <TableCell>{room.capacity - room.occupied}</TableCell>
                      <TableCell>
                        <Badge variant={room.status === "Full" ? "destructive" : "default"}>
                          {room.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Building className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === "students" && (
          <Card>
            <CardHeader>
              <CardTitle>Student Records</CardTitle>
              <CardDescription>View and manage student information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsData.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.room}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.contact}</TableCell>
                      <TableCell>
                        <Badge variant={student.status === "Present" ? "default" : "secondary"}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Users className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === "attendance" && (
          <Card>
            <CardHeader>
              <CardTitle>Hostel Attendance</CardTitle>
              <CardDescription>Mark and track hostel attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input type="date" className="w-48" />
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning Roll Call</SelectItem>
                      <SelectItem value="evening">Evening Roll Call</SelectItem>
                      <SelectItem value="night">Night Check</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Clock className="h-4 w-4 mr-2" />
                    Mark Attendance
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsData.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.room}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">Present</Button>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">Absent</Button>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            <CheckCircle className="h-4 w-4" />
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

        {activeTab === "leave" && (
          <Card>
            <CardHeader>
              <CardTitle>Approve Leave Requests</CardTitle>
              <CardDescription>Review and approve hostel leave applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaveRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{request.student}</h3>
                        <p className="text-sm text-gray-600">Room {request.room} • {request.dates}</p>
                      </div>
                      <Badge variant={request.status === "Approved" ? "default" : "secondary"}>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm mb-3">Reason: {request.reason}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "complaints" && (
          <Card>
            <CardHeader>
              <CardTitle>Student Complaints</CardTitle>
              <CardDescription>Review and address hostel complaints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{complaint.student}</h3>
                        <p className="text-sm text-gray-600">Room {complaint.room} • {complaint.date}</p>
                      </div>
                      <Badge variant={complaint.status === "Resolved" ? "default" : "secondary"}>
                        {complaint.status}
                      </Badge>
                    </div>
                    <p className="text-sm mb-3">Issue: {complaint.issue}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </EnhancedDashboardLayout>
  );
};

export default WardenDashboard;