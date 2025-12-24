'use client';

import { CheckCircle, Sparkles } from 'lucide-react';

interface WaitlistSuccessProps {
  queuePosition: number;
  category: 'talent' | 'employer' | 'agency' | 'lawyer';
  offer: string;
  accentColor?: string;
}

const categoryMessages: Record<string, { title: string; subtitle: string }> = {
  talent: {
    title: "You're on the list!",
    subtitle: "We'll notify you when we're ready to help you connect with O-1 sponsoring employers.",
  },
  employer: {
    title: "You're on the list!",
    subtitle: "We'll notify you when you can start browsing extraordinary O-1 talent.",
  },
  agency: {
    title: "You're on the list!",
    subtitle: "We'll notify you when you can start placing O-1 candidates with your clients.",
  },
  lawyer: {
    title: "You're on the list!",
    subtitle: "We'll notify you when you can start receiving O-1 client referrals.",
  },
};

export default function WaitlistSuccess({
  queuePosition,
  category,
  offer,
  accentColor = '#2563eb',
}: WaitlistSuccessProps) {
  const message = categoryMessages[category] || categoryMessages.talent;

  return (
    <div className="text-center py-12 px-6">
      {/* Success Icon */}
      <div
        className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <CheckCircle
          className="w-10 h-10"
          style={{ color: accentColor }}
        />
      </div>

      {/* Title */}
      <h2 className="text-3xl font-bold mb-3">{message.title}</h2>

      {/* Queue Position Badge */}
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-semibold text-lg mb-6"
        style={{ backgroundColor: accentColor }}
      >
        <span>#{queuePosition}</span>
        <span className="text-sm opacity-90">in line</span>
      </div>

      {/* Subtitle */}
      <p className="text-lg opacity-80 mb-8 max-w-md mx-auto">
        {message.subtitle}
      </p>

      {/* Offer Reminder */}
      <div
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg"
        style={{ backgroundColor: `${accentColor}10`, border: `1px solid ${accentColor}30` }}
      >
        <Sparkles className="w-5 h-5" style={{ color: accentColor }} />
        <span className="font-medium">Your offer: {offer}</span>
      </div>

      {/* Social Sharing or Additional Actions */}
      <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm opacity-60 mb-4">
          Check your email for confirmation. Add waitlist@o1dmatch.com to your contacts.
        </p>
      </div>
    </div>
  );
}
