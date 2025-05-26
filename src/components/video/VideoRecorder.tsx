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

  useEffect(() => {
    getCameraPermission();
    
    return () => {
      // Clean up resources when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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
    
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    
    // Start timer
    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const saveVideo = () => {
    if (videoBlob && videoUrl) {
      onVideoSaved(videoBlob, videoUrl);
    }
  };

  const resetRecording = () => {
    setVideoBlob(null);
    setVideoUrl(null);
    
    if (videoRef.current && stream) {
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
            <p className="text-lg font-medium mb-4">Camera access is required</p>
            <Button onClick={getCameraPermission}>Allow Camera Access</Button>
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
                Start Recording
              </Button>
            ) : (
              <Button 
                onClick={stopRecording}
                variant="danger"
                className="flex items-center"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop Recording
              </Button>
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
              Record Again
            </Button>
            
            <Button 
              onClick={saveVideo}
              className="flex items-center"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Video
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;