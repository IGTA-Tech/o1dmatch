'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { CheckCircle, XCircle, Loader2, PenTool, RotateCcw } from 'lucide-react';

interface LetterResponseActionsProps {
  letterId: string;
  initialAction?: string;
}

export default function LetterResponseActions({ 
  letterId, 
  initialAction,
}: LetterResponseActionsProps) {
  const router = useRouter();
  const supabase = createClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [responding, setResponding] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [selectedAction, setSelectedAction] = useState<'accept' | 'decline' | null>(
    initialAction === 'accept' ? 'accept' : initialAction === 'decline' ? 'decline' : null
  );
  const [error, setError] = useState<string | null>(null);
  
  // Signature state
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Set drawing style
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [selectedAction]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const getSignatureData = (): string | null => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return null;
    return canvas.toDataURL('image/png');
  };

  // Helper to get access token without relying on getSession() which can hang
  const getAccessToken = async (): Promise<string | null> => {
    // Try to get token from cookie directly (avoids getSession hanging)
    const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').match(/\/\/([^.]+)\./)?.[1];
    if (projectRef) {
      const cookieName = `sb-${projectRef}-auth-token`;
      const allCookies = document.cookie.split(';').map(c => c.trim());
      
      for (const cookie of allCookies) {
        if (cookie.startsWith(`${cookieName}=`) || cookie.startsWith(`${cookieName}.0=`)) {
          let tokenStr = '';
          const chunkCookies = allCookies.filter(c => c.startsWith(`${cookieName}.`));
          
          if (chunkCookies.length > 0) {
            const sorted = chunkCookies.sort();
            tokenStr = sorted.map(c => c.split('=').slice(1).join('=')).join('');
          } else {
            tokenStr = cookie.split('=').slice(1).join('=');
          }

          try {
            const decoded = decodeURIComponent(tokenStr);
            const parsed = JSON.parse(decoded.startsWith('base64-') ? atob(decoded.slice(7)) : decoded);
            return parsed.access_token || null;
          } catch {
            // Fall through to getSession with timeout
          }
        }
      }
    }

    // Fallback: getSession with a 5s timeout
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
    const sessionPromise = supabase.auth.getSession().then(({ data }) => data.session?.access_token || null);
    return Promise.race([sessionPromise, timeoutPromise]);
  };

  const handleRespond = async () => {
    if (!selectedAction) {
      setError('Please select Accept or Decline');
      return;
    }

    // Require signature when accepting
    if (selectedAction === 'accept' && !hasSignature) {
      setError('Please sign the document to accept this letter');
      return;
    }

    setResponding(true);
    setError(null);

    try {
      const signatureData = selectedAction === 'accept' ? getSignatureData() : null;

      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

      // Get access token (avoids getSession() hanging)
      const accessToken = await getAccessToken();
      console.log('Got access token:', !!accessToken);

      if (!accessToken) {
        throw new Error('Unable to authenticate. Please refresh the page and try again.');
      }

      const updateData: Record<string, unknown> = {
        status: selectedAction === 'accept' ? 'accepted' : 'declined',
        talent_response_message: responseMessage.trim() || null,
        responded_at: new Date().toISOString(),
      };

      // Add signature data if accepting
      if (selectedAction === 'accept' && signatureData) {
        updateData.talent_signature_data = signatureData;
        updateData.talent_signed_at = new Date().toISOString();
        updateData.signature_status = 'admin_reviewing';
      }

      console.log('Sending update...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(
        `${supabaseUrl}/rest/v1/interest_letters?id=eq.${letterId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'apikey': anonKey!,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(updateData),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        console.log('Update successful');
        router.refresh();
      } else {
        const errorText = await response.text();
        console.error('Update failed:', errorText);
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }
    } catch (err) {
      console.error('Error responding:', err);
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to respond');
      }
    } finally {
      setResponding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Response</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setSelectedAction('accept')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
              selectedAction === 'accept'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Accept
          </button>
          <button
            type="button"
            onClick={() => setSelectedAction('decline')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
              selectedAction === 'decline'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
            }`}
          >
            <XCircle className="w-5 h-5" />
            Decline
          </button>
        </div>

        {/* Digital Signature - Only show when Accept is selected */}
        {selectedAction === 'accept' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                <span className="flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  Digital Signature <span className="text-red-500">*</span>
                </span>
              </label>
              <button
                type="button"
                onClick={clearSignature}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <RotateCcw className="w-4 h-4" />
                Clear
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Please sign below to accept this letter. Your signed letter will be reviewed by admin before being sent to the employer.
            </p>
            
            {/* Signature Canvas */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                className="w-full h-32 cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            
            {hasSignature && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Signature captured
              </p>
            )}
            
            <p className="text-xs text-gray-400">
              By signing, you agree to the terms outlined in this interest letter.
            </p>
          </div>
        )}

        {/* Response Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message (Optional)
          </label>
          <textarea
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={
              selectedAction === 'accept'
                ? "Thank you for the opportunity. I'm excited to move forward..."
                : "Thank you for considering me, but..."
            }
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Info about workflow */}
        {selectedAction === 'accept' && (
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
            <strong>Note:</strong> After you sign and submit, your signed letter will be reviewed by the admin team before being forwarded to the employer.
          </div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleRespond}
          disabled={responding || !selectedAction}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
            selectedAction === 'accept'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : selectedAction === 'decline'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {responding ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              {selectedAction === 'accept' ? 'Sign & Accept Letter' : selectedAction === 'decline' ? 'Decline Letter' : 'Select an option'}
            </>
          )}
        </button>
      </CardContent>
    </Card>
  );
}