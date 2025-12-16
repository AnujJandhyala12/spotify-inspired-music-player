import React, { useEffect, useRef } from 'react';

export default function Visualizer({ audioRef, isPlaying }) {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrRef = useRef(null);
  const rafRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    // create AudioContext lazily
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    const audioCtx = audioCtxRef.current;

    // create / reuse analyser
    if (!analyserRef.current) {
      analyserRef.current = audioCtx.createAnalyser();
      analyserRef.current.fftSize = 256;
    }
    const analyser = analyserRef.current;

    // connect media element source (avoid reconnecting repeatedly)
    if (!sourceRef.current) {
      try {
        sourceRef.current = audioCtx.createMediaElementSource(audioEl);
        sourceRef.current.connect(analyser);
        analyser.connect(audioCtx.destination);
      } catch (e) {
        // If audio element is already connected to a different context, ignore
      }
    }

    const bufferLength = analyser.frequencyBinCount;
    dataArrRef.current = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArrRef.current);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArrRef.current[i] / 255;
        const barHeight = v * canvas.height;
        const hue = 140; // green-ish
        ctx.fillStyle = `rgba(29,185,84,${0.9})`;
        const y = canvas.height - barHeight;
        ctx.fillRect(x, y, barWidth, barHeight);
        x += barWidth + 1;
      }
    }

    // start drawing when playing
    if (isPlaying) {
      // resume context if suspended (user gesture required)
      if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
      cancelAnimationFrame(rafRef.current);
      draw();
    } else {
      cancelAnimationFrame(rafRef.current);
      // optionally clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function handleResize() {
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
    }
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      // Do not fully close audioCtx here to avoid breaking other audio nodes
    };
  }, [audioRef, isPlaying]);

  return (
    <div className="visualizer-wrap">
      <canvas ref={canvasRef} className="visualizer-canvas" />
    </div>
  );
}
