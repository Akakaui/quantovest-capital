'use client';

import { useEffect, useRef } from 'react';

interface NotificationSoundProps {
  play?: boolean;
}

export default function NotificationSound({ play = false }: NotificationSoundProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (play && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { /* ignore autoplay blocks */ });
    }
  }, [play]);

  return (
    <audio ref={audioRef} preload="auto">
      <source src="/sounds/notification.mp3" type="audio/mpeg" />
    </audio>
  );
}
