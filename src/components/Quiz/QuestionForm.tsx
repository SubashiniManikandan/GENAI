import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  optionD: z.string().min(1, "Option D is required"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  points: z.number().min(1, "Points must be at least 1"),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface QuestionFormProps {
  question?: Question | null;
  onSave: (question: Omit<Question, "id" | "order">) => void;
  onCancel: () => void;
}

export default function QuestionForm({ question, onSave, onCancel }: QuestionFormProps) {
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: question?.questionText || "",
      optionA: question?.options?.[0] || "",
      optionB: question?.options?.[1] || "",
      optionC: question?.options?.[2] || "",
      optionD: question?.options?.[3] || "",
      correctAnswer: question?.correctAnswer || "",
      points: question?.points || 1,
    },
  });

  const onSubmit = (data: QuestionFormData) => {
    const questionData = {
      questionText: data.questionText,
      options: [data.optionA, data.optionB, data.optionC, data.optionD],
      correctAnswer: data.correctAnswer,
      points: data.points,
    };
    onSave(questionData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {question ? "Edit Question" : "Add New Question"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the question"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="optionA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Option A</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter option A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="optionB"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Option B</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter option B" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="optionC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Option C</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter option C" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="optionD"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Option D</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter option D" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="correctAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correct Answer</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={form.watch("optionA") || "optionA"}>
                            Option A: {form.watch("optionA") || "Enter option A first"}
                          </SelectItem>
                          <SelectItem value={form.watch("optionB") || "optionB"}>
                            Option B: {form.watch("optionB") || "Enter option B first"}
                          </SelectItem>
                          <SelectItem value={form.watch("optionC") || "optionC"}>
                            Option C: {form.watch("optionC") || "Enter option C first"}
                          </SelectItem>
                          <SelectItem value={form.watch("optionD") || "optionD"}>
                            Option D: {form.watch("optionD") || "Enter option D first"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1">
                  {question ? "Update Question" : "Add Question"}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
