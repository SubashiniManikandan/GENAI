import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, ClipboardCheck, Clock, GraduationCap, TrendingUp, AlertCircle } from "lucide-react";
import ProgressChart from "@/components/Charts/ProgressChart";

export default function AdminDashboard() {
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: technologies } = useQuery({
    queryKey: ["/api/technologies"],
  });

  const { data: quizzes } = useQuery({
    queryKey: ["/api/quizzes"],
  });

  const { data: recentAttempts } = useQuery({
    queryKey: ["/api/quiz-attempts"],
    staleTime: 30000, // 30 seconds
  });

  // Mock recent activity data (in a real app, this would come from an API)
  const getRecentActivity = () => {
    if (!recentAttempts) return [];
    
    return recentAttempts.slice(0, 5).map(attempt => ({
      id: attempt.id,
      type: 'assessment',
      user: `User ${attempt.userId}`,
      action: `Completed Quiz ${attempt.quizId}`,
      score: attempt.score,
      timestamp: attempt.completedAt,
    }));
  };

  const getTechnologyStats = () => {
    if (!technologies || !recentAttempts) return [];
    
    const techStats = technologies.map(tech => {
      const techAttempts = recentAttempts.filter(attempt => 
        quizzes?.find(quiz => quiz.id === attempt.quizId && quiz.technologyId === tech.id)
      );
      
      const avgScore = techAttempts.length > 0 
        ? techAttempts.reduce((sum, attempt) => sum + parseFloat(attempt.score), 0) / techAttempts.length
        : 0;
      
      return {
        name: tech.name,
        attempts: techAttempts.length,
        avgScore: Math.round(avgScore),
      };
    });

    return techStats.sort((a, b) => b.avgScore - a.avgScore);
  };

  const getMonthlyStats = () => {
    // Generate sample monthly data
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      months.push({
        month: date.toLocaleDateString('en', { month: 'short' }),
        users: Math.floor(Math.random() * 50) + 100,
        completions: Math.floor(Math.random() * 30) + 40,
      });
    }
    
    return months;
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const recentActivity = getRecentActivity();
  const technologyStats = getTechnologyStats();
  const monthlyStats = getMonthlyStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-800">{adminStats?.totalUsers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-success mr-1" />
              <span className="text-success">↑ 12%</span>
              <span className="text-slate-600 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Assessments</p>
                <p className="text-2xl font-bold text-slate-800">{adminStats?.activeAssessments || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-success mr-1" />
              <span className="text-success">↑ 8%</span>
              <span className="text-slate-600 ml-2">completion rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Learning Hours</p>
                <p className="text-2xl font-bold text-slate-800">{adminStats?.totalLearningHours || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-success mr-1" />
              <span className="text-success">↑ 23%</span>
              <span className="text-slate-600 ml-2">this quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Course Completions</p>
                <p className="text-2xl font-bold text-slate-800">{adminStats?.courseCompletions || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-success mr-1" />
              <span className="text-success">↑ 15%</span>
              <span className="text-slate-600 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart data={monthlyStats} />
          </CardContent>
        </Card>

        {/* Recent User Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold text-sm">
                        {activity.user.slice(-2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{activity.action}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-slate-600">
                          Score: {activity.score}%
                        </p>
                        <span className="text-slate-400">•</span>
                        <p className="text-sm text-slate-600">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Technology Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Technology Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {technologyStats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">No technology performance data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {technologyStats.map((tech) => (
                <div key={tech.name} className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">{tech.name}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${tech.avgScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-600 w-10">{tech.avgScore}%</span>
                    </div>
                    <Badge variant="outline">
                      {tech.attempts} attempts
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" 
              onClick={() => window.location.href = '/admin/quiz-management'}>
          <CardContent className="pt-6 text-center">
            <ClipboardCheck className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-slate-800 mb-2">Manage Quizzes</h3>
            <p className="text-sm text-slate-600">Create and edit assessment quizzes</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.location.href = '/admin/user-management'}>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="font-semibold text-slate-800 mb-2">Manage Users</h3>
            <p className="text-sm text-slate-600">View and manage user accounts</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => window.location.href = '/admin/reports'}>
          <CardContent className="pt-6 text-center">
            <GraduationCap className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-800 mb-2">View Reports</h3>
            <p className="text-sm text-slate-600">Generate detailed analytics reports</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
