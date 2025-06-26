import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserPen, ClipboardCheck, Route, BookOpen, CheckCircle, Clock, Play } from "lucide-react";
import { Link } from "wouter";
import ProgressBar from "@/components/Progress/ProgressBar";

export default function Dashboard() {
  const { data: userStats } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  const { data: learningPaths } = useQuery({
    queryKey: ["/api/learning-paths"],
  });

  const { data: userCourses } = useQuery({
    queryKey: ["/api/user-courses"],
  });

  const { data: recentAttempts } = useQuery({
    queryKey: ["/api/quiz-attempts"],
  });

  const activeLearningPath = learningPaths?.[0];
  const inProgressCourses = userCourses?.filter(course => course.status === "in_progress") || [];
  const recentActivity = recentAttempts?.slice(0, 3) || [];

  const progressSteps = [
    { step: "Profile Loaded", completed: true, icon: CheckCircle },
    { step: "Assessment Pending", completed: false, inProgress: true, icon: Clock },
    { step: "Assessment Completed", completed: false, icon: Clock },
    { step: "Recommendations Generated", completed: false, icon: Clock },
    { step: "Learning In Progress", completed: false, icon: Clock },
  ];

  const getProgressPercentage = () => {
    const completedSteps = progressSteps.filter(step => step.completed).length;
    return (completedSteps / progressSteps.length) * 100;
  };

  return (
    <div className="space-y-8">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressBar steps={progressSteps} />
          <div className="mt-6">
            <Progress value={getProgressPercentage()} className="h-2" />
            <p className="text-sm text-slate-600 mt-2">{Math.round(getProgressPercentage())}% Complete</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <UserPen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Update Profile</h3>
              <p className="text-sm text-slate-600">Manage your skills and preferences</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/assessments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <ClipboardCheck className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Take Assessment</h3>
              <p className="text-sm text-slate-600">Evaluate your current skills</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/learning-path">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Route className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">View Roadmap</h3>
              <p className="text-sm text-slate-600">See your personalized learning path</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/courses">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Continue Learning</h3>
              <p className="text-sm text-slate-600">Resume your courses</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Current Learning Path */}
      {activeLearningPath && (
        <Card>
          <CardHeader>
            <CardTitle>Active Learning Path</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">{activeLearningPath.title}</h3>
                <p className="text-slate-600">
                  Estimated completion: {activeLearningPath.estimatedWeeks} weeks
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{activeLearningPath.progress}%</p>
                <p className="text-sm text-slate-600">Complete</p>
              </div>
            </div>
            <Progress value={parseFloat(activeLearningPath.progress)} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Current Courses and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* In Progress Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
          </CardHeader>
          <CardContent>
            {inProgressCourses.length === 0 ? (
              <p className="text-slate-600 text-center py-4">No courses in progress</p>
            ) : (
              <div className="space-y-4">
                {inProgressCourses.slice(0, 3).map((userCourse) => (
                  <div key={userCourse.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <Play className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">Course {userCourse.courseId}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={parseFloat(userCourse.progress)} className="flex-1 h-2" />
                        <span className="text-sm text-slate-600">{userCourse.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-slate-600 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((attempt) => (
                  <div key={attempt.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-success-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">
                        Completed Assessment (Quiz {attempt.quizId})
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant={parseFloat(attempt.score) >= 70 ? "default" : "secondary"}>
                          {attempt.score}%
                        </Badge>
                        <p className="text-sm text-slate-600">
                          {new Date(attempt.completedAt).toLocaleDateString()}
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

      {/* Stats Overview */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{userStats.coursesCompleted}</p>
              <p className="text-sm text-slate-600">Courses Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{userStats.hoursLearned}</p>
              <p className="text-sm text-slate-600">Hours Learned</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{userStats.achievements}</p>
              <p className="text-sm text-slate-600">Achievements</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
