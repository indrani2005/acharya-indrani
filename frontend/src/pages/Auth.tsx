import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
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
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const roleOptions = [
    {
      id: "student",
      name: "Student",
      icon: GraduationCap,
      description: "Access your academic dashboard, attendance, grades, and more",
      demoCredentials: { email: "student@acharya.edu", password: "student123" }
    },
    {
      id: "parent",
      name: "Parent",
      icon: Users,
      description: "Monitor your child's progress, fees, and school activities",
      demoCredentials: { email: "parent@acharya.edu", password: "parent123" }
    },
    {
      id: "staff",
      name: "Staff",
      icon: Shield,
      description: "Faculty and administrative access",
      hasSubOptions: true
    }
  ];

  const staffSubOptions = [
    {
      id: "faculty",
      name: "Faculty",
      icon: BookOpen,
      description: "Manage classes, attendance, and student assessments",
      demoCredentials: { email: "faculty@acharya.edu", password: "faculty123" }
    },
    {
      id: "warden",
      name: "Warden",
      icon: Building,
      description: "Hostel management and student welfare",
      demoCredentials: { email: "warden@acharya.edu", password: "warden123" }
    },
    {
      id: "admin",
      name: "Administrator",
      icon: Settings,
      description: "Complete system administration and management",
      demoCredentials: { email: "admin@acharya.edu", password: "admin123" }
    }
  ];

  const handleRoleSelect = (role: any) => {
    if (role.hasSubOptions) {
      setShowStaffOptions(true);
      return;
    }

    setCurrentRole(role.id);
    setCurrentRoleName(role.name);
    setShowLoginForm(true);
    
    // Pre-fill demo credentials
    if (role.demoCredentials) {
      setFormData(role.demoCredentials);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      // Navigation will be handled by the useEffect hook
    } catch (error: any) {
      console.error("Login error:", error);
      // Error toast is handled in the AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemoCredentials = (credentials: { email: string; password: string }) => {
    setFormData(credentials);
    toast({
      title: "Demo Credentials Loaded",
      description: "Click Login to proceed with demo account",
    });
  };

  const resetToRoleSelection = () => {
    setShowLoginForm(false);
    setShowStaffOptions(false);
    setCurrentRole("");
    setCurrentRoleName("");
    setFormData({ email: "", password: "" });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Clock className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Acharya Portal</h1>
          <p className="text-gray-600">
            {showLoginForm 
              ? `Sign in to your ${currentRoleName} account`
              : "Select your role to continue"
            }
          </p>
        </div>

        {/* Login Form */}
        {showLoginForm && (
          <Card className="w-full shadow-lg border-0">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                {currentRole === "student" && <GraduationCap className="h-6 w-6 text-blue-600" />}
                {currentRole === "parent" && <Users className="h-6 w-6 text-blue-600" />}
                {currentRole === "faculty" && <BookOpen className="h-6 w-6 text-blue-600" />}
                {currentRole === "warden" && <Building className="h-6 w-6 text-blue-600" />}
                {currentRole === "admin" && <Settings className="h-6 w-6 text-blue-600" />}
              </div>
              <CardTitle className="text-xl">{currentRoleName} Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Demo Credentials:</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => handleUseDemoCredentials(formData)}
                >
                  <FileText className="mr-1 h-3 w-3" />
                  Use Demo Account
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={resetToRoleSelection}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Role Selection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Staff Sub-options */}
        {showStaffOptions && !showLoginForm && (
          <Card className="w-full shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Select Staff Role</CardTitle>
              <CardDescription>Choose your specific staff role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {staffSubOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.id}
                    variant="outline"
                    className="w-full h-auto p-4 justify-start text-left hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    onClick={() => handleRoleSelect(option)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-grow text-left">
                        <h3 className="font-medium text-gray-900">{option.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      </div>
                    </div>
                  </Button>
                );
              })}
              
              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => setShowStaffOptions(false)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Role Selection */}
        {!showLoginForm && !showStaffOptions && (
          <Card className="w-full shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Select Your Role</CardTitle>
              <CardDescription>Choose how you want to access the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {roleOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.id}
                    variant="outline"
                    className="w-full h-auto p-4 justify-start text-left hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    onClick={() => handleRoleSelect(option)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-grow text-left">
                        <h3 className="font-medium text-gray-900">{option.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Demo Notice */}
        <div className="text-center text-sm text-gray-500">
          <p>This is a demo system. Use the provided demo credentials to explore.</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;