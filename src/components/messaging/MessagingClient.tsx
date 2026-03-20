'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, ArrowLeft, Building2, User, Briefcase } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Sender {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Message {
  id: string;
  body: string;
  sender_role: 'employer' | 'agency' | 'talent';
  sender_user_id: string;
  is_read: boolean;
  created_at: string;
  sender: Sender;
}

interface TalentInfo {
  id: string;
  candidate_id: string;
  professional_headline: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
}

interface EmployerInfo {
  id: string;
  company_name: string;
  city: string | null;
  state: string | null;
}

interface AgencyInfo {
  id: string;
  agency_name: string;
  city: string | null;
  state: string | null;
}

interface Conversation {
  id: string;
  subject: string | null;
  last_message_at: string;
  last_message_text: string | null;
  talent_unread: number;
  sender_unread: number;
  talent: TalentInfo | null;
  employer: EmployerInfo | null;
  agency: AgencyInfo | null;
}

interface MessagingClientProps {
  viewerRole: 'talent' | 'employer' | 'agency';
  /** For employer/agency: pre-selected talent to message */
  preselectedTalentId?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)  return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getOtherPartyName(conv: Conversation, viewerRole: string): string {
  if (viewerRole === 'talent') {
    if (conv.employer) return conv.employer.company_name;
    if (conv.agency)   return conv.agency.agency_name;
  }
  return conv.talent?.professional_headline || conv.talent?.candidate_id || 'Talent';
}

function getOtherPartyLocation(conv: Conversation, viewerRole: string): string | null {
  if (viewerRole === 'talent') {
    const p = conv.employer ?? conv.agency;
    if (!p) return null;
    const loc = [p.city, p.state].filter(Boolean).join(', ');
    return loc || null;
  }
  const t = conv.talent;
  if (!t) return null;
  return [t.city, t.state].filter(Boolean).join(', ') || null;
}

