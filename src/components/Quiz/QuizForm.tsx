import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import QuestionForm from "./QuestionForm";

const quizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  technologyId: z.number().min(1, "Technology is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

type QuizFormData = z.infer<typeof quizSchema>;

interface Question {
  id?: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  points: number;
  order: number;
}

interface QuizFormProps {
  quiz?: any;
  technologies: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuizForm({ quiz, technologies, onClose, onSuccess }: QuizFormProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>(quiz?.questions || []);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: quiz?.title || "",
      description: quiz?.description || "",
      technologyId: quiz?.technologyId || 0,
      duration: quiz?.duration || 45,
      difficultyLevel: quiz?.difficultyLevel || "intermediate",
    },
  });

  const createQuizMutation = useMutation({
    mutationFn: async (data: QuizFormData) => {
      const endpoint = quiz ? `/api/quizzes/${quiz.id}` : "/api/quizzes";
      const method = quiz ? "PUT" : "POST";
      const response = await apiRequest(method, endpoint, data);
      return response.json();
    },
    onSuccess: (data) => {
      // Save questions if creating a new quiz
      if (!quiz && questions.length > 0) {
        saveQuestions(data.id);
      } else {
        toast({
          title: quiz ? "Quiz Updated" : "Quiz Created",
          description: `The quiz has been ${quiz ? "updated" : "created"} successfully.`,
        });
        onSuccess();
      }
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
        description: `Failed to ${quiz ? "update" : "create"} quiz. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const saveQuestions = async (quizId: number) => {
    try {
      for (const question of questions) {
        await apiRequest("POST", `/api/quizzes/${quizId}/questions`, question);
      }
      toast({
        title: "Quiz Created",
        description: "The quiz and questions have been created successfully.",
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Warning",
        description: "Quiz created but some questions failed to save.",
        variant: "destructive",
      });
      onSuccess();
    }
  };

  const onSubmit = (data: QuizFormData) => {
    createQuizMutation.mutate(data);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsQuestionFormOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsQuestionFormOpen(true);
  };

  const handleSaveQuestion = (questionData: Omit<Question, "id" | "order">) => {
    if (editingQuestion) {
      // Update existing question
      setQuestions(prev => prev.map(q => 
        q === editingQuestion 
          ? { ...q, ...questionData }
          : q
      ));
    } else {
      // Add new question
      const newQuestion: Question = {
        ...questionData,
        order: questions.length + 1,
      };
      setQuestions(prev => [...prev, newQuestion]);
    }
    setIsQuestionFormOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (question: Question) => {
    setQuestions(prev => prev.filter(q => q !== question));
  };

  const getTechnologyName = (id: number) => {
    const tech = technologies.find(t => t.id === id);
    return tech?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Quiz Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quiz Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter quiz title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="technologyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technology</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select technology" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {technologies.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id.toString()}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="45"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficultyLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter quiz description"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* Questions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Questions ({questions.length})</CardTitle>
            <Button type="button" onClick={handleAddQuestion} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">No questions added yet. Click "Add Question" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Question {index + 1}</Badge>
                        <Badge variant="secondary">{question.points} points</Badge>
                      </div>
                      <p className="font-medium text-slate-800 mb-2">{question.questionText}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.map((option, optionIndex) => (
                          <div 
                            key={optionIndex} 
                            className={`p-2 rounded border text-sm ${
                              option === question.correctAnswer 
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            {String.fromCharCode(65 + optionIndex)}. {option}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Form Modal */}
      {isQuestionFormOpen && (
        <QuestionForm
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => {
            setIsQuestionFormOpen(false);
            setEditingQuestion(null);
          }}
        />
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={createQuizMutation.isPending}
          className="flex-1"
        >
          {createQuizMutation.isPending 
            ? (quiz ? "Updating..." : "Creating...") 
            : (quiz ? "Update Quiz" : "Create Quiz")
          }
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
