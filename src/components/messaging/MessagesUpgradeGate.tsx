// src/components/messaging/MessagesUpgradeGate.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, MessageSquare, X, Zap, CheckCircle } from 'lucide-react';

const fakeConversations = [
  { name: 'Acme Corp', msg: "We'd love to discuss your O-1 application...", time: '2m ago', unread: true },
  { name: 'TechStart Inc.', msg: 'Hi! We reviewed your profile and think...', time: '1h ago', unread: true },
  { name: 'Global Talent Agency', msg: 'Following up on your petition status...', time: 'Yesterday', unread: false },
];

const features = [
  'Direct messages from top employers',
  'Real-time notifications for new messages',
  'Full conversation history',
  'Priority visibility to recruiters',
];

export default function MessagesUpgradeGate() {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <>
      {/* Blurred background preview */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200">
        {/* Fake conversation list - purely decorative */}
        <div className="blur-sm pointer-events-none select-none p-4 space-y-3 bg-white">
          {fakeConversations.map((c, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#0B1D35] font-bold text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #D4A84B, #E8C97A)' }}
              >
                {c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-900">{c.name}</span>
                  <span className="text-xs text-gray-400">{c.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{c.msg}</p>
              </div>
              {c.unread && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#D4A84B] mt-1 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
          <button
            onClick={() => setModalOpen(true)}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow"
          >
            <div className="w-14 h-14 rounded-full bg-[#0B1D35] flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#D4A84B]" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900">Unlock Messages</p>
              <p className="text-sm text-gray-500 mt-0.5">Upgrade your plan to access</p>
            </div>
            <span
              className="px-5 py-2 rounded-[10px] text-sm font-semibold"
              style={{ background: '#D4A84B', color: '#0B1D35' }}
            >
              Upgrade Now
            </span>
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="relative p-6 pb-4" style={{ background: '#0B1D35' }}>
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,168,75,0.2)' }}>
                  <MessageSquare className="w-6 h-6 text-[#D4A84B]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Unlock Messaging</h2>
                  <p className="text-sm text-white/50">Available on paid plans</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <p className="text-gray-600 text-sm leading-relaxed">
                Upgrade your plan to start receiving and replying to messages from employers and agencies interested in your profile.
              </p>

              {/* Feature list */}
              <ul className="space-y-2.5">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-[#D4A84B] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA buttons */}
              <div className="flex flex-col gap-2.5 pt-1">
                <Link
                  href="/dashboard/talent/billing"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: '#D4A84B', color: '#0B1D35' }}
                >
                  <Zap className="w-4 h-4" />
                  View Upgrade Plans
                </Link>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-full py-3 rounded-xl font-medium text-sm text-gray-500 hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}