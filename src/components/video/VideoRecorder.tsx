import React, { useState, useRef, useEffect } from 'react';
import { Video, Square, Play, Save } from 'lucide-react';
import Button from '../ui/Button';

interface VideoRecorderProps {
  onVideoSaved: (videoBlob: Blob, videoUrl: string) => void;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({ onVideoSaved }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Request camera permission
  const getCameraPermission = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setPermission(true);
      setStream(videoStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access your camera. Please check permissions and try again.');
    }
  };

  // useEffect(() => {
  //   getCameraPermission();
  //   return () => {
  //     if (stream) {
  //       stream.getTracks().forEach(track => track.stop());
  //     }
  //     if (timerRef.current) {
  //       clearInterval(timerRef.current);
  //     }
  //   };
  // }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stream]);

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(url);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.controls = true;
      }
    };
    mediaRecorder.onpause = () => setIsPaused(true);
    mediaRecorder.onresume = () => setIsPaused(false);
    mediaRecorder.start();
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Ne pas stopper les tracks ici !
      // On garde la caméra active pour la prévisualisation
    }
  };

  const saveVideo = () => {
    if (videoBlob && videoUrl) {
      onVideoSaved(videoBlob, videoUrl);
      // Stopper la caméra après sauvegarde
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setPermission(false);
      }
    }
  };

  const resetRecording = () => {
    setVideoBlob(null);
    setVideoUrl(null);
    // Relancer la caméra si besoin
    if (!stream) {
      getCameraPermission();
    } else if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.controls = false;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-2xl bg-gray-900 rounded-lg overflow-hidden shadow-lg aspect-video">
        {!permission ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <Video className="w-16 h-16 mb-4 text-blue-500" />
            <p className="text-lg font-medium mb-4">L'accès à la caméra est requis</p>
            <Button onClick={getCameraPermission}>Autoriser l'accès à la caméra</Button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted={isRecording}
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        
        {isRecording && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center">
            <span className="animate-pulse mr-2 h-3 w-3 bg-white rounded-full inline-block"></span>
            <span>{formatTime(recordingTime)}</span>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex items-center justify-center space-x-4">
        {!videoBlob ? (
          <>
            {!isRecording ? (
              <Button 
                onClick={startRecording}
                disabled={!permission}
                className="flex items-center"
              >
                <Play className="mr-2 h-4 w-4" />
                Démarrer l'enregistrement
              </Button>
            ) : (
              <>
                <Button 
                  onClick={stopRecording}
                  variant="danger"
                  className="flex items-center"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Arrêter l'enregistrement
                </Button>
                {isPaused ? (
                  <Button onClick={resumeRecording} className="flex items-center" variant="secondary">
                    <Play className="mr-2 h-4 w-4" />
                    Reprendre
                  </Button>
                ) : (
                  <Button onClick={pauseRecording} className="flex items-center" variant="secondary">
                    ||
                    <span className="ml-2">Pause</span>
                  </Button>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <Button 
              onClick={resetRecording}
              variant="secondary"
              className="flex items-center"
            >
              <Play className="mr-2 h-4 w-4" />
              Réenregistrer
            </Button>
            
            <Button 
              onClick={saveVideo}
              className="flex items-center"
            >
              <Save className="mr-2 h-4 w-4" />
              Enregistrer la vidéo
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;