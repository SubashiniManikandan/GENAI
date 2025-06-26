import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Eye, Trash2, Clock, Users, BarChart3, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import QuizForm from "@/components/Quiz/QuizForm";

export default function QuizManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTechnology, setSelectedTechnology] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);

  const { data: technologies, isLoading: technologiesLoading } = useQuery({
    queryKey: ["/api/technologies"],
  });

  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: selectedTechnology 
      ? ["/api/quizzes", { technologyId: selectedTechnology }]
      : ["/api/quizzes"],
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: number) => {
      await apiRequest("DELETE", `/api/quizzes/${quizId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({
        title: "Quiz Deleted",
        description: "The quiz has been deleted successfully.",
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
        description: "Failed to delete quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteQuiz = (quizId: number) => {
    if (confirm("Are you sure you want to delete this quiz?")) {
      deleteQuizMutation.mutate(quizId);
    }
  };

  const handleEditQuiz = (quiz: any) => {
    setEditingQuiz(quiz);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingQuiz(null);
  };

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

  const filteredQuizzes = selectedTechnology 
    ? quizzes?.filter(quiz => quiz.technologyId === selectedTechnology)
    : quizzes;

  if (technologiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Quiz Management</h2>
          <p className="text-slate-600">Create and manage assessment quizzes</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingQuiz ? "Edit Quiz" : "Create New Quiz"}
              </DialogTitle>
            </DialogHeader>
            <QuizForm 
              quiz={editingQuiz}
              technologies={technologies || []}
              onClose={handleCloseModal}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
                handleCloseModal();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Technology Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Technology</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTechnology?.toString() || "all"} 
                onValueChange={(value) => setSelectedTechnology(value === "all" ? null : parseInt(value))}>
            <TabsList className="grid grid-cols-4 md:grid-cols-7 lg:grid-cols-8">
              <TabsTrigger value="all">All</TabsTrigger>
              {technologies?.map((tech) => (
                <TabsTrigger key={tech.id} value={tech.id.toString()}>
                  {tech.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quiz List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedTechnology 
              ? `${getTechnologyName(selectedTechnology)} Quizzes`
              : "All Quizzes"
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quizzesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !filteredQuizzes || filteredQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Quizzes Found</h3>
              <p className="text-slate-600 mb-6">
                {selectedTechnology 
                  ? `No quizzes available for ${getTechnologyName(selectedTechnology)}.`
                  : "No quizzes have been created yet."
                }
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Quiz
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuizzes.map((quiz) => {
                const technologyName = getTechnologyName(quiz.technologyId);
                
                return (
                  <div key={quiz.id} className="border border-slate-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className={`${getQuizIcon(technologyName)} text-primary text-xl`}></i>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 mb-2">{quiz.title}</h3>
                          
                          <div className="flex items-center gap-6 text-sm text-slate-600 mb-2">
                            <span><Clock className="inline h-4 w-4 mr-1" />{quiz.duration || 45} minutes</span>
                            <Badge variant="outline">{technologyName}</Badge>
                            {quiz.difficultyLevel && (
                              <Badge variant="secondary">{quiz.difficultyLevel}</Badge>
                            )}
                          </div>

                          {quiz.description && (
                            <p className="text-sm text-slate-600 mb-2">{quiz.description}</p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Created {new Date(quiz.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Last updated {new Date(quiz.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditQuiz(quiz)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Navigate to quiz preview/view
                            console.log("View quiz:", quiz.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          disabled={deleteQuizMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
