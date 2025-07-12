import React from 'react';
import { Download } from 'lucide-react';
import Button from '../ui/Button';

interface VideoPlayerProps {
  src: string;
  title?: string;
  downloadable?: boolean;
  onDownload?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  downloadable = false,
  onDownload,
}) => {
  return (
    <div className="overflow-hidden rounded-lg shadow-lg bg-gray-800">
      {title && (
        <div className="px-4 py-2 bg-gray-700 text-white font-medium">
          {title}
        </div>
      )}
      
      <div className="aspect-video">
        <video
          className="w-full h-full object-cover"
          src={src}
          controls
          preload="metadata"
        />
      </div>
      
      {downloadable && (
        <div className="px-4 py-3 bg-gray-700 flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-gray-600"
            onClick={onDownload}
          >
            <Download className="h-4 w-4 mr-1" />
            Télécharger
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;