import React, { useState, useEffect } from 'react';
import { Check, Video, FileText, Upload, File } from 'lucide-react';
import VideoRecorder from '../components/video/VideoRecorder';
import QuestionForm from '../components/candidate/QuestionForm';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'video' | 'questions' | 'cv'>('video');
  const [videoSubmitted, setVideoSubmitted] = useState(false);
  const [answersSubmitted, setAnswersSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvData, setCvData] = useState<any>(null);
  // Charger le CV existant si présent
  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:5000/api/cv/${user.id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setCvData(data); });
    }
  }, [user]);
  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleCvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile || !user?.id) return;
    setCvUploading(true);
    const formData = new FormData();
    formData.append('cv', cvFile);
    formData.append('candidateId', user.id);
    try {
      const res = await fetch('http://localhost:5000/api/cv', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erreur lors de l\'upload du CV');
      }
      const data = await res.json();
      setCvData(data);
      setCvFile(null);
      toast.success('CV envoyé avec succès !');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'upload du CV');
    } finally {
      setCvUploading(false);
    }
  };

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
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'cv'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('cv')}
            >
              <div className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Soumettre mon CV
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'video' && (
            <VideoRecorder onVideoSaved={handleVideoSaved} />
          )}
          {activeTab === 'questions' && (
            <QuestionForm 
              questions={questions} 
              onSubmit={handleAnswersSubmit}
              isSubmitted={answersSubmitted}
            />
          )}
          {activeTab === 'cv' && (
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100 flex items-center">
                <File className="h-5 w-5 mr-2" /> Soumettre mon CV (PDF)
              </h3>
              {cvData ? (
                <div className="mb-4">
                  <span className="text-green-600 dark:text-green-400 font-medium">CV déjà soumis :</span>
                  <a
                    href={`http://localhost:5000${cvData.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 underline text-blue-600 dark:text-blue-400"
                  >
                    {cvData.filename}
                  </a>
                </div>
              ) : (
                <div className="mb-4 text-gray-500 dark:text-gray-400">Aucun CV soumis pour le moment.</div>
              )}
              <form onSubmit={handleCvUpload} className="flex flex-col gap-4 max-w-md">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleCvChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
                <button
                  type="submit"
                  disabled={cvUploading || !cvFile}
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {cvUploading ? 'Envoi en cours...' : 'Envoyer mon CV'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {(videoSubmitted && answersSubmitted && cvData) && (
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