function getUnreadCount(conv: Conversation, viewerRole: string): number {
  return viewerRole === 'talent' ? conv.talent_unread : conv.sender_unread;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MessagingClient({ viewerRole, preselectedTalentId }: MessagingClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [activeConv, setActiveConv]     = useState<Conversation | null>(null);
  const [newMessage, setNewMessage]     = useState('');
  const [sending, setSending]           = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs]   = useState(false);
  const [error, setError]               = useState<string | null>(null);

  // New conversation modal (employer/agency only)
  const [showNewConvModal, setShowNewConvModal] = useState(false);
  const [newConvTalentId, setNewConvTalentId]   = useState(preselectedTalentId || '');
  const [newConvSubject, setNewConvSubject]      = useState('');
  const [newConvMessage, setNewConvMessage]      = useState('');
  const [creatingConv, setCreatingConv]          = useState(false);

  // Email lookup state
  const [lookupEmail, setLookupEmail]           = useState('');
  const [lookupResult, setLookupResult]         = useState<{
    talent_id: string;
    full_name: string | null;
    candidate_id: string;
    professional_headline: string | null;
    city: string | null;
    state: string | null;
    o1_score: number | null;
  } | null>(null);
  const [lookupLoading, setLookupLoading]       = useState(false);
  const [lookupError, setLookupError]           = useState<string | null>(null);
  const lookupDebounceRef                        = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef   = useRef<HTMLDivElement>(null);
  const pollingRef       = useRef<NodeJS.Timeout | null>(null);
  const activeConvIdRef  = useRef<string | null>(null);

  // Keep ref in sync so fetchConversations can read it without stale closure
  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  // ── Lookup talent by Candidate ID (debounced) ───────────────────────────

  const lookupTalentByEmail = useCallback(async (candidateId: string) => {
    const trimmed = candidateId.trim();
    if (!trimmed) {
      setLookupResult(null);
      setLookupError(null);
      return;
    }
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);
    try {
      const res  = await fetch(`/api/messaging/lookup-talent?candidate_id=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLookupResult(data);
      setNewConvTalentId(data.talent_id);
    } catch (e: unknown) {
      setLookupError(e instanceof Error ? e.message : 'Talent not found');
      setNewConvTalentId('');
    } finally {
      setLookupLoading(false);
    }
  }, []);

  const handleEmailChange = (candidateId: string) => {
    setLookupEmail(candidateId);
    setLookupResult(null);
    setLookupError(null);
    if (lookupDebounceRef.current) clearTimeout(lookupDebounceRef.current);
    lookupDebounceRef.current = setTimeout(() => lookupTalentByEmail(candidateId), 600);
  };



  const fetchConversations = useCallback(async () => {
    try {
      const res  = await fetch('/api/messaging/conversations');
      const data = await res.json();
      if (data.conversations) {
        setConversations(prev => {
          const incoming = data.conversations as Conversation[];
          return incoming.map(c => {
            // If this conversation is currently open, keep unread at 0
            // so the highlight doesn't flicker back on before server catches up
            const wasActive = activeConvIdRef.current === c.id;
            if (wasActive) {
              return { ...c, talent_unread: 0, sender_unread: 0 };
            }
            // For other conversations, preserve any locally-zeroed unread
            // (edge case: user opened it but server hasn't updated yet)
            const existing = prev.find(p => p.id === c.id);
            if (existing && existing.talent_unread === 0 && c.talent_unread > 0) {
              return { ...c, talent_unread: 0 };
            }
            if (existing && existing.sender_unread === 0 && c.sender_unread > 0) {
              return { ...c, sender_unread: 0 };
            }
            return c;
          });
        });
      }
    } catch {
      setError('Failed to load conversations');
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    // Poll for new conversations every 15s
    pollingRef.current = setInterval(fetchConversations, 15000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [fetchConversations]);

  // Open pre-selected conversation if talent was passed — declared AFTER openConversation
  // (moved below to avoid "used before declaration" error)

  // ── Open a conversation (initial load — shows spinner) ──────────────────

  const openConversation = useCallback(async (convId: string) => {
    setActiveConvId(convId);
    setLoadingMsgs(true);
    setError(null);

    // Fire-and-forget: persist unread=0 to DB immediately so it survives refresh
    fetch(`/api/messaging/conversations/${convId}/read`, { method: 'PATCH' }).catch(() => {});

    // Zero out locally right away too
    setConversations(prev =>
      prev.map(c => c.id === convId
        ? { ...c, talent_unread: 0, sender_unread: 0 }
        : c
      )
    );

    try {
      const res  = await fetch(`/api/messaging/conversations/${convId}/messages`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages(data.messages);
      setActiveConv(data.conversation);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load messages');
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  // Now safe to reference openConversation — it is declared above
  useEffect(() => {
    if (preselectedTalentId && conversations.length > 0) {
      const existing = conversations.find(c => c.talent?.id === preselectedTalentId);
      if (existing) openConversation(existing.id);
    }
  }, [preselectedTalentId, conversations, openConversation]);

  // ── Silent background refresh — NEVER sets loadingMsgs, never blurs input ─

  const refreshMessagesSilently = useCallback(async (convId: string) => {
    try {
      const res  = await fetch(`/api/messaging/conversations/${convId}/messages`);
      const data = await res.json();
      if (!res.ok) return; // fail silently in background
      // Only update if message count changed or last message differs
      setMessages(prev => {
        const incoming = data.messages as Message[];
        if (
          incoming.length === prev.length &&
          incoming[incoming.length - 1]?.id === prev[prev.length - 1]?.id
        ) return prev;
        // New messages arrived — persist read to DB
        fetch(`/api/messaging/conversations/${convId}/read`, { method: 'PATCH' }).catch(() => {});
        return incoming;
      });
      setActiveConv(data.conversation);
      setConversations(prev =>
        prev.map(c => c.id === convId
          ? { ...c, talent_unread: 0, sender_unread: 0 }
          : c
        )
      );
    } catch {
      // silent — don't show error for background polls
    }
  }, []);

  // Scroll to bottom only when a new message is added
  const prevMessageCountRef = useRef(0);
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  // Poll active conversation every 6s — silently, without touching input area
  useEffect(() => {
    if (!activeConvId) return;
    const interval = setInterval(() => refreshMessagesSilently(activeConvId), 6000);
    return () => clearInterval(interval);
  }, [activeConvId, refreshMessagesSilently]);

  // ── Send a message ───────────────────────────────────────────────────────

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConvId || sending) return;
    setSending(true);
    const body = newMessage.trim();
    setNewMessage('');

    try {
      const res  = await fetch(`/api/messaging/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Refresh messages silently — preserves textarea focus
      await refreshMessagesSilently(activeConvId);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send');
      setNewMessage(body); // restore
    } finally {
      setSending(false);
    }
  };

  // ── Create new conversation ──────────────────────────────────────────────

  const createConversation = async () => {
    if (!newConvTalentId.trim() || !newConvMessage.trim() || creatingConv) return;
    setCreatingConv(true);
    setError(null);

    try {
      const res  = await fetch('/api/messaging/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          talent_id:     newConvTalentId.trim(),
          subject:       newConvSubject.trim() || undefined,
          first_message: newConvMessage.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowNewConvModal(false);
      setNewConvTalentId(preselectedTalentId || '');
      setNewConvSubject('');
      setNewConvMessage('');
      setLookupEmail('');
      setLookupResult(null);
      setLookupError(null);

      await fetchConversations();
      await openConversation(data.conversation_id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create conversation');
    } finally {
      setCreatingConv(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  const totalUnread = conversations.reduce((sum, c) => sum + getUnreadCount(c, viewerRole), 0);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

      {/* ── Sidebar: Conversation List ─────────────────────────────── */}
      <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              {totalUnread > 0 && (
                <p className="text-xs text-blue-600 font-medium">{totalUnread} unread</p>
              )}
            </div>
            {viewerRole !== 'talent' && (
              <button
                onClick={() => { setShowNewConvModal(true); setNewConvTalentId(preselectedTalentId || ''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: '#D4A84B', color: '#0B1D35' }}
              >
                <MessageSquare className="w-4 h-4" />
                New Message
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="p-6 text-center text-gray-500 text-sm">Loading conversations…</div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {viewerRole === 'talent'
                  ? 'No messages yet. Employers and agencies will appear here.'
                  : 'No conversations yet. Click "New" to message a talent.'}
              </p>
            </div>
          ) : (
            conversations.map(conv => {
              const unread = getUnreadCount(conv, viewerRole);
              const isActive = conv.id === activeConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv.id)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                  }`}
                >
                  {/* Party icon + name */}
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      viewerRole === 'talent'
                        ? conv.employer ? 'bg-blue-100' : 'bg-purple-100'
                        : 'bg-teal-100'
                    }`}>
                      {viewerRole === 'talent'
                        ? conv.employer ? <Building2 className="w-4 h-4 text-blue-600" /> : <Briefcase className="w-4 h-4 text-purple-600" />
                        : <User className="w-4 h-4 text-teal-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-sm truncate ${unread > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {getOtherPartyName(conv, viewerRole)}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatTime(conv.last_message_at)}
                        </span>
                      </div>
                      {conv.subject && (
                        <p className="text-xs text-gray-500 truncate">{conv.subject}</p>
                      )}
                      <p className={`text-xs mt-0.5 truncate ${unread > 0 ? 'text-gray-800' : 'text-gray-500'}`}>
                        {conv.last_message_text || 'No messages yet'}
                      </p>
                    </div>
                    {unread > 0 && (
                      <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                        {unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Main: Message Thread ────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col ${activeConvId ? 'flex' : 'hidden md:flex'}`}>
        {!activeConvId ? (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <MessageSquare className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Select a conversation to view messages</p>
            </div>
          </div>
        ) : loadingMsgs ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400">Loading messages…</p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
              <button
                className="md:hidden text-gray-500 hover:text-gray-700"
                onClick={() => setActiveConvId(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {activeConv ? getOtherPartyName(activeConv, viewerRole) : ''}
                </p>
                {activeConv && (
                  <p className="text-xs text-gray-500">
                    {activeConv.subject || getOtherPartyLocation(activeConv, viewerRole) || ''}
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">No messages yet. Start the conversation below.</p>
              )}
              {messages.map(msg => {
                const isMine = msg.sender_role === viewerRole;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isMine ? 'order-2' : 'order-1'}`}>
                      {!isMine && (
                        <p className="text-xs text-gray-500 mb-1 ml-1 capitalize">
                          {msg.sender.full_name || msg.sender_role}
                        </p>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-sm'
                      }`}>
                        {msg.body}
                      </div>
                      <p className={`text-xs text-gray-400 mt-1 ${isMine ? 'text-right mr-1' : 'ml-1'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {error && (
                <p className="text-xs text-red-500 mb-2">{error}</p>
              )}
              <div className="flex gap-2 items-end">
                <textarea
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                  rows={2}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── New Conversation Modal (Employer / Agency) ──────────────── */}
      {showNewConvModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">New Message to Talent</h3>
              <p className="text-sm text-gray-500 mt-0.5">Enter the talent&apos;s ID to start a conversation</p>
            </div>

            <div className="p-6 space-y-4">

              {/* Candidate ID lookup */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Talent ID <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => lookupTalentByEmail(lookupEmail)}
                    disabled={!lookupEmail.trim() || lookupLoading}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                  >
                    {lookupLoading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify'
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={lookupEmail}
                    onChange={e => handleEmailChange(e.target.value)}
                    placeholder="e.g. CAND-618279"
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wide ${
                      lookupError   ? 'border-red-400 bg-red-50' :
                      lookupResult  ? 'border-green-400 bg-green-50' :
                      'border-gray-300'
                    }`}
                  />
                </div>

                {/* Lookup error */}
                {lookupError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <span>✕</span> {lookupError}
                  </p>
                )}

                {/* Talent found card */}
                {lookupResult && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-700 text-xs font-bold">
                        {(lookupResult.full_name ?? lookupResult.candidate_id ?? 'T')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {lookupResult.full_name || lookupResult.candidate_id}
                      </p>
                      {lookupResult.professional_headline && (
                        <p className="text-xs text-gray-600 truncate">{lookupResult.professional_headline}</p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        {(lookupResult.city || lookupResult.state) && (
                          <span className="text-xs text-gray-500">
                            {[lookupResult.city, lookupResult.state].filter(Boolean).join(', ')}
                          </span>
                        )}
                        {lookupResult.o1_score != null && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                            O-1 Score: {lookupResult.o1_score}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                )}
              </div>

              {/* Subject + Message — only show after talent is found */}
              {lookupResult && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject (optional)</label>
                    <input
                      type="text"
                      value={newConvSubject}
                      onChange={e => setNewConvSubject(e.target.value)}
                      placeholder="e.g. Exciting opportunity at Acme Corp"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={newConvMessage}
                      onChange={e => setNewConvMessage(e.target.value)}
                      placeholder={`Hi ${lookupResult.full_name?.split(' ')[0] || 'there'}, I came across your profile and…`}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                </>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => {
                  setShowNewConvModal(false);
                  setError(null);
                  setLookupEmail('');
                  setLookupResult(null);
                  setLookupError(null);
                  setNewConvSubject('');
                  setNewConvMessage('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createConversation}
                disabled={!lookupResult || !newConvMessage.trim() || creatingConv}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creatingConv ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}