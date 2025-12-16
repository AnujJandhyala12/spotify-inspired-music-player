import React from 'react';
import { FaPlay, FaPause, FaForward, FaBackward } from 'react-icons/fa';

export default function AudioControls({ isPlaying, onPlayPause, onPrev, onNext }) {
  return (
    <div className="controls">
      <button className="ctrl-btn" onClick={onPrev} aria-label="Previous">
        <FaBackward />
      </button>

      <button
        className="ctrl-btn play-btn"
        onClick={onPlayPause}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>

      <button className="ctrl-btn" onClick={onNext} aria-label="Next">
        <FaForward />
      </button>
    </div>
  );
}
