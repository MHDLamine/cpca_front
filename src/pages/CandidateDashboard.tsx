import React, { useState, useEffect } from 'react';
import { Check, Video, FileText } from 'lucide-react';
import VideoRecorder from '../components/video/VideoRecorder';
import QuestionForm from '../components/candidate/QuestionForm';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'video' | 'questions'>('video');
  const [videoSubmitted, setVideoSubmitted] = useState(false);
  const [answersSubmitted, setAnswersSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/questions')
      .then(res => res.json())
      .then(setQuestions);
  }, []);

  const handleVideoSaved = async (_: Blob, videoUrl: string) => {
    try {
      // Simulate upload: send video URL (in real app, upload to storage and get URL)
      const res = await fetch('http://localhost:5000/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: user?.id,
          url: videoUrl,
          title: 'Introduction',
          duration: 120 // You can extract real duration if needed
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erreur lors de l\'envoi de la vidéo');
      }
      
      setVideoSubmitted(true);
      toast.success('Vidéo envoyée avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de la vidéo:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi de la vidéo');
    }
  };

  const handleAnswersSubmit = async (answers: any[]) => {
    try {
      const res = await fetch('http://localhost:5000/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: user?.id,
          answers
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erreur lors de l\'envoi des réponses');
      }
      
      setAnswersSubmitted(true);
      toast.success('Réponses envoyées avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi des réponses:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi des réponses');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Bienvenue, {user?.username} !
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Complétez les étapes suivantes pour finaliser votre candidature.
        </p>
      </div>

      {/* Status cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${videoSubmitted ? 'text-green-500' : 'text-gray-400'}`}>
              <Video className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Vidéo de présentation</h3>
              <p className={`text-sm ${videoSubmitted ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {videoSubmitted ? 'Terminé' : 'En attente'}
              </p>
            </div>
            {videoSubmitted && (
              <div className="ml-auto">
                <Check className="h-6 w-6 text-green-500" />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${answersSubmitted ? 'text-green-500' : 'text-gray-400'}`}>
              <FileText className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Questionnaire</h3>
              <p className={`text-sm ${answersSubmitted ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {answersSubmitted ? 'Terminé' : 'En attente'}
              </p>
            </div>
            {answersSubmitted && (
              <div className="ml-auto">
                <Check className="h-6 w-6 text-green-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'video'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('video')}
            >
              <div className="flex items-center">
                <Video className="h-5 w-5 mr-2" />
                Enregistrer une vidéo
              </div>
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('questions')}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Répondre aux questions
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'video' ? (
            <VideoRecorder onVideoSaved={handleVideoSaved} />
          ) : (
            <QuestionForm 
              questions={questions} 
              onSubmit={handleAnswersSubmit}
              isSubmitted={answersSubmitted}
            />
          )}
        </div>
      </div>

      {(videoSubmitted && answersSubmitted) && (
        <div className="mt-8 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center">
            <Check className="h-6 w-6 text-green-500 dark:text-green-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
                Candidature complète !
              </h3>
              <p className="text-green-600 dark:text-green-300">
                Votre candidature est maintenant complète. Nous examinerons votre profil et vous contacterons prochainement.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;