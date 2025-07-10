
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, BookOpen, Brain, Code, Calculator } from 'lucide-react';
import topicsData from '@/data/topics.json';

interface Topic {
  id: string;
  type: 'quiz' | 'flashcard';
  title: string;
  category: string;
  file: string;
  description: string;
}

const HomePage = () => {
  const [topics] = useState<Topic[]>(topicsData);
  const [filter, setFilter] = useState<'all' | 'quiz' | 'flashcard'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'general' | 'programming'>('all');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const filteredTopics = topics.filter(topic => {
    const typeMatch = filter === 'all' || topic.type === filter;
    const categoryMatch = categoryFilter === 'all' || topic.category === categoryFilter;
    return typeMatch && categoryMatch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general':
        return <Calculator className="w-5 h-5" />;
      case 'programming':
        return <Code className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'quiz' ? <Brain className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />;
  };

  const handleTopicClick = (topic: Topic) => {
    if (topic.type === 'quiz') {
      navigate(`/quiz/${topic.id}`);
    } else {
      navigate(`/flashcards/${topic.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Study Hub
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Interactive quizzes and flashcards for learning
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={filter === 'quiz' ? 'default' : 'outline'}
              onClick={() => setFilter('quiz')}
              className="rounded-full"
            >
              <Brain className="w-4 h-4 mr-2" />
              Quizzes
            </Button>
            <Button
              variant={filter === 'flashcard' ? 'default' : 'outline'}
              onClick={() => setFilter('flashcard')}
              className="rounded-full"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Flashcards
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={categoryFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setCategoryFilter('all')}
              size="sm"
            >
              All Categories
            </Button>
            <Button
              variant={categoryFilter === 'general' ? 'default' : 'outline'}
              onClick={() => setCategoryFilter('general')}
              size="sm"
            >
              General
            </Button>
            <Button
              variant={categoryFilter === 'programming' ? 'default' : 'outline'}
              onClick={() => setCategoryFilter('programming')}
              size="sm"
            >
              Programming
            </Button>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <Card
              key={topic.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-blue-500"
              onClick={() => handleTopicClick(topic)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(topic.category)}
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={topic.type === 'quiz' ? 'default' : 'secondary'}>
                      {getTypeIcon(topic.type)}
                      <span className="ml-1 capitalize">{topic.type}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {topic.description}
                </p>
                <Badge variant="outline" className="capitalize">
                  {topic.category}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No topics found matching your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
