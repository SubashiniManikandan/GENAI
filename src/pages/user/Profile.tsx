import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const profileSchema = z.object({
  department: z.string().min(1, "Department is required"),
  experienceLevel: z.string().min(1, "Experience level is required"),
  currentSkills: z.array(z.string()).min(1, "Please select at least one current skill"),
  learningGoals: z.array(z.string()).min(1, "Please select at least one learning goal"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const departments = [
  "Software Development",
  "Data Science", 
  "UI/UX Design",
  "Quality Assurance",
  "DevOps",
  "Product Management"
];

const skillOptions = [
  "JavaScript",
  "React.js",
  "Node.js", 
  "Python",
  "Java",
  "HTML/CSS",
  "TypeScript",
  "SQL",
  "MongoDB",
  "AWS"
];

const learningGoalOptions = [
  { id: "fullstack-node", title: "Full Stack Development (Node.js + React)", description: "Complete web development stack" },
  { id: "fullstack-java", title: "Full Stack Development (Java + React)", description: "Enterprise Java development" },
  { id: "data-science", title: "Data Science & Analytics", description: "Machine learning and data analysis" },
  { id: "uiux", title: "UI/UX Design", description: "User interface and experience design" },
  { id: "automation", title: "Automation Testing", description: "Test automation and quality assurance" },
  { id: "aiml", title: "AI/ML Development", description: "Artificial intelligence and machine learning" }
];

const experienceLevels = [
  { value: "0-2", label: "0-2 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "6-10", label: "6-10 years" },
  { value: "10+", label: "10+ years" }
];

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [learningGoals, setLearningGoals] = useState<string[]>([]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/profile"],
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      department: profile?.department || "",
      experienceLevel: profile?.experienceLevel || "",
      currentSkills: profile?.currentSkills || [],
      learningGoals: profile?.learningGoals || [],
    },
  });

  // Update form when profile data loads
  useState(() => {
    if (profile) {
      form.reset({
        department: profile.department || "",
        experienceLevel: profile.experienceLevel || "",
        currentSkills: profile.currentSkills || [],
        learningGoals: profile.learningGoals || [],
      });
      setCurrentSkills(profile.currentSkills || []);
      setLearningGoals(profile.learningGoals || []);
    }
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest("POST", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile Saved",
        description: "Your profile has been updated successfully.",
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
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSkillChange = (skill: string, checked: boolean) => {
    const updated = checked 
      ? [...currentSkills, skill]
      : currentSkills.filter(s => s !== skill);
    setCurrentSkills(updated);
    form.setValue("currentSkills", updated);
  };

  const handleLearningGoalChange = (goalId: string, checked: boolean) => {
    const updated = checked
      ? [...learningGoals, goalId]
      : learningGoals.filter(g => g !== goalId);
    setLearningGoals(updated);
    form.setValue("learningGoals", updated);
  };

  const onSubmit = (data: ProfileFormData) => {
    saveProfileMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Profile Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          {experienceLevels.map((level) => (
                            <div key={level.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={level.value} id={level.value} />
                              <Label htmlFor={level.value}>{level.label}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Current Skills */}
              <FormField
                control={form.control}
                name="currentSkills"
                render={() => (
                  <FormItem>
                    <FormLabel>Current Skills</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {skillOptions.map((skill) => (
                        <div key={skill} className="flex items-center space-x-2 p-3 border border-slate-300 rounded-lg hover:bg-slate-50">
                          <Checkbox
                            id={skill}
                            checked={currentSkills.includes(skill)}
                            onCheckedChange={(checked) => handleSkillChange(skill, checked as boolean)}
                          />
                          <Label htmlFor={skill} className="cursor-pointer">{skill}</Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Learning Goals */}
              <FormField
                control={form.control}
                name="learningGoals"
                render={() => (
                  <FormItem>
                    <FormLabel>What would you like to learn?</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {learningGoalOptions.map((goal) => (
                        <div key={goal.id} className="flex items-center space-x-3 p-4 border border-slate-300 rounded-lg hover:bg-slate-50">
                          <Checkbox
                            id={goal.id}
                            checked={learningGoals.includes(goal.id)}
                            onCheckedChange={(checked) => handleLearningGoalChange(goal.id, checked as boolean)}
                          />
                          <div>
                            <Label htmlFor={goal.id} className="font-medium cursor-pointer">{goal.title}</Label>
                            <p className="text-sm text-slate-600">{goal.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  disabled={saveProfileMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {saveProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
                <Button type="button" variant="outline">
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
