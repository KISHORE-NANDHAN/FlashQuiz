import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Home, RotateCcw, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import topicsData from '@/data/topics.json';
import CodeHighlighter from '@/components/CodeHighlighter';
import { useIsMobile } from '@/hooks/use-mobile';

interface Flashcard {
  id: number;
  description: string;
  output: string;
}

const FlashcardPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  const topic = topicsData.find(t => t.id === topicId);
  const flashcardModules = import.meta.glob('@/data/*.json', { eager: true });

  useEffect(() => {
    const loadFlashcards = () => {
      try {
        if (!topic?.file) throw new Error('Invalid topic');

        const matchKey = Object.keys(flashcardModules).find(key =>
          key.endsWith(`/${topic.file}`)
        );

        if (!matchKey) throw new Error('Flashcards not found');

        const module = flashcardModules[matchKey] as { default: Flashcard[] };
        setFlashcards(module.default);
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (!topic || flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-6 sm:py-8">
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">Flashcards not found</p>
            <Button onClick={() => navigate('/')} size={isMobile ? "sm" : "default"}>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 dark:from-gray-900 dark:to-gray-800">
      <div className={`container mx-auto ${isMobile ? 'p-2' : 'p-3 sm:p-4 max-w-4xl'}`}>
        {/* Header */}
        <div className={`flex flex-col ${isMobile ? 'mb-3' : 'sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6'} gap-3`}>
          <div className="min-w-0 flex-1">
            <h1 className={`font-bold text-gray-800 dark:text-white truncate ${isMobile ? 'text-lg' : 'text-xl sm:text-2xl'}`}>
              {topic.title}
            </h1>
            <div className={`flex flex-wrap items-center mt-2 ${isMobile ? 'gap-1' : 'gap-2 sm:gap-4'}`}>
              <Badge variant="outline" className="text-xs">
                Card {currentIndex + 1} of {flashcards.length}
              </Badge>
              <Badge variant={isFlipped ? "default" : "secondary"} className="text-xs">
                {isFlipped ? "Answer" : "Question"}
              </Badge>
            </div>
          </div>
          <div className={`flex gap-1 sm:gap-2 flex-wrap ${isMobile ? 'justify-center' : ''}`}>
            <Button variant="outline" onClick={handleShuffle} size={isMobile ? "sm" : "default"}>
              <Shuffle className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Shuffle</span>
            </Button>
            <Button variant="outline" onClick={handleReset} size={isMobile ? "sm" : "default"}>
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Reset</span>
            </Button>
            {!isMobile && (
              <Button variant="outline" onClick={() => navigate('/')} size="default">
                <Home className="w-4 h-4 mr-1 sm:mr-2" />
                Home
              </Button>
            )}
          </div>
        </div>

        {/* Flashcard */}
        <div className={`flex justify-center ${isMobile ? 'mb-3' : 'mb-4 sm:mb-6'}`}>
          <div 
            className={`relative w-full cursor-pointer perspective-1000 ${
              isMobile ? 'h-[calc(100vh-160px)] max-h-[600px]' : 'max-w-2xl h-80 sm:h-96'
            }`}
            onClick={() => setIsFlipped(prev => !prev)}
          >
            <div className={`absolute inset-0 w-full h-full transition-transform duration-600 transform-style-preserve-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}>
              {/* Front of card */}
              <Card className="absolute inset-0 w-full h-full backface-hidden border-l-4 border-l-green-500 hover:shadow-xl transition-shadow duration-300">
                <CardContent className={`h-full flex flex-col justify-center ${isMobile ? 'p-4' : 'p-4 sm:p-8'}`}>
                  <div className="text-center">
                    <div className={`font-semibold text-gray-700 dark:text-gray-200 mb-4 leading-relaxed ${
                      isMobile ? 'text-base' : 'text-sm sm:text-lg'
                    }`}>
                      <CodeHighlighter text={currentCard.description} />
                    </div>
                    <p className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'mt-6 text-sm' : 'text-xs sm:text-sm mt-6 sm:mt-8'}`}>
                      Tap to reveal answer {!isMobile && 'or press Spacebar'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Back of card */}
              <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 border-l-4 border-l-blue-500 hover:shadow-xl transition-shadow duration-300">
                <CardContent className={`h-full flex flex-col justify-center ${isMobile ? 'p-4' : 'p-4 sm:p-8'}`}>
                  <div className="text-center">
                    <h3 className={`font-semibold text-gray-700 dark:text-gray-200 mb-4 ${
                      isMobile ? 'text-base' : 'text-sm sm:text-lg'
                    }`}>
                      Output:
                    </h3>
                    <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg overflow-y-auto ${
                      isMobile ? 'p-3 max-h-[400px]' : 'p-3 sm:p-4 max-h-60 sm:max-h-none'
                    }`}>
                      <div className={isMobile ? 'text-sm' : ''}>
                        <CodeHighlighter text={`\`\`\`java\n${currentCard.output}\n\`\`\``} />
                      </div>
                    </div>
                    <p className={`text-gray-500 dark:text-gray-400 ${isMobile ? 'mt-3 text-sm' : 'text-xs sm:text-sm mt-3 sm:mt-4'}`}>
                      Tap to go back to question
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className={`${isMobile ? 'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-3' : 'flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0'}`}>
          {isMobile ? (
            <div className="flex justify-between items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
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

              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentIndex === flashcards.length - 1}
                size="sm"
                className="flex-1"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                size="default"
                className="order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="text-center order-1 sm:order-2">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Use arrow keys to navigate • Spacebar to flip
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentIndex === flashcards.length - 1}
                size="default"
                className="order-3"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </div>
        
        {isMobile && <div className="h-20"></div>}
      </div>
    </div>
  );
};

export default FlashcardPage;
