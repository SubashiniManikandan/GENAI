import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";

interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  points: number;
  order: number;
}

interface AssessmentTakerProps {
  quiz: {
    id: number;
    title: string;
    description?: string;
    duration: number;
    questions?: Question[];
  };
  onComplete: (answers: Record<number, string>, timeSpent: number) => void;
  onCancel: () => void;
}

export default function AssessmentTaker({ quiz, onComplete, onCancel }: AssessmentTakerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60); // Convert minutes to seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Mock questions if not provided
  const questions: Question[] = quiz.questions || [
    {
      id: 1,
      questionText: "What is the primary purpose of React hooks?",
      options: [
        "To manage component lifecycle",
        "To handle state and side effects in functional components",
        "To create class components",
        "To optimize rendering performance"
      ],
      correctAnswer: "To handle state and side effects in functional components",
      points: 1,
      order: 1
    },
    {
      id: 2,
      questionText: "Which of the following is NOT a valid React hook?",
      options: [
        "useState",
        "useEffect",
        "useContext",
        "useComponent"
      ],
      correctAnswer: "useComponent",
      points: 1,
      order: 2
    },
    {
      id: 3,
      questionText: "What does the useEffect hook do?",
      options: [
        "Manages component state",
        "Handles side effects in functional components",
        "Creates context providers",
        "Optimizes component rendering"
      ],
      correctAnswer: "Handles side effects in functional components",
      points: 1,
      order: 3
    },
    {
      id: 4,
      questionText: "How do you pass data from parent to child component in React?",
      options: [
        "Using state",
        "Using props",
        "Using context",
        "Using refs"
      ],
      correctAnswer: "Using props",
      points: 1,
      order: 4
    },
    {
      id: 5,
      questionText: "What is JSX?",
      options: [
        "A JavaScript library",
        "A syntax extension for JavaScript",
        "A CSS framework",
        "A testing framework"
      ],
      correctAnswer: "A syntax extension for JavaScript",
      points: 1,
      order: 5
    }
  ];

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowConfirmation(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const timeSpent = (quiz.duration * 60) - timeLeft;
    onComplete(answers, timeSpent);
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const isCurrentQuestionAnswered = () => {
    return answers[currentQuestion.id] !== undefined;
  };

  if (showConfirmation) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Submit Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg text-slate-800 mb-4">
              Are you sure you want to submit your assessment?
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800">Questions Answered</p>
                <p className="text-2xl font-bold text-blue-600">
                  {getAnsweredCount()} / {totalQuestions}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="font-medium text-orange-800">Time Remaining</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatTime(timeLeft)}
                </p>
              </div>
            </div>
          </div>
          
          {getAnsweredCount() < totalQuestions && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <AlertCircle className="inline h-4 w-4 mr-1" />
                You have {totalQuestions - getAnsweredCount()} unanswered questions.
                You can still go back to answer them.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button 
              onClick={() => setShowConfirmation(false)}
              variant="outline"
              className="flex-1"
            >
              Go Back
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Assessment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{quiz.title}</CardTitle>
              <p className="text-slate-600">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className={timeLeft < 300 ? "text-red-600 font-medium" : "text-slate-600"}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Badge variant="outline">
                {getAnsweredCount()} / {totalQuestions} answered
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">Question {currentQuestionIndex + 1}</Badge>
                <Badge variant="secondary">{currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 leading-relaxed">
                {currentQuestion.questionText}
              </h3>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={handleAnswerChange}
            className="space-y-4"
          >
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index}
                className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer text-slate-700"
                >
                  <span className="font-medium mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={onCancel}
            variant="outline"
            className="text-slate-600"
          >
            Exit Assessment
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            Previous
          </Button>
          
          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={() => setShowConfirmation(true)}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Review & Submit
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isCurrentQuestionAnswered()}
            >
              Next Question
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Question Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {questions.map((_, index) => {
              const isAnswered = answers[questions[index].id] !== undefined;
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <Button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  className={`aspect-square p-0 ${
                    isAnswered && !isCurrent ? "bg-success/10 border-success text-success" : ""
                  }`}
                >
                  {index + 1}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
