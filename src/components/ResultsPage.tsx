import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Home, Download, Trophy, Clock, Target, User, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CodeHighlighter from '@/components/CodeHighlighter';
import jsPDF from 'jspdf';

interface QuizResult {
  questionId: number;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

interface SavedResults {
  topicTitle: string;
  results: QuizResult[];
  timeElapsed: number;
  totalQuestions: number;
}

interface UserDetails {
  name: string;
  email: string;
}

const ResultsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [savedResults, setSavedResults] = useState<SavedResults | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails>({ name: '', email: '' });
  const [showUserForm, setShowUserForm] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const results = localStorage.getItem('quizResults');
    if (results) {
      setSavedResults(JSON.parse(results));
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptionLabel = (optionKey: string) => {
    const labels = { option1: 'A', option2: 'B', option3: 'C', option4: 'D' };
    return labels[optionKey as keyof typeof labels] || '';
  };

  const getPerformanceMessage = (percentage: number, userName: string) => {
    if (percentage >= 90) {
      return `🎉 Outstanding work, ${userName}! You're absolutely brilliant! Your mastery of this topic is truly impressive!`;
    } else if (percentage >= 80) {
      return `⭐ Excellent job, ${userName}! You've shown great understanding and skill. Keep up the fantastic work!`;
    } else if (percentage >= 70) {
      return `👍 Well done, ${userName}! You're on the right track. With a bit more practice, you'll be amazing!`;
    } else if (percentage >= 60) {
      return `💪 Good effort, ${userName}! You're making progress. Keep studying and you'll improve even more!`;
    } else {
      return `🌟 Don't worry, ${userName}! Every expert was once a beginner. Keep practicing and you'll get there!`;
    }
  };

  const generatePDF = () => {
    if (!savedResults || !userDetails.name) {
      toast({
        title: "Missing Information",
        description: "Please enter your name before generating the report",
        variant: "destructive"
      });
      return;
    }

    const doc = new jsPDF();
    const correctAnswers = savedResults.results.filter(r => r.isCorrect).length;
    const percentage = Math.round((correctAnswers / savedResults.results.length) * 100);
    
    // Header
    doc.setFontSize(20);
    doc.text('Quiz Results Report', 20, 30);
    
    // User details
    doc.setFontSize(12);
    doc.text(`Name: ${userDetails.name}`, 20, 50);
    doc.text(`Email: ${userDetails.email}`, 20, 60);
    doc.text(`Topic: ${savedResults.topicTitle}`, 20, 70);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80);
    
    // Performance summary
    doc.setFontSize(14);
    doc.text('Performance Summary', 20, 100);
    doc.setFontSize(12);
    doc.text(`Score: ${correctAnswers}/${savedResults.results.length} (${percentage}%)`, 20, 115);
    doc.text(`Time Taken: ${formatTime(savedResults.timeElapsed)}`, 20, 125);
    
    // Performance message
    doc.setFontSize(10);
    const message = getPerformanceMessage(percentage, userDetails.name);
    const splitMessage = doc.splitTextToSize(message, 170);
    doc.text(splitMessage, 20, 140);
    
    // Incorrect answers (if any)
    const incorrectAnswers = savedResults.results.filter(r => !r.isCorrect);
    if (incorrectAnswers.length > 0) {
      let yPosition = 160;
      doc.setFontSize(14);
      doc.text('Incorrect Answers Review', 20, yPosition);
      yPosition += 15;
      
      incorrectAnswers.forEach((result, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.setFontSize(10);
        doc.text(`Question ${index + 1}:`, 20, yPosition);
        yPosition += 10;
        
        const questionText = doc.splitTextToSize(result.question, 170);
        doc.text(questionText, 20, yPosition);
        yPosition += questionText.length * 5 + 5;
        
        doc.text(`Your Answer: ${getOptionLabel(result.selectedAnswer)}`, 20, yPosition);
        yPosition += 8;
        doc.text(`Correct Answer: ${getOptionLabel(result.correctAnswer)}`, 20, yPosition);
        yPosition += 8;
        
        const explanationText = doc.splitTextToSize(`Explanation: ${result.explanation}`, 170);
        doc.text(explanationText, 20, yPosition);
        yPosition += explanationText.length * 5 + 15;
      });
    }
    
    doc.save(`${userDetails.name}_quiz_results_${Date.now()}.pdf`);
    
    setShowAlert(true);
    toast({
      title: "Success!",
      description: "Your quiz report has been downloaded as PDF",
    });
  };

  const handleUserFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userDetails.name.trim()) {
      setShowUserForm(false);
    } else {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue",
        variant: "destructive"
      });
    }
  };

  if (!savedResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading results...</p>
        </div>
      </div>
    );
  }

  const correctAnswers = savedResults.results.filter(r => r.isCorrect).length;
  const totalQuestions = savedResults.results.length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const incorrectAnswers = savedResults.results.filter(r => !r.isCorrect);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* User Details Form */}
        {showUserForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Tell us about yourself
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUserFormSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={userDetails.name}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userDetails.email}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
                <Button type="submit" className="w-full">
                  View My Results
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {!showUserForm && (
          <>
            {/* Success Alert */}
            {showAlert && (
              <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
                <Download className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Your quiz report has been successfully downloaded!
                </AlertDescription>
              </Alert>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                  Quiz Results
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {savedResults.topicTitle}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Welcome, {userDetails.name}!
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={generatePDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={() => navigate('/')}>
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </div>
            </div>

            {/* Performance Message */}
            <Card className="mb-6 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Personal Message
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {getPerformanceMessage(percentage, userDetails.name)}
                </p>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="flex items-center justify-center p-6">
                  <div className="text-center">
                    <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {percentage}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Score</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-center p-6">
                  <div className="text-center">
                    <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {correctAnswers}/{totalQuestions}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Correct</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-center p-6">
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {formatTime(savedResults.timeElapsed)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Time</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm">{incorrectAnswers.length}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {incorrectAnswers.length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Incorrect</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Badge */}
            <div className="text-center mb-8">
              <Badge 
                variant={percentage >= 80 ? "default" : percentage >= 60 ? "secondary" : "destructive"}
                className="text-lg px-4 py-2"
              >
                {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good Job!" : "Keep Practicing!"}
              </Badge>
            </div>

            {/* Incorrect Answers Review */}
            {incorrectAnswers.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  Review Incorrect Answers
                </h2>
                <div className="space-y-6">
                  {incorrectAnswers.map((result, index) => (
                    <Card key={result.questionId} className="border-l-4 border-l-red-500">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Question {index + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <CodeHighlighter text={result.question} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                            <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                              Your Answer:
                            </p>
                            <p className="text-red-800 dark:text-red-200">
                              {getOptionLabel(result.selectedAnswer)}. {/* Add option text here if needed */}
                            </p>
                          </div>
                          
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                              Correct Answer:
                            </p>
                            <p className="text-green-800 dark:text-green-200">
                              {getOptionLabel(result.correctAnswer)}. {/* Add option text here if needed */}
                            </p>
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                            Explanation:
                          </p>
                          <p className="text-blue-800 dark:text-blue-200">
                            {result.explanation}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="text-center space-x-4">
              <Button onClick={() => navigate('/')} size="lg">
                Take Another Quiz
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} size="lg">
                Retake This Quiz
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
