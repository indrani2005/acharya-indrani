import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  UserCheck, 
  Building, 
  Shield,
  Settings,
  FileText,
  ArrowLeft,
  Eye,
  EyeOff,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showStaffOptions, setShowStaffOptions] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [currentRole, setCurrentRole] = useState<string>("");
  const [currentRoleName, setCurrentRoleName] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

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

  const handleRoleSelection = (role: string, roleName: string) => {
    setCurrentRole(role);
    setCurrentRoleName(roleName);
    setShowLoginForm(true);
    setShowStaffOptions(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (loginData.username && loginData.password) {
        const mockUser = {
          id: `mock-${currentRole}-${Date.now()}`,
          email: `${loginData.username}@acharya.gov.in`,
          full_name: loginData.username,
          role: currentRole,
          username: loginData.username
        };
        localStorage.setItem('mockUser', JSON.stringify(mockUser));
        toast({ title: `Welcome, ${loginData.username}!`, description: `Accessing your ${currentRoleName} dashboard...` });
        navigate("/dashboard");
      } else {
        toast({ title: "Login Error", description: "Please enter both username and password.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Login Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRoles = () => {
    setShowLoginForm(false);
    setCurrentRole("");
    setCurrentRoleName("");
    setLoginData({ username: "", password: "" });
  };

  const handleStaffRole = (staffRole: string, staffName: string) => {
    setShowStaffOptions(false);
    handleRoleSelection(staffRole, staffName);
  };

  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-rose-500">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">{currentRoleName} Login</CardTitle>
              <CardDescription>Enter your credentials to access the portal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" type="text" placeholder="Enter your username" value={loginData.username} onChange={(e) => setLoginData({...loginData, username: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} required />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (<EyeOff classNameName="h-4 w-4" />) : (<Eye classNameName="h-4 w-4" />)}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign In"}</Button>
                  <Button type="button" variant="outline" className="w-full" onClick={handleBackToRoles}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Role Selection
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-amber-200">
              <GraduationCap className="h-12 w-12 text-amber-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-amber-900 mb-2">Acharya Education Portal</h1>
          <p className="text-amber-800/80 text-lg">Government of Rajasthan</p>
          <p className="text-amber-800/70 text-sm mt-1">शिक्षा विभाग | Education Department</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-100 rounded-full px-5 py-2 ring-1 ring-amber-200">
            <Clock className="h-4 w-4 text-amber-700" />
            <span className="text-amber-900 text-base font-mono">{istString}</span>
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-2 hover:border-amber-400 bg-white/90">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-amber-900">Student</h3>
              <p className="text-amber-800/80 text-sm mb-4">Access your academic records, attendance, and course materials</p>
              <Button className="w-full" onClick={() => handleRoleSelection('student', 'Student')} disabled={isLoading}>{isLoading ? "Loading..." : "Enter Portal"}</Button>
            </CardContent>
          </Card>

          <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-2 hover:border-amber-400 bg-white/90">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-amber-900">Staff</h3>
              <p className="text-amber-800/80 text-sm mb-4">Faculty, Warden, and Management access</p>
              <Button className="w-full" onClick={() => setShowStaffOptions(true)} disabled={isLoading}>Select Role</Button>
            </CardContent>
          </Card>

          <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-2 hover:border-amber-400 bg-white/90">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-amber-900">Parent</h3>
              <p className="text-amber-800/80 text-sm mb-4">Monitor your child's academic progress and fees</p>
              <Button className="w-full" onClick={() => handleRoleSelection('parent', 'Parent')} disabled={isLoading}>{isLoading ? "Loading..." : "Enter Portal"}</Button>
            </CardContent>
          </Card>

          <Card className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-2 hover:border-amber-400 bg-white/90">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-amber-900">Admission</h3>
              <p className="text-amber-800/80 text-sm mb-4">Apply for admission and track application status</p>
              <Button className="w-full" onClick={() => navigate('/admission')} disabled={isLoading}>{isLoading ? "Loading..." : "Apply Now"}</Button>
            </CardContent>
          </Card>
        </div>

        {/* Staff Sub-roles Modal */}
        {showStaffOptions && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Select Staff Role</span>
                </CardTitle>
                <CardDescription>Choose your specific role to continue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start h-16" variant="outline" onClick={() => handleStaffRole('faculty', 'Faculty')}>
                  <BookOpen className="h-6 w-6 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Faculty</p>
                    <p className="text-sm text-muted-foreground">Teaching staff and subject experts</p>
                  </div>
                </Button>
                <Button className="w-full justify-start h-16" variant="outline" onClick={() => handleStaffRole('warden', 'Warden')}>
                  <Building className="h-6 w-6 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Warden</p>
                    <p className="text-sm text-muted-foreground">Hostel and residential management</p>
                  </div>
                </Button>
                <Button className="w-full justify-start h-16" variant="outline" onClick={() => handleStaffRole('admin', 'Manager')}>
                  <Settings className="h-6 w-6 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Manager</p>
                    <p className="text-sm text-muted-foreground">Administrative and management roles</p>
                  </div>
                </Button>
                <Button className="w-full mt-4" variant="ghost" onClick={() => setShowStaffOptions(false)}>Cancel</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Government Branding Footer */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 bg-amber-100 rounded-lg px-6 py-3 ring-1 ring-amber-200">
            <Shield className="h-6 w-6 text-amber-700" />
            <div className="text-amber-900 text-sm">
              <p className="font-medium">राजस्थान सरकार | Government of Rajasthan</p>
              <p className="text-amber-800/70">Secure Portal • आधिकारिक पोर्टल</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;