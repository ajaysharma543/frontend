import { useEffect, useState } from 'react';

function LoadingScreen({ label = 'Connecting to server' }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 450);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-[#1a1025] overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-16 w-80 h-80 rounded-full bg-orange-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-15%] right-[-8%] w-96 h-96 rounded-full bg-pink-400/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 animate-pulse">
          <i className="fa-solid fa-comments text-white text-lg"></i>
        </div>

        <span className="w-9 h-9 border-[3px] border-orange-400/30 border-t-orange-400 rounded-full animate-spin"></span>

        <p className="text-white/70 text-sm tracking-wide">
          {label}
          <span className="inline-block w-4 text-left">{dots}</span>
        </p>
      </div>
    </div>
  );
}

export default LoadingScreen;