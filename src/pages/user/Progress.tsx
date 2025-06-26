import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Trophy, TrendingUp, Award, Target, Calendar } from "lucide-react";
import ProgressChart from "@/components/Charts/ProgressChart";

export default function UserProgress() {
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
  });

  const { data: userCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/user-courses"],
  });

  const { data: quizAttempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ["/api/quiz-attempts"],
  });

  const { data: learningPaths } = useQuery({
    queryKey: ["/api/learning-paths"],
  });

  const { data: technologies } = useQuery({
    queryKey: ["/api/technologies"],
  });

  const isLoading = statsLoading || coursesLoading || attemptsLoading;

  const getTechnologyName = (technologyId: number) => {
    const tech = technologies?.find(t => t.id === technologyId);
    return tech?.name || `Technology ${technologyId}`;
  };

  const getCompletedCourses = () => {
    return userCourses?.filter(course => course.status === "completed") || [];
  };

  const getInProgressCourses = () => {
    return userCourses?.filter(course => course.status === "in_progress") || [];
  };

  const getRecentAchievements = () => {
    const achievements = [];
    
    // Add course completion achievements
    const completedCourses = getCompletedCourses();
    completedCourses.forEach(course => {
      achievements.push({
        title: "Course Completed",
        description: `Finished Course ${course.courseId}`,
        date: course.completedAt,
        type: "course",
        icon: BookOpen,
      });
    });

    // Add assessment achievements
    quizAttempts?.forEach(attempt => {
      if (parseFloat(attempt.score) >= 80) {
        achievements.push({
          title: "High Score Achievement",
          description: `Scored ${attempt.score}% in assessment`,
          date: attempt.completedAt,
          type: "assessment",
          icon: Award,
        });
      }
    });

    return achievements
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const getSkillProgress = () => {
    const skillMap = new Map();
    
    // Calculate progress from quiz attempts
    quizAttempts?.forEach(attempt => {
      const tech = technologies?.find(t => t.id === attempt.quizId); // Simplified mapping
      if (tech) {
        const currentScore = skillMap.get(tech.name) || 0;
        const score = parseFloat(attempt.score);
        if (score > currentScore) {
          skillMap.set(tech.name, score);
        }
      }
    });

    return Array.from(skillMap.entries()).map(([skill, score]) => ({
      skill,
      score: Math.round(score),
    }));
  };

  const getWeeklyProgress = () => {
    // Generate sample weekly progress data
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      
      // Calculate courses completed in this week
      const weekStart = new Date(date);
      const weekEnd = new Date(date);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const coursesThisWeek = getCompletedCourses().filter(course => {
        const completedDate = new Date(course.completedAt);
        return completedDate >= weekStart && completedDate < weekEnd;
      }).length;

      weeks.push({
        week: `Week ${8 - i}`,
        courses: coursesThisWeek,
        hours: coursesThisWeek * 2.5, // Estimate 2.5 hours per course
      });
    }
    
    return weeks;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const skillProgress = getSkillProgress();
  const weeklyProgress = getWeeklyProgress();
  const recentAchievements = getRecentAchievements();
  const activeLearningPath = learningPaths?.[0];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{userStats?.coursesCompleted || 0}</p>
            <p className="text-sm text-slate-600">Courses Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-accent" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{userStats?.hoursLearned || 0}</p>
            <p className="text-sm text-slate-600">Hours Learned</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{userStats?.achievements || 0}</p>
            <p className="text-sm text-slate-600">Achievements</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{getInProgressCourses().length}</p>
            <p className="text-sm text-slate-600">Active Courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Path Progress */}
      {activeLearningPath && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Current Learning Path
            </CardTitle>
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
            <Progress value={parseFloat(activeLearningPath.progress)} className="h-3" />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart data={weeklyProgress} />
          </CardContent>
        </Card>

        {/* Skill Proficiency */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Proficiency</CardTitle>
          </CardHeader>
          <CardContent>
            {skillProgress.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600">Complete assessments to see your skill progress</p>
              </div>
            ) : (
              <div className="space-y-4">
                {skillProgress.map(({ skill, score }) => (
                  <div key={skill} className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium">{skill}</span>
                    <div className="flex items-center gap-2 flex-1 max-w-32">
                      <Progress value={score} className="h-2" />
                      <span className="text-sm font-medium text-slate-800 min-w-[3rem]">{score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAchievements.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No achievements yet. Keep learning to unlock them!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <achievement.icon className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{achievement.title}</p>
                      <p className="text-sm text-slate-600">{achievement.description}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Active Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {getInProgressCourses().length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No active courses. Start learning today!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getInProgressCourses().slice(0, 5).map((userCourse) => (
                  <div key={userCourse.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
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
      </div>

      {/* Recent Assessment Results */}
      {quizAttempts && quizAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Assessment Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizAttempts.slice(0, 6).map((attempt) => (
                <div key={attempt.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-slate-800">
                      Quiz {attempt.quizId}
                    </p>
                    <Badge 
                      variant={parseFloat(attempt.score) >= 70 ? "default" : "secondary"}
                    >
                      {attempt.score}%
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600">
                    <p>{attempt.correctAnswers}/{attempt.totalQuestions} correct</p>
                    <p className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
