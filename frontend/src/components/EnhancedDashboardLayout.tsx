import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Clock, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface EnhancedDashboardLayoutProps {
  children: ReactNode;
  title: string;
  user: any;
  profile: any;
  sidebarContent?: ReactNode;
}

const EnhancedDashboardLayout = ({ children, title, user, profile, sidebarContent }: EnhancedDashboardLayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatISTTime = (date: Date) => {
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const handleSignOut = () => {
    localStorage.removeItem('mockUser');
    toast({
      title: "Logged out successfully",
      description: "You have been signed out of your account.",
    });
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Inline style for collapsed sidebar label hiding */}
      <style>{`.sidebar.collapsed .sidebar-label{display:none}`}</style>
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {sidebarContent && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:inline-flex"
                onClick={() => setIsCollapsed(v => !v)}
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </Button>
            )}
            {sidebarContent && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="md:hidden"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 bg-white">
                  {sidebarContent}
                </SheetContent>
              </Sheet>
            )}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-600">Acharya Education Portal</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* IST Time Display */}
            <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="font-mono">{formatISTTime(currentTime)}</span>
            </div>
            
            {/* User Info */}
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-gray-900 text-lg">{profile?.full_name || user?.email}</p>
              <p className="text-sm text-gray-600 capitalize">{profile?.role || 'User'}</p>
            </div>
            
            {/* Logout Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="px-4 py-2"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        {sidebarContent && (
          <aside className={`sidebar hidden md:block ${isCollapsed ? 'w-20 collapsed' : 'w-80'} bg-white border-r min-h-screen shadow-sm transition-all duration-200`}> 
            <div className="h-full p-2">
              {sidebarContent}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen bg-gray-50">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnhancedDashboardLayout;
