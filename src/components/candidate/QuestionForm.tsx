import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface Question {
  id: string;
  text: string;
}

interface Answer {
  questionId: string;
  text: string;
}

interface QuestionFormProps {
  questions: Question[];
  onSubmit: (answers: Answer[]) => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ questions, onSubmit }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedAnswers = Object.entries(answers).map(([questionId, text]) => ({
      questionId,
      text
    }));
    
    onSubmit(formattedAnswers);
  };

  const isQuestionAnswered = (questionId: string) => {
    return !!answers[questionId]?.trim();
  };

  const allQuestionsAnswered = questions.every(q => isQuestionAnswered(q.id));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {questions.map((question) => (
          <div 
            key={question.id} 
            className="border border-gray-200 rounded-md overflow-hidden bg-white"
          >
            <div 
              className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
              onClick={() => toggleQuestion(question.id)}
            >
              <div className="flex items-center">
                {isQuestionAnswered(question.id) && (
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                )}
                <span className="font-medium">{question.text}</span>
              </div>
              <div>
                {expandedQuestions[question.id] ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
            
            {expandedQuestions[question.id] && (
              <div className="px-4 py-3">
                <Input
                  as="textarea"
                  rows={4}
                  placeholder="Type your answer here..."
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <Button 
        type="submit" 
        fullWidth
        disabled={!allQuestionsAnswered}
      >
        Submit Answers
      </Button>
    </form>
  );
};

export default QuestionForm;