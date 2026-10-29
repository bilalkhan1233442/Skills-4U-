import React, { useMemo } from 'react';
import { Play, AlertTriangle } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  posterUrl?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, title, posterUrl }) => {
  const parsedVideo = useMemo(() => {
    if (!videoUrl || !videoUrl.trim()) {
      return { type: 'empty', src: '' };
    }

    const clean = videoUrl.trim();

    // 1. YouTube Matchers
    const youtubeRegExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
    const ytMatch = clean.match(youtubeRegExp);
    if (ytMatch && ytMatch[1]) {
      return {
        type: 'youtube',
        src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`
      };
    }

    // 2. Google Drive Matchers
    // Format: drive.google.com/file/d/ID/view or open?id=ID
    const driveMatch = clean.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i) ||
                       clean.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i);
    if (driveMatch && driveMatch[1]) {
      return {
        type: 'drive',
        src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`
      };
    }

    // 3. Direct Video Files (.mp4, .webm, .ogg)
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(clean) || clean.startsWith('blob:') || clean.startsWith('data:video')) {
      return {
        type: 'direct',
        src: clean
      };
    }

    // Default iframe attempt
    return {
      type: 'iframe',
      src: clean
    };
  }, [videoUrl]);

  if (parsedVideo.type === 'empty') {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
        {posterUrl && (
          <img
            src={posterUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
          />
        )}
        <div className="relative z-10 max-w-sm flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
            <Play className="w-6 h-6 ml-0.5" />
          </div>
          <h4 className="font-semibold text-white text-base">Free Demo Class Video</h4>
          <p className="text-xs text-slate-400 mt-1">
            Demo video preview will be updated shortly by the instructor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-emerald-500/30 shadow-2xl shadow-emerald-950/40">
      {parsedVideo.type === 'direct' ? (
        <video
          src={parsedVideo.src}
          controls
          controlsList="nodownload"
          playsInline
          poster={posterUrl}
          className="w-full h-full object-contain bg-black"
        >
          Your browser does not support HTML5 video streaming.
        </video>
      ) : (
        <iframe
          src={parsedVideo.src}
          title={`Demo Class: ${title}`}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
};
