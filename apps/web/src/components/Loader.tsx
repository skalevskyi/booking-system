export function Loader({ size = 12 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative" style={{ width: `${size * 4}px`, height: `${size * 4}px` }}>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <div className="relative inline-block" style={{ width: `${size}px`, height: `${size}px` }}>
      <div className="absolute top-0 left-0 w-full h-full border-2 border-white/30 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

