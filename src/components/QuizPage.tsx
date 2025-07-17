
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Home, Clock, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import topicsData from '@/data/topics.json';
import CodeHighlighter from '@/components/CodeHighlighter';
import { useIsMobile } from '@/hooks/use-mobile';

interface Question {
  id: number;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: string;
  explanation: string;
}

interface QuizResult {
  questionId: number;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

const QuizPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const topic = topicsData.find(t => t.id === topicId);
  const quizModules = import.meta.glob('@/data/*.json', { eager: true });

  useEffect(() => {
    const loadQuestions = () => {
      try {
        if (!topic?.file) throw new Error('Invalid topic');

        const matchKey = Object.keys(quizModules).find(key =>
          key.endsWith(`/${topic.file}`)
        );

        if (!matchKey) throw new Error('Quiz data not found');

        const module = quizModules[matchKey] as { default: Question[] };
        const questionsData = module.default;

        const shuffledQuestions = [...questionsData].sort(() => Math.random() - 0.5);
        setQuestions(shuffledQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Error loading quiz:', error);
        toast({
          title: "Error",
          description: "Failed to load quiz questions",
          variant: "destructive"
        });
        navigate('/');
      }
    };

    if (topic) {
      loadQuestions();
    }
  }, [topicId, topic, navigate, toast]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string) => {
    if (!hasSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmit = () => {
    if (!selectedAnswer) {
      toast({
        title: "Please select an answer",
        description: "You must choose an option before submitting",
        variant: "destructive"
      });
      return;
    }

    setHasSubmitted(true);
    setShowResult(true);
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.answer;

    const result: QuizResult = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      selectedAnswer,
      correctAnswer: currentQuestion.answer,
      isCorrect,
      explanation: currentQuestion.explanation
    };

    const newResults = [...results, result];
    setResults(newResults);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setHasSubmitted(false);
      setShowResult(false);
    } else {
      setIsQuizComplete(true);
      localStorage.setItem('quizResults', JSON.stringify({
        topicTitle: topic?.title,
        results: newResults,
        timeElapsed,
        totalQuestions: questions.length
      }));
      navigate('/results');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setResults(prev => prev.slice(0, -1));
      setSelectedAnswer('');
      setHasSubmitted(false);
      setShowResult(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!topic || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-6 sm:py-8">
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">Quiz not found</p>
            <Button onClick={() => navigate('/')} size={isMobile ? "sm" : "default"}>
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const score = results.filter(r => r.isCorrect).length;
  const isCorrect = selectedAnswer === currentQuestion.answer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className={`container mx-auto ${isMobile ? 'p-2' : 'p-4 max-w-4xl'}`}>
        {/* Header */}
        <div className={`flex flex-col ${isMobile ? 'mb-3' : 'sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6'} gap-3`}>
          <div className="min-w-0 flex-1">
            <h1 className={`font-bold text-gray-800 dark:text-white truncate ${isMobile ? 'text-lg' : 'text-xl sm:text-2xl'}`}>
              {topic.title}
            </h1>
            <div className={`flex flex-wrap items-center mt-2 ${isMobile ? 'gap-1' : 'gap-2 sm:gap-4'}`}>
              <Badge variant="outline" className="text-xs">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(timeElapsed)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Score: {score}/{results.length}
              </Badge>
            </div>
          </div>
          {!isMobile && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              size="default"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          )}
        </div>

        {/* Progress */}
        <div className={isMobile ? 'mb-3' : 'mb-4 sm:mb-6'}>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className={`${isMobile ? 'mb-3 min-h-[calc(100vh-200px)]' : 'mb-4 sm:mb-6'}`}>
          <CardHeader className={isMobile ? 'p-3 pb-2' : 'p-4 sm:p-6'}>
            <CardTitle className={isMobile ? 'text-sm' : 'text-base sm:text-lg'}>
              Question {currentQuestionIndex + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? 'p-3 pt-0 flex flex-col justify-between min-h-[400px]' : 'p-4 sm:p-6 pt-0'}>
            <div>
              <div className={isMobile ? 'mb-4' : 'mb-4 sm:mb-6'}>
                <div className={isMobile ? 'text-sm' : ''}>
                  <CodeHighlighter text={currentQuestion.question} />
                </div>
              </div>

              {/* Options */}
              <div className={`space-y-2 ${isMobile ? 'space-y-3' : 'sm:space-y-3'}`}>
                {(['option1', 'option2', 'option3', 'option4'] as const).map((optionKey) => {
                  const isSelected = selectedAnswer === optionKey;
                  const isCorrectOption = currentQuestion.answer === optionKey;
                  
                  let optionClass = `w-full text-left rounded-lg border-2 transition-all duration-200 ${
                    isMobile ? 'p-4 min-h-[60px]' : 'p-3 sm:p-4'
                  } `;
                  
                  if (hasSubmitted) {
                    if (isCorrectOption) {
                      optionClass += 'border-green-500 bg-green-50 dark:bg-green-900/20 ';
                    } else if (isSelected && !isCorrectOption) {
                      optionClass += 'border-red-500 bg-red-50 dark:bg-red-900/20 ';
                    } else {
                      optionClass += 'border-gray-200 dark:border-gray-700 opacity-60 ';
                    }
                  } else {
                    if (isSelected) {
                      optionClass += 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ';
                    } else {
                      optionClass += 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 ';
                    }
                  }

                  return (
                    <button
                      key={optionKey}
                      onClick={() => handleAnswerSelect(optionKey)}
                      disabled={hasSubmitted}
                      className={optionClass}
                    >
                      <div className="flex items-start">
                        <div className={`rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isMobile ? 'w-5 h-5 mr-3 mt-0.5' : 'w-4 h-4 mr-2 sm:mr-3 mt-0.5 sm:mt-0'
                        } ${
                          hasSubmitted && isCorrectOption
                            ? 'border-green-500 bg-green-500'
                            : hasSubmitted && isSelected && !isCorrectOption
                            ? 'border-red-500 bg-red-500'
                            : isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {hasSubmitted && isCorrectOption && (
                            <Check className={`text-white ${isMobile ? 'w-3 h-3' : 'w-2 h-2'}`} />
                          )}
                          {hasSubmitted && isSelected && !isCorrectOption && (
                            <X className={`text-white ${isMobile ? 'w-3 h-3' : 'w-2 h-2'}`} />
                          )}
                          {!hasSubmitted && isSelected && (
                            <div className={`rounded-full bg-white ${isMobile ? 'w-2.5 h-2.5' : 'w-2 h-2'}`}></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className={`font-medium text-gray-700 dark:text-gray-200 ${isMobile ? 'text-base' : 'text-sm sm:text-base'}`}>
                            {optionKey.charAt(optionKey.length - 1).toUpperCase()}.
                          </span>
                          <span className={`ml-2 text-gray-800 dark:text-gray-100 break-words ${isMobile ? 'text-base leading-relaxed' : 'text-sm sm:text-base'}`}>
                            {currentQuestion[optionKey]}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Result Message */}
            {showResult && (
              <div className={`mt-4 p-4 rounded-lg border ${isMobile ? 'mt-6' : ''} ${
                isCorrect 
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-700' 
                  : 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700'
              }`}>
                <div className="flex items-center mb-2">
                  {isCorrect ? (
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  ) : (
                    <X className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  )}
                  <h4 className={`font-semibold ${isMobile ? 'text-base' : ''} ${
                    isCorrect 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </h4>
                </div>
                <div className={`${isMobile ? 'text-sm' : 'text-sm'} ${
                  isCorrect 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-red-700 dark:text-red-300'
                } whitespace-pre-line`}>
                  <CodeHighlighter text={currentQuestion.explanation} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-3' : 'flex flex-col sm:flex-row justify-between gap-3 sm:gap-0'}`}>
          {isMobile ? (
            <div className="flex justify-between items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                size="sm"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                size="sm"
              >
                <Home className="w-4 h-4" />
              </Button>
              
              {!hasSubmitted ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!selectedAnswer}
                  size="sm"
                  className="flex-1"
                >
                  Submit
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleNext} 
                  size="sm"
                  className="flex-1"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                size="default"
                className="order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {!hasSubmitted ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!selectedAnswer}
                  size="default"
                  className="order-1 sm:order-2"
                >
                  Submit Answer
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleNext} 
                  size="default"
                  className="order-1 sm:order-2"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </>
          )}
        </div>
        
        {isMobile && <div className="h-20"></div>}
      </div>
    </div>
  );
};

export default QuizPage;
