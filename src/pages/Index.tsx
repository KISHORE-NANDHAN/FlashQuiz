
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import HomePage from '@/components/HomePage';
import QuizPage from '@/components/QuizPage';
import FlashcardPage from '@/components/FlashcardPage';
import ResultsPage from '@/components/ResultsPage';

const Index = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz/:topicId" element={<QuizPage />} />
          <Route path="/flashcards/:topicId" element={<FlashcardPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
        <Toaster />
      </div>
    </ThemeProvider>
  );
};

export default Index;
