
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Download, Trophy, Clock, Target } from 'lucide-react';
import CodeHighlighter from '@/components/CodeHighlighter';

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

const ResultsPage = () => {
  const navigate = useNavigate();
  const [savedResults, setSavedResults] = useState<SavedResults | null>(null);

  useEffect(() => {
    const results = localStorage.getItem('quizResults');
    if (results) {
      setSavedResults(JSON.parse(results));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptionLabel = (optionKey: string) => {
    const labels = { option1: 'A', option2: 'B', option3: 'C', option4: 'D' };
    return labels[optionKey as keyof typeof labels] || '';
  };

  const downloadResults = () => {
    if (!savedResults) return;

    const dataStr = JSON.stringify(savedResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quiz-results-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Quiz Results
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {savedResults.topicTitle}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadResults}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default ResultsPage;
