import React from 'react';

export default function Playlist({ playlist, currentIndex, onSelect }) {
  return (
    <div className="playlist-card">
      <div className="playlist-header">Playlist</div>
      <ul className="playlist-list">
        {playlist.map((item, idx) => (
          <li
            key={item.id}
            className={`playlist-item ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => onSelect(idx)}
          >
            <div className="dot">{idx === currentIndex ? '●' : '○'}</div>
            <div className="meta">
              <div className="title">{item.title}</div>
              <div className="artist">{item.artist}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
