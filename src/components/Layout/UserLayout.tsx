import { Switch, Route, Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, GraduationCap, Home, User, ClipboardCheck, Route as RouteIcon, BookOpen, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

import Dashboard from "@/pages/user/Dashboard";
import Profile from "@/pages/user/Profile";
import Assessments from "@/pages/user/Assessments";
import LearningPath from "@/pages/user/LearningPath";
import Courses from "@/pages/user/Courses";
import Progress from "@/pages/user/Progress";

export default function UserLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Profile Setup", href: "/profile", icon: User },
    { name: "Assessments", href: "/assessments", icon: ClipboardCheck },
    { name: "Learning Path", href: "/learning-path", icon: RouteIcon },
    { name: "My Courses", href: "/courses", icon: BookOpen },
    { name: "Progress", href: "/progress", icon: BarChart3 },
  ];

  const getPageTitle = () => {
    const current = navigation.find(nav => nav.href === location);
    return current?.name || "Dashboard";
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email || "User";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">SkillForge</h2>
              <p className="text-xs text-slate-500">Learner Portal</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <a className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors",
                      isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => window.location.href = "/api/logout"}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{getPageTitle()}</h1>
              <p className="text-slate-600">Welcome back, {getUserDisplayName()}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
              </Button>
              <Avatar>
                <AvatarImage src={user?.profileImageUrl} alt={getUserDisplayName()} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/profile" component={Profile} />
            <Route path="/assessments" component={Assessments} />
            <Route path="/learning-path" component={LearningPath} />
            <Route path="/courses" component={Courses} />
            <Route path="/progress" component={Progress} />
          </Switch>
        </main>
      </div>
    </div>
  );
}
