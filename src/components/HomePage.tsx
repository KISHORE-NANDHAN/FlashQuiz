
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { Moon, Sun, BookOpen, Brain, Code, Calculator, User, Menu } from 'lucide-react';
import UserRegistrationModal from '@/components/UserRegistrationModal';
import topicsData from '@/data/topics.json';
import { useIsMobile } from '@/hooks/use-mobile';

interface Topic {
  id: string;
  type: 'quiz' | 'flashcard';
  title: string;
  category: string;
  file: string;
  description: string;
}

const HomePage = () => {
  const [topics] = useState<Topic[]>(topicsData as Topic[]);
  const [filter, setFilter] = useState<'all' | 'quiz' | 'flashcard'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'general' | 'programming'>('all');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { userDetails, isUserRegistered, clearUserDetails } = useUser();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isUserRegistered) {
      setShowRegistrationModal(true);
    }
  }, [isUserRegistered]);

  const filteredTopics = topics.filter(topic => {
    const typeMatch = filter === 'all' || topic.type === filter;
    const categoryMatch = categoryFilter === 'all' || topic.category === categoryFilter;
    return typeMatch && categoryMatch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general':
        return <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'programming':
        return <Code className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'quiz' ? <Brain className="w-3 h-3 sm:w-4 sm:h-4" /> : <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />;
  };

  const handleTopicClick = (topic: Topic) => {
    if (!isUserRegistered) {
      setShowRegistrationModal(true);
      return;
    }
    
    if (topic.type === 'quiz') {
      navigate(`/quiz/${topic.id}`);
    } else {
      navigate(`/flashcards/${topic.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-1 sm:mb-2 truncate">
              Study Hub
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-1">
              Interactive quizzes and flashcards for learning
            </p>
            {isUserRegistered && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Welcome back, <span className="font-medium">{userDetails?.name}</span>!
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 ml-2">
            {isUserRegistered && (
              <Button
                variant="outline"
                size={isMobile ? "sm" : "sm"}
                onClick={clearUserDetails}
                title="Switch User"
                className="px-2 sm:px-3"
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Switch User</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
            >
              {theme === 'light' ? <Moon className="w-3 h-3 sm:w-5 sm:h-5" /> : <Sun className="w-3 h-3 sm:w-5 sm:h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        {isMobile && (
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full justify-between"
            >
              <span>Filters</span>
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Filters */}
        <div className={`${isMobile && !showFilters ? 'hidden' : 'block'} mb-6 sm:mb-8`}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Type Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className="rounded-full text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filter === 'quiz' ? 'default' : 'outline'}
                onClick={() => setFilter('quiz')}
                className="rounded-full text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
                size="sm"
              >
                <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Quizzes
              </Button>
              <Button
                variant={filter === 'flashcard' ? 'default' : 'outline'}
                onClick={() => setFilter('flashcard')}
                className="rounded-full text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
                size="sm"
              >
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Flashcards
              </Button>
            </div>
            
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={categoryFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setCategoryFilter('all')}
                size="sm"
                className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
              >
                All Categories
              </Button>
              <Button
                variant={categoryFilter === 'general' ? 'default' : 'outline'}
                onClick={() => setCategoryFilter('general')}
                size="sm"
                className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
              >
                General
              </Button>
              <Button
                variant={categoryFilter === 'programming' ? 'default' : 'outline'}
                onClick={() => setCategoryFilter('programming')}
                size="sm"
                className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2"
              >
                Programming
              </Button>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTopics.map((topic) => (
            <Card
              key={topic.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-blue-500 active:scale-95 sm:active:scale-100"
              onClick={() => handleTopicClick(topic)}
            >
              <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getCategoryIcon(topic.category)}
                    <CardTitle className="text-base sm:text-lg truncate">{topic.title}</CardTitle>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    <Badge variant={topic.type === 'quiz' ? 'default' : 'secondary'} className="text-xs">
                      {getTypeIcon(topic.type)}
                      <span className="ml-1 capitalize hidden sm:inline">{topic.type}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-2">
                  {topic.description}
                </p>
                <Badge variant="outline" className="capitalize text-xs">
                  {topic.category}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
              No topics found matching your filters.
            </p>
          </div>
        )}
      </div>

      <UserRegistrationModal 
        isOpen={showRegistrationModal} 
        onClose={() => setShowRegistrationModal(false)} 
      />
    </div>
  );
};

export default HomePage;
