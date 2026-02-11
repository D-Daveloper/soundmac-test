"use client";

import { useEffect, useRef, useState } from "react";

async function fetchSignedUrl(songId: string) {
  const res = await fetch(`/api/tracks/${songId}/stream`);
  const data = await res.json();
  return data.url;
}

export default function AudioPlayer({ songId }: { songId: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    loadNewUrl();
  }, [songId]);

  async function loadNewUrl(autoPlay = false) {
    try {
      setLoading(true);
      const url = await fetchSignedUrl(songId);
      setAudioUrl(url);

      // Wait for src to update
      setTimeout(() => {
        if (autoPlay && audioRef.current) {
          audioRef.current.play();
        }
      }, 50);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {loading && <p>Loading audio...</p>}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          controls
          onError={() => {
            console.log("Audio URL expired. Refreshing...");
            loadNewUrl(true);
          }}
        />
      )}
    </div>
  );
}
