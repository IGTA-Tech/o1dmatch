import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm" style={{ background: '#D4A84B', color: '#0B1D35' }}>
          O1
        </div>
        
        {/* Spinner */}
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#D4A84B' }} />
        
        {/* Text */}
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}