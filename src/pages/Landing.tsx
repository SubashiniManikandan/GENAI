import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { GraduationCap, User, Shield } from "lucide-react";

export default function Landing() {
  const handleUserLogin = () => {
    window.location.href = "/api/login";
  };

  const handleAdminLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen skillforge-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">SkillForge</h1>
          <p className="text-slate-600">AI-Powered Learning Platform</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button
            onClick={handleUserLogin}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <User className="h-5 w-5" />
            <span>Continue as Learner</span>
          </Button>
          
          <Button
            onClick={handleAdminLogin}
            variant="outline"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <Shield className="h-5 w-5" />
            <span>Continue as Admin</span>
          </Button>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">Hexaware Technologies Limited</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
