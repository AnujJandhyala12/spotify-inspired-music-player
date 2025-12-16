import React, { useState, useRef, useEffect } from 'react';
import AudioControls from './AudioControls';
import Playlist from './Playlist';
import Visualizer from './Visualizer';


import ALBUM1_ART from '../assets/instantCrush.jpg';
import ALBUM2_ART from '../assets/leatherWeather.jpg';
import ALBUM3_ART from '../assets/Dookudu.jpg';



const initialPlaylist = [
  {
    id: 1,
    title: 'Instant Crush',
    artist: 'Daft Punk',
    src: '/songs/Instant-Crush.mp3', 
    art: ALBUM1_ART
  },
  {
    id: 2,
    title: 'Leather Weather',
    artist: 'The Neighborhood',
    src: '/songs/Leather-Weather.mp3',
    art: ALBUM2_ART
  },
  {
    id: 3,
    title: 'Nee Dookudu',
    artist: 'S Thaman',
    src: '/songs/Nee-Dookudu.mp3',
    art: ALBUM3_ART
  }
];

export default function MusicPlayer() {
  const [playlist, setPlaylist] = useState(initialPlaylist);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVisualizer, setShowVisualizer] = useState(true);

  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Sync audio element attributes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(isFinite(audio.duration) ? audio.duration : 0);
    const onEnded = () => handleNext();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentIndex]);

  // Play / Pause effect
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    if (isPlaying) {
      // Some browsers require AudioContext resume on user gesture; handled in Visualizer
      audio.play().catch(() => {
        // play() may fail if not user-initiated; ignore silently
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentIndex, volume]);

  const handlePlayPause = () => {
    // toggle playing
    setIsPlaying(prev => !prev);
  };

  const handlePrev = () => {
    setCurrentTime(0);
    setCurrentIndex((idx) => (idx - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const handleNext = () => {
    setCurrentTime(0);
    setCurrentIndex((idx) => (idx + 1) % playlist.length);
    setIsPlaying(true);
  };

  const handleSeek = (time) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolume = (v) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const selectTrack = (index) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const currentTrack = playlist[currentIndex] || {};

  return (
    <div className="player-card">
      <div className="player-top">
        <div className="album-art">
          <img src={currentTrack.art || ALBUM1_ART} alt="album art" />
        </div>

        <div className="track-info">
          <h2 className="track-title">{currentTrack.title || 'No track selected'}</h2>
          <p className="track-artist">{currentTrack.artist || 'Unknown Artist'}</p>

          <div className="progress-wrapper">
            <div className="time-left">{formatTime(currentTime)}</div>
            <div className="progress-bar">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step="0.1"
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                ref={progressRef}
              />
            </div>
            <div className="time-right">{formatTime(duration)}</div>
          </div>

          <AudioControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onPrev={handlePrev}
            onNext={handleNext}
          />

        </div>
      </div>

      <Playlist
        playlist={playlist}
        currentIndex={currentIndex}
        onSelect={selectTrack}
      />

      <div className="volume-visualizer-row">
        <div className="volume-control">
          <label className="visually-hidden">Volume</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => handleVolume(Number(e.target.value))}
          />
        </div>

        <div className="visualizer-toggle">
          <label>
            <input
              type="checkbox"
              checked={showVisualizer}
              onChange={(e) => setShowVisualizer(e.target.checked)}
            />
            Visualizer
          </label>
        </div>
      </div>

      { showVisualizer && <Visualizer audioRef={audioRef} isPlaying={isPlaying} /> }

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        preload="metadata"
      />
    </div>
  );
}

function formatTime(t) {
  if (!t || isNaN(t)) return '0:00';
  const minutes = Math.floor(t / 60);
  const seconds = Math.floor(t % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}
