// src/app/(dashboard)/dashboard/employer/messages/EmployerMessagesWrapper.tsx
'use client';

import MessagingClient from '@/components/messaging/MessagingClient';

export default function EmployerMessagesWrapper() {
  return (
    <>
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 text-sm mt-1">
          Send and receive messages with talent on the platform.
        </p>
      </div>

      {/* MessagingClient — contains the golden New Message button internally */}
      <MessagingClient viewerRole="employer" />
    </>
  );
}