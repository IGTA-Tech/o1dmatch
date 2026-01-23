import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-xl">O1</span>
        </div>
        
        {/* Spinner */}
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        
        {/* Text */}
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}