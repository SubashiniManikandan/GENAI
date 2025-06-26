import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { BookOpen, Clock, Star, Play, CheckCircle, Search, AlertCircle } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import { isUnauthorizedError } from "../../lib/authUtils";

export default function Courses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTechnology, setSelectedTechnology] = useState<string>("all");

  type Course = {
    id: number;
    title: string;
    description?: string;
    technologyId: number;
    difficultyLevel?: string;
    estimatedHours?: number;
  };

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    initialData: [],
  });

  type UserCourse = { id: number; courseId: number; progress: string; status: string };
  const { data: userCourses, isLoading: userCoursesLoading } = useQuery<UserCourse[]>({
    queryKey: ["/api/user-courses"],
    initialData: [],
  });

  type Technology = { id: number; name: string };
  const { data: technologies = [] } = useQuery<Technology[]>({
    queryKey: ["/api/technologies"],
    initialData: [],
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await apiRequest("POST", "/api/user-courses", {
        courseId,
        status: "not_started",
        progress: "0",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-courses"] });
      toast({
        title: "Enrolled Successfully",
        description: "You have been enrolled in the course.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ courseId, progress }: { courseId: number; progress: number }) => {
      const response = await apiRequest("PATCH", `/api/user-courses/${courseId}/progress`, {
        progress,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-courses"] });
      toast({
        title: "Progress Updated",
        description: "Your course progress has been updated.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getTechnologyName = (technologyId: number) => {
    const tech = technologies?.find(t => t.id === technologyId);
    return tech?.name || `Technology ${technologyId}`;
  };

  const getUserCourse = (courseId: number) => {
    return userCourses?.find(uc => uc.courseId === courseId);
  };

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTechnology = selectedTechnology === "all" || 
                             course.technologyId.toString() === selectedTechnology;
    return matchesSearch && matchesTechnology;
  }) || [];

  const enrolledCourses = userCourses?.filter(uc => uc.status !== "not_started") || [];
  const inProgressCourses = userCourses?.filter(uc => uc.status === "in_progress") || [];
  const completedCourses = userCourses?.filter(uc => uc.status === "completed") || [];

  const handleContinueCourse = (courseId: number) => {
    const userCourse = getUserCourse(courseId);
    if (userCourse) {
      const currentProgress = parseFloat(userCourse.progress);
      const newProgress = Math.min(100, currentProgress + 10); // Simulate progress increment
      updateProgressMutation.mutate({ courseId, progress: newProgress });
    }
  };

  if (coursesLoading || userCoursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">My Courses</h2>
          <p className="text-slate-600">Continue learning and explore new courses</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedTechnology} onValueChange={setSelectedTechnology}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by technology" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Technologies</SelectItem>
              {technologies?.map((tech) => (
                <SelectItem key={tech.id} value={tech.id.toString()}>
                  {tech.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{enrolledCourses.length}</p>
            <p className="text-sm text-slate-600">Enrolled Courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Play className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{inProgressCourses.length}</p>
            <p className="text-sm text-slate-600">In Progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-accent" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{completedCourses.length}</p>
            <p className="text-sm text-slate-600">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning Section */}
      {inProgressCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressCourses.slice(0, 4).map((userCourse) => {
                const course = courses?.find(c => c.id === userCourse.courseId);
                if (!course) return null;

                return (
                  <div key={userCourse.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-800">{course.title}</h4>
                      <Badge variant="outline">{getTechnologyName(course.technologyId)}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Progress value={parseFloat(userCourse.progress)} className="flex-1 h-2" />
                      <span className="text-sm text-slate-600">{userCourse.progress}%</span>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleContinueCourse(course.id)}
                      disabled={updateProgressMutation.isPending}
                    >
                      Continue
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Available Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Courses Found</h3>
              <p className="text-slate-600">
                {searchTerm || selectedTechnology !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "No courses are available at the moment."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const userCourse = getUserCourse(course.id);
                const isEnrolled = !!userCourse;
                const progress = userCourse ? parseFloat(userCourse.progress) : 0;
                const status = userCourse?.status || "not_enrolled";

                return (
                  <Card key={course.id} className="h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline">{getTechnologyName(course.technologyId)}</Badge>
                        {course.difficultyLevel && (
                          <Badge variant="secondary">{course.difficultyLevel}</Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-slate-800 mb-2">{course.title}</h3>
                      
                      {course.description && (
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                        {course.estimatedHours && (
                          <span><Clock className="inline h-4 w-4 mr-1" />{course.estimatedHours}h</span>
                        )}
                        <span><Star className="inline h-4 w-4 mr-1" />4.8/5</span>
                      </div>

                      {isEnrolled && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      <Button
                        className="w-full"
                        variant={status === "completed" ? "outline" : "default"}
                        onClick={() => {
                          if (isEnrolled) {
                            handleContinueCourse(course.id);
                          } else {
                            enrollMutation.mutate(course.id);
                          }
                        }}
                        disabled={enrollMutation.isPending || updateProgressMutation.isPending}
                      >
                        {status === "completed" ? "Review" :
                         status === "in_progress" ? "Continue" :
                         isEnrolled ? "Start" : "Enroll"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
