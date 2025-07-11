import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
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
  isSubmitted?: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ questions, onSubmit, isSubmitted = false }) => {
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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Questionnaire de candidature
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Répondez à toutes les questions pour compléter votre candidature.
        </p>
        {isSubmitted && (
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Check className="h-4 w-4 mr-1" />
            Questionnaire soumis
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleQuestion(question.id)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-4">
                  {index + 1}
                </span>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Question {index + 1}
                </h3>
              </div>
              {expandedQuestions[question.id] ? (
                <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
            
            {expandedQuestions[question.id] && (
              <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 mb-4 mt-4">
                  {question.text}
                </p>
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-y bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Tapez votre réponse ici..."
                  rows={4}
                  disabled={isSubmitted}
                />
              </div>
            )}
          </div>
        ))}

        <div className="text-center">
          <Button 
            type="submit" 
            size="lg" 
            disabled={!allQuestionsAnswered || isSubmitted}
            className="min-w-[200px]"
          >
            {isSubmitted ? 'Questionnaire soumis' : 'Soumettre les réponses'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;