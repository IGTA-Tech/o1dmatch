// src/app/(dashboard)/dashboard/agency/messages/AgencyMessagesWrapper.tsx
'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import MessagingClient from '@/components/messaging/MessagingClient';

export default function AgencyMessagesWrapper() {
  const [openNewConv, setOpenNewConv] = useState(false);

  return (
    <>
      {/* Page header with golden New Message button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 text-sm mt-1">
            Send and receive messages with talent you are working with.
          </p>
        </div>
        <button
          onClick={() => setOpenNewConv(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: '#D4A84B', color: '#0B1D35' }}
        >
          <MessageSquare className="w-4 h-4" />
          New Message
        </button>
      </div>

      {/* MessagingClient — also has its own internal New Message button */}
      <MessagingClient
        viewerRole="agency"
        openNewConv={openNewConv}
        onNewConvClose={() => setOpenNewConv(false)}
      />
    </>
  );
}