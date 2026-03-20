'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Search, Building2, Briefcase, User,
  ChevronRight, ArrowLeft, RefreshCw, X, Trash2,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface UserInfo {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface TalentInfo {
  id: string;
  candidate_id: string;
  professional_headline: string | null;
  city: string | null;
  state: string | null;
  o1_score: number | null;
  user: UserInfo | null;
}

interface EmployerInfo {
  id: string;
  company_name: string;
  city: string | null;
  state: string | null;
  user: UserInfo | null;
}

interface AgencyInfo {
  id: string;
  agency_name: string;
  city: string | null;
  state: string | null;
  user: UserInfo | null;
}

interface Conversation {
  id: string;
  subject: string | null;
  last_message_at: string;
  last_message_text: string | null;
  talent_unread: number;
  sender_unread: number;
  created_at: string;
  talent: TalentInfo | null;
  employer: EmployerInfo | null;
  agency: AgencyInfo | null;
}

interface Message {
  id: string;
  body: string;
  sender_role: 'employer' | 'agency' | 'talent';
  sender_user_id: string;
  is_read: boolean;
  created_at: string;
  sender: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface Props {
  conversations: Conversation[];
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

function formatDateTime(ts: string) {
  return new Date(ts).toLocaleString([], {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getSenderName(conv: Conversation): string {
  if (conv.employer) return conv.employer.company_name;
  if (conv.agency)   return conv.agency.agency_name;
  return 'Unknown';
}

function getSenderType(conv: Conversation): 'employer' | 'agency' {
  return conv.employer ? 'employer' : 'agency';
}

function getTalentName(conv: Conversation): string {
  return conv.talent?.user?.full_name || conv.talent?.candidate_id || 'Unknown Talent';
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminConversationsClient({ conversations: initial }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>(initial);
  const [filtered, setFiltered]           = useState<Conversation[]>(initial);
  const [search, setSearch]               = useState('');
  const [filterType, setFilterType]       = useState<'all' | 'employer' | 'agency'>('all');
  const [activeConvId, setActiveConvId]   = useState<string | null>(null);
  const [activeConv, setActiveConv]       = useState<Conversation | null>(null);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const [refreshing, setRefreshing]       = useState(false);
  const [deletingMsgId, setDeletingMsgId] = useState<string | null>(null);
  const messagesEndRef                    = useRef<HTMLDivElement>(null);

  // ── Filter logic ──────────────────────────────────────────────────────────

  useEffect(() => {
    let list = conversations;

    if (filterType !== 'all') {
      list = list.filter(c =>
        filterType === 'employer' ? !!c.employer : !!c.agency
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        getSenderName(c).toLowerCase().includes(q) ||
        getTalentName(c).toLowerCase().includes(q) ||
        c.talent?.user?.email?.toLowerCase().includes(q) ||
        c.employer?.user?.email?.toLowerCase().includes(q) ||
        c.agency?.user?.email?.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q) ||
        c.last_message_text?.toLowerCase().includes(q)
      );
    }

    setFiltered(list);
  }, [search, filterType, conversations]);

  // ── Open conversation thread ──────────────────────────────────────────────

  const openConversation = async (conv: Conversation) => {
    setActiveConvId(conv.id);
    setActiveConv(conv);
    setLoadingMsgs(true);

    try {
      const res  = await fetch(`/api/messaging/admin/conversations/${conv.id}/messages`);
      const data = await res.json();
      if (res.ok) setMessages(data.messages ?? []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Refresh all conversations ─────────────────────────────────────────────

  const refreshConversations = async () => {
    setRefreshing(true);
    try {
      const res  = await fetch('/api/messaging/admin/conversations');
      const data = await res.json();
      if (data.conversations) setConversations(data.conversations);
    } catch { /* silent */ } finally {
      setRefreshing(false);
    }
  };

  // ── Delete a message ─────────────────────────────────────────────────────

  const deleteMessage = async (msgId: string) => {
    if (!activeConvId) return;
    if (!window.confirm('Permanently delete this message? This cannot be undone.')) return;

    setDeletingMsgId(msgId);
    try {
      const res = await fetch(`/api/messaging/admin/conversations/${activeConvId}/messages`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: msgId }),
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== msgId));
      }
    } catch { /* silent */ } finally {
      setDeletingMsgId(null);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────

  const totalUnread = conversations.reduce(
    (sum, c) => sum + c.talent_unread + c.sender_unread, 0
  );
  const employerConvs = conversations.filter(c => !!c.employer).length;
  const agencyConvs   = conversations.filter(c => !!c.agency).length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Conversations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor all messaging activity on the platform</p>
        </div>
        <button
          onClick={refreshConversations}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Conversations', value: conversations.length, color: 'blue' },
          { label: 'Employer Threads',    value: employerConvs,        color: 'teal' },
          { label: 'Agency Threads',      value: agencyConvs,          color: 'purple' },
          { label: 'Unread Messages',     value: totalUnread,          color: 'amber' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 text-${stat.color}-600`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div className="flex h-[calc(100vh-16rem)] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

        {/* ── Left: Conversation list ──────────────────────────────────── */}
        <div className={`w-full md:w-96 border-r border-gray-200 flex flex-col ${activeConvId ? 'hidden md:flex' : 'flex'}`}>

          {/* Search + filter */}
          <div className="p-3 border-b border-gray-200 space-y-2 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email, message…"
                className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Type filter pills */}
            <div className="flex gap-1.5">
              {(['all', 'employer', 'agency'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                    filterType === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-400 pl-1">
              {filtered.length} conversation{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No conversations found</p>
              </div>
            ) : (
              filtered.map(conv => {
                const senderType = getSenderType(conv);
                const isActive   = conv.id === activeConvId;
                const hasUnread  = conv.talent_unread > 0 || conv.sender_unread > 0;

                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      isActive ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Sender icon */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        senderType === 'employer' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {senderType === 'employer'
                          ? <Building2 className="w-4 h-4 text-blue-600" />
                          : <Briefcase className="w-4 h-4 text-purple-600" />
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Sender → Talent */}
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {getSenderName(conv)}
                            <span className="text-gray-400 font-normal mx-1">→</span>
                            <span className="text-gray-700">{getTalentName(conv)}</span>
                          </p>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatTime(conv.last_message_at)}
                          </span>
                        </div>

                        {/* Subject or last message */}
                        {conv.subject && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{conv.subject}</p>
                        )}
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {conv.last_message_text || 'No messages yet'}
                        </p>

                        {/* Unread badges */}
                        {hasUnread && (
                          <div className="flex gap-1.5 mt-1.5">
                            {conv.talent_unread > 0 && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full font-medium">
                                <User className="w-2.5 h-2.5" />
                                {conv.talent_unread} talent unread
                              </span>
                            )}
                            {conv.sender_unread > 0 && (
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs rounded-full font-medium ${
                                senderType === 'employer'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {senderType === 'employer'
                                  ? <Building2 className="w-2.5 h-2.5" />
                                  : <Briefcase className="w-2.5 h-2.5" />
                                }
                                {conv.sender_unread} sender unread
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: Message thread ────────────────────────────────────── */}
        <div className={`flex-1 flex flex-col ${activeConvId ? 'flex' : 'hidden md:flex'}`}>

          {!activeConvId ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageSquare className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">Select a conversation to view messages</p>
              </div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50 flex items-start gap-3">
                <button
                  className="md:hidden text-gray-500 hover:text-gray-700 mt-0.5"
                  onClick={() => setActiveConvId(null)}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-6 gap-y-1">
                  {/* Sender */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                      {activeConv?.employer ? 'Employer' : 'Agency'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {activeConv ? getSenderName(activeConv) : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activeConv?.employer?.user?.email ?? activeConv?.agency?.user?.email ?? ''}
                    </p>
                  </div>

                  {/* Talent */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Talent</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {activeConv ? getTalentName(activeConv) : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activeConv?.talent?.user?.email ?? ''}
                    </p>
                  </div>

                  {/* Subject + meta */}
                  {activeConv?.subject && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-700">Subject:</span> {activeConv.subject}
                      </p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">
                      Started {activeConv ? formatDateTime(activeConv.created_at) : ''}
                      {' · '}
                      {messages.length} message{messages.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">No messages in this conversation yet.</p>
                ) : (
                  messages.map(msg => {
                    const isTalent = msg.sender_role === 'talent';
                    const isDeleting = deletingMsgId === msg.id;
                    return (
                      <div key={msg.id} className={`flex group items-start gap-2 ${isTalent ? 'justify-end' : 'justify-start'}`}>

                        {/* Delete button — left of bubble for talent (right-aligned), right for others */}
                        {isTalent && (
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            disabled={isDeleting}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 disabled:opacity-40 self-center flex-shrink-0"
                            title="Delete message"
                          >
                            {isDeleting
                              ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />
                            }
                          </button>
                        )}

                        <div className="max-w-[68%]">
                          <div className="flex items-center gap-1.5 mb-1">
                            {/* Role badge */}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                              msg.sender_role === 'talent'   ? 'bg-teal-100 text-teal-700' :
                              msg.sender_role === 'employer' ? 'bg-blue-100 text-blue-700' :
                                                               'bg-purple-100 text-purple-700'
                            }`}>
                              {msg.sender_role}
                            </span>
                            <span className="text-xs text-gray-400">
                              {msg.sender.full_name || msg.sender_role}
                            </span>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs text-gray-400">{formatDateTime(msg.created_at)}</span>
                          </div>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isTalent
                              ? 'bg-teal-600 text-white rounded-br-sm'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm shadow-sm'
                          }`}>
                            {msg.body}
                          </div>
                        </div>

                        {/* Delete button — right of bubble for employer/agency */}
                        {!isTalent && (
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            disabled={isDeleting}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 disabled:opacity-40 self-center flex-shrink-0"
                            title="Delete message"
                          >
                            {isDeleting
                              ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />
                            }
                          </button>
                        )}

                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Admin notice */}
              <div className="px-5 py-3 border-t border-gray-200 bg-white text-center">
                <p className="text-xs text-gray-400">
                  👁 Admin view — read only. Hover over any message to delete it.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}