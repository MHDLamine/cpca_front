import React, { useState, useEffect } from 'react';
import { Check, Video, FileText } from 'lucide-react';
import VideoRecorder from '../components/video/VideoRecorder';
import QuestionForm from '../components/candidate/QuestionForm';
import { useAuth } from '../contexts/AuthContext';

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
    // Simulate upload: send video URL (in real app, upload to storage and get URL)
    await fetch('http://localhost:5000/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateId: user?.id,
        url: videoUrl,
        title: 'Introduction',
        duration: 120 // You can extract real duration if needed
      })
    });
    setVideoSubmitted(true);
  };

  const handleAnswersSubmit = async (answers: any[]) => {
    await fetch('http://localhost:5000/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateId: user?.id,
        answers
      })
    });
    setAnswersSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'video'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('video')}
            >
              <div className="flex items-center">
                <Video className="h-5 w-5 mr-2" />
                Video Presentation
                {videoSubmitted && <Check className="ml-2 h-4 w-4 text-green-500" />}
              </div>
            </button>
            <button
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('questions')}
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Questions
                {answersSubmitted && <Check className="ml-2 h-4 w-4 text-green-500" />}
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'video' ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Video Presentation</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Record a short video introducing yourself to potential employers.
                  Keep it under 2 minutes and focus on your key qualifications.
                </p>
              </div>
              
              {videoSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Video submitted successfully</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Your video has been saved and will be available to recruiters.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <VideoRecorder onVideoSaved={handleVideoSaved} />
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Assessment Questions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Please answer all questions thoroughly. Your responses will be reviewed by recruiters.
                </p>
              </div>
              
              {answersSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Answers submitted successfully</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Your answers have been saved and will be available to recruiters.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <QuestionForm 
                  questions={questions} 
                  onSubmit={handleAnswersSubmit} 
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;