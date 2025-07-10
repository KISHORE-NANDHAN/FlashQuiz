
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Home, RotateCcw, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import topicsData from '@/data/topics.json';
import CodeHighlighter from '@/components/CodeHighlighter';

interface Flashcard {
  id: number;
  description: string;
  output: string;
}

const FlashcardPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  const topic = topicsData.find(t => t.id === topicId);

  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        const response = await import(`@/data/${topic?.file}`);
        setFlashcards(response.default);
        setLoading(false);
      } catch (error) {
        console.error('Error loading flashcards:', error);
        toast({
          title: "Error",
          description: "Failed to load flashcards",
          variant: "destructive"
        });
        navigate('/');
      }
    };

    if (topic) {
      loadFlashcards();
    }
  }, [topicId, topic, navigate, toast]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    toast({
      title: "Cards shuffled!",
      description: "Flashcards have been randomized"
    });
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      handlePrevious();
    } else if (event.key === 'ArrowRight') {
      handleNext();
    } else if (event.key === ' ') {
      event.preventDefault();
      setIsFlipped(prev => !prev);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, flashcards.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (!topic || flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-300 mb-4">Flashcards not found</p>
            <Button onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {topic.title}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline">
                Card {currentIndex + 1} of {flashcards.length}
              </Badge>
              <Badge variant={isFlipped ? "default" : "secondary"}>
                {isFlipped ? "Answer" : "Question"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShuffle}>
              <Shuffle className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex justify-center mb-6">
          <div 
            className="relative w-full max-w-2xl h-96 cursor-pointer perspective-1000"
            onClick={() => setIsFlipped(prev => !prev)}
          >
            <div className={`absolute inset-0 w-full h-full transition-transform duration-600 transform-style-preserve-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}>
              {/* Front of card */}
              <Card className="absolute inset-0 w-full h-full backface-hidden border-l-4 border-l-green-500 hover:shadow-xl transition-shadow duration-300">
                <CardContent className="h-full flex flex-col justify-center p-8">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                      {currentCard.description}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
                      Click to reveal answer or press Spacebar
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Back of card */}
              <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 border-l-4 border-l-blue-500 hover:shadow-xl transition-shadow duration-300">
                <CardContent className="h-full flex flex-col justify-center p-8">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                      Output:
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <CodeHighlighter text={currentCard.output} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                      Click to go back to question
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use arrow keys to navigate • Spacebar to flip
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardPage;
