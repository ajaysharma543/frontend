// LoadingScreen.jsx

export default function LoadingScreen() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-neutral-950 text-white relative overflow-hidden">
      {/* Ambient glow background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center">
        {/* Logo mark / spinner combo */}
        <div className="relative w-16 h-16 mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-neutral-800" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-red-600 border-r-red-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-lg font-medium tracking-wide text-neutral-100">
          Waking up the server
        </h2>
        <p className="text-sm text-neutral-500 mt-2 max-w-xs text-center leading-relaxed">
          This can take 30–60 seconds on first load. Thanks for your patience.
        </p>

        {/* Progress shimmer bar */}
        <div className="mt-8 w-56 h-[3px] bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-shimmer" />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(350%); }
        }
        .animate-shimmer {
          animation: shimmer 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}