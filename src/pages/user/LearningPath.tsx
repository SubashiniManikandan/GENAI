import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Play, Lock, Clock, Star, AlertCircle } from "lucide-react";

export default function LearningPath() {
  const { data: learningPaths, isLoading } = useQuery({
    queryKey: ["/api/learning-paths"],
  });

  const { data: technologies } = useQuery({
    queryKey: ["/api/technologies"],
  });

  const activePath = learningPaths?.[0];

  const getTechnologyNames = (technologyIds: number[]) => {
    if (!technologies || !technologyIds) return [];
    return technologyIds.map(id => {
      const tech = technologies.find(t => t.id === id);
      return tech?.name || `Tech ${id}`;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!activePath) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Learning Path Available</h3>
            <p className="text-slate-600 mb-6">
              Complete your profile setup and take assessments to get a personalized learning roadmap.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => window.location.href = '/profile'}>
                Complete Profile
              </Button>
              <Button onClick={() => window.location.href = '/assessments'}>
                Take Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const roadmapData = activePath.roadmapData as any;
  const modules = roadmapData?.modules || [];
  const phases = roadmapData?.learningPath || [];

  return (
    <div className="space-y-6">
      {/* Learning Path Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Personalized Learning Path</CardTitle>
          <p className="text-slate-600">AI-generated roadmap based on your assessment results</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{activePath.title}</h3>
              <p className="text-slate-600">
                Estimated completion: {activePath.estimatedWeeks} weeks
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {getTechnologyNames(activePath.technologyIds || []).map((tech) => (
                  <Badge key={tech} variant="outline">{tech}</Badge>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{activePath.progress}%</p>
              <p className="text-sm text-slate-600">Complete</p>
            </div>
          </div>
          <Progress value={parseFloat(activePath.progress)} className="h-2" />
          {activePath.description && (
            <p className="text-slate-600 mt-4">{activePath.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Learning Phases */}
      {phases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Phases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {phases.map((phase: any, index: number) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-800">{phase.phase}</h4>
                    <Badge variant="outline">{phase.duration}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Topics</p>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {phase.topics?.map((topic: string, topicIndex: number) => (
                          <li key={topicIndex} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Learning Outcomes</p>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {phase.outcomes?.map((outcome: string, outcomeIndex: number) => (
                          <li key={outcomeIndex} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-success" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Modules */}
      {modules.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">Learning Modules</h2>
          
          {modules.map((module: any, index: number) => {
            // Simulate module status based on progress
            const progress = parseFloat(activePath.progress);
            const moduleProgress = Math.max(0, Math.min(100, progress - (index * 25)));
            const status = moduleProgress >= 100 ? 'completed' : moduleProgress > 0 ? 'in_progress' : 'locked';
            
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      status === 'completed' ? 'bg-success text-success-foreground' :
                      status === 'in_progress' ? 'bg-primary text-primary-foreground' :
                      'bg-slate-300 text-slate-500'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : status === 'in_progress' ? (
                        <Play className="h-6 w-6" />
                      ) : (
                        <Lock className="h-6 w-6" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 mb-1">{module.title}</h4>
                      <p className="text-slate-600 text-sm mb-2">{module.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                        <span><Clock className="inline h-4 w-4 mr-1" />{module.estimatedHours} hours</span>
                        <span><Star className="inline h-4 w-4 mr-1" />4.8/5</span>
                        <Badge 
                          variant={
                            status === 'completed' ? 'default' :
                            status === 'in_progress' ? 'secondary' :
                            'outline'
                          }
                        >
                          {status === 'completed' ? 'Completed' :
                           status === 'in_progress' ? 'In Progress' :
                           'Locked'}
                        </Badge>
                      </div>

                      {module.skills && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {module.skills.map((skill: string, skillIndex: number) => (
                            <Badge key={skillIndex} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {status === 'in_progress' && (
                        <Progress value={moduleProgress} className="h-2" />
                      )}
                    </div>
                    
                    <Button
                      variant={status === 'completed' ? 'outline' : 'default'}
                      disabled={status === 'locked'}
                    >
                      {status === 'completed' ? 'Review' :
                       status === 'in_progress' ? 'Continue' :
                       'Locked'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State for Modules */}
      {modules.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-slate-600">
                Learning modules will appear here once your AI roadmap is generated.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
