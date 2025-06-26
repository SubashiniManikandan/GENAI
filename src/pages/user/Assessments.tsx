import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import AssessmentTaker from "@/components/Assessment/AssessmentTaker";

export default function Assessments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [isAssessmentActive, setIsAssessmentActive] = useState(false);

  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["/api/quizzes"],
  });

  const { data: technologies } = useQuery({
    queryKey: ["/api/technologies"],
  });

  const { data: attempts } = useQuery({
    queryKey: ["/api/quiz-attempts"],
  });

  const submitAssessmentMutation = useMutation({
    mutationFn: async (assessmentData: any) => {
      const response = await apiRequest("POST", "/api/quiz-attempts", assessmentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-attempts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
      setIsAssessmentActive(false);
      setSelectedQuiz(null);
      toast({
        title: "Assessment Completed",
        description: "Your assessment has been submitted successfully. AI is generating your learning path.",
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
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getTechnologyName = (technologyId: number) => {
    const tech = technologies?.find(t => t.id === technologyId);
    return tech?.name || `Technology ${technologyId}`;
  };

  const getQuizIcon = (technologyName: string) => {
    const iconMap: Record<string, string> = {
      "Node.js": "fab fa-node-js",
      "React.js": "fab fa-react",
      "Java": "fab fa-java",
      "Python": "fab fa-python",
      "JavaScript": "fab fa-js",
    };
    return iconMap[technologyName] || "fas fa-code";
  };

  const hasUserTakenQuiz = (quizId: number) => {
    return attempts?.some(attempt => attempt.quizId === quizId);
  };

  const getUserQuizScore = (quizId: number) => {
    const attempt = attempts?.find(attempt => attempt.quizId === quizId);
    return attempt ? parseFloat(attempt.score) : null;
  };

  const handleStartAssessment = (quiz: any) => {
    setSelectedQuiz(quiz);
    setIsAssessmentActive(true);
  };

  const handleAssessmentComplete = (answers: any[], timeSpent: number) => {
    if (!selectedQuiz) return;

    // Calculate score (this would normally be done on the server with correct answers)
    const score = Math.floor(Math.random() * 40) + 60; // Placeholder: 60-100% score
    const correctAnswers = Math.floor((score / 100) * selectedQuiz.questions?.length || 10);

    submitAssessmentMutation.mutate({
      quizId: selectedQuiz.id,
      score: score.toString(),
      totalQuestions: selectedQuiz.questions?.length || 10,
      correctAnswers,
      timeSpent,
      answers,
    });
  };

  if (quizzesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAssessmentActive && selectedQuiz) {
    return (
      <AssessmentTaker
        quiz={selectedQuiz}
        onComplete={handleAssessmentComplete}
        onCancel={() => {
          setIsAssessmentActive(false);
          setSelectedQuiz(null);
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Available Assessments */}
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">Available Assessments</h2>
        
        {!quizzes || quizzes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No assessments available at the moment.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => {
              const hasTaken = hasUserTakenQuiz(quiz.id);
              const score = getUserQuizScore(quiz.id);
              const technologyName = getTechnologyName(quiz.technologyId);
              
              return (
                <Card key={quiz.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className={`${getQuizIcon(technologyName)} text-primary text-xl`}></i>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{quiz.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span><Clock className="inline h-4 w-4 mr-1" />{quiz.duration || 45} minutes</span>
                            <span>{technologyName}</span>
                            {quiz.difficultyLevel && (
                              <Badge variant="outline">{quiz.difficultyLevel}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasTaken && score !== null && (
                          <Badge variant={score >= 70 ? "default" : "secondary"}>
                            {score}%
                          </Badge>
                        )}
                        <Button
                          onClick={() => handleStartAssessment(quiz)}
                          variant={hasTaken ? "outline" : "default"}
                          disabled={submitAssessmentMutation.isPending}
                        >
                          {hasTaken ? "Retake" : "Start Assessment"}
                        </Button>
                      </div>
                    </div>
                    {quiz.description && (
                      <p className="text-slate-600 text-sm">{quiz.description}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Assessment History */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Results</h3>
        
        {!attempts || attempts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-4">
                <p className="text-slate-600 text-sm">No assessments completed yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {attempts.slice(0, 5).map((attempt) => (
              <Card key={attempt.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-slate-800">
                      {getTechnologyName(attempt.quizId)}
                    </p>
                    <Badge 
                      variant={parseFloat(attempt.score) >= 70 ? "default" : "secondary"}
                    >
                      {attempt.score}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{attempt.correctAnswers}/{attempt.totalQuestions} correct</span>
                    <span>{new Date(attempt.completedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
