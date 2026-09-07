'use client';

import type Submission from 'types/submission';

import { ArrowLeft, Inbox, Reply, Send } from 'lucide-react';
import { useState } from 'react';

import EmptyState from '../_components/emptyState';

type Message = {
  id: string;
  sender: string;
  email?: string;
  form: string;
  body: string;
  date: string;
  spam: boolean;
  source: Submission;
};

export default function InboxReader({
  submissions,
  selected,
  onSelection,
  allSelected,
  toggleAll,
}: {
  submissions: Submission[];
  selected: Set<string>;
  onSelection: (value: Set<string>) => void;
  allSelected: boolean;
  toggleAll: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileReader, setMobileReader] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const messages: Message[] = submissions.map((s) => ({
    id: s.id,
    sender: s.sender || 'Anonymous',
    email:
      typeof s.data.email === 'string'
        ? s.data.email
        : s.sender?.includes('@')
          ? s.sender
          : undefined,
    form: s.form.name,
    body:
      s.body ||
      Object.values(s.data)
        .filter((value) => typeof value === 'string')
        .join('\n'),
    date: s.inserted_at,
    spam: Boolean(s.flagged_at),
    source: s,
  }));
  const active = messages.find((m) => m.id === activeId) || messages[0];
  const draft = active ? drafts[active.id] || '' : '';
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Select a message to read and draft a reply.
      </p>
      <section
        aria-label="Submission inbox"
        className="grid min-w-0 overflow-hidden rounded-xl border border-line-strong bg-surface lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.65fr)]"
      >
        <div
          className={`${mobileReader ? 'hidden lg:flex' : 'flex'} min-w-0 flex-col border-[#d7cfc2] lg:border-r`}
        >
          <div className="flex h-14 shrink-0 items-center gap-3 border-b border-l-[3px] border-line-strong border-l-transparent px-4">
            <input
              type="checkbox"
              aria-label="Select all submissions on this page"
              checked={allSelected}
              onChange={toggleAll}
              className="h-4 w-4 accent-brand"
            />
            <span className="font-semibold">Inbox</span>
            <span className="ml-auto text-xs text-muted">
              {messages.length} on this page
            </span>
          </div>
          <form
            id="submissions_management"
            className="divide-y lg:max-h-[760px] lg:overflow-y-auto [&>div]:border-t-[#e9e3d9]"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`relative flex items-start gap-3 border-l-[3px] px-4 py-4 ${active?.id === m.id ? 'border-l-brand bg-[#fbefeb]' : 'border-l-line-strong hover:bg-[#faf7f1]'}`}
              >
                <input
                  aria-label={`Select submission from ${m.sender}`}
                  type="checkbox"
                  name="submissionSelect"
                  value={m.id}
                  checked={selected.has(m.id)}
                  onChange={(e) => {
                    const next = new Set(selected);
                    if (e.target.checked) next.add(m.id);
                    else next.delete(m.id);
                    onSelection(next);
                  }}
                  className="relative z-10 mt-1 h-4 w-4 shrink-0 accent-brand"
                />
                <button
                  type="button"
                  aria-pressed={active?.id === m.id}
                  onClick={() => {
                    setActiveId(m.id);
                    setMobileReader(true);
                  }}
                  className="min-w-0 flex-1 text-left after:absolute after:inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bf453d]"
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-semibold text-[#292a30]">
                      {m.sender}
                    </span>
                    <time
                      dateTime={m.date}
                      className="shrink-0 text-[11px] tabular-nums text-muted"
                    >
                      {new Date(m.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </span>
                  <span className="mt-1 block truncate text-xs font-medium text-muted">
                    {m.form}
                  </span>
                  <span className="mt-2 line-clamp-2 text-[13px] leading-5 text-[#62636b]">
                    {m.spam && (
                      <span className="mr-1.5 rounded bg-[#ead9ce] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#70452d]">
                        Spam
                      </span>
                    )}
                    {m.body}
                  </span>
                </button>
              </div>
            ))}
            {!messages.length && (
              <EmptyState
                title="No submissions to show"
                description="Try a different search or form filter. New submissions will appear here when they arrive."
                href="/submissions"
                action="Clear search and filters"
              />
            )}
          </form>
        </div>
        <div
          className={`${mobileReader ? 'flex' : 'hidden lg:flex'} min-w-0 flex-col`}
        >
          {active ? (
            <>
              <div className="flex min-h-14 items-center gap-3 border-b border-line-strong px-5 py-3 lg:px-8">
                <button
                  type="button"
                  onClick={() => setMobileReader(false)}
                  aria-label="Back to inbox"
                  className="rounded p-2 hover:bg-[#f5eee4] lg:hidden"
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {active.form}
                </h2>
                <span className="text-xs text-muted">Submission</span>
              </div>
              <div className="space-y-7 px-5 py-6 lg:px-8 lg:py-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold">
                      {active.sender}
                    </h3>
                    <p className="mt-1 break-all text-xs text-muted">
                      {active.email || 'No reply address provided'}
                    </p>
                  </div>
                  <time
                    dateTime={active.date}
                    className="text-xs tabular-nums text-muted"
                  >
                    {new Date(active.date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
                <div className="whitespace-pre-wrap break-words text-sm leading-7 text-[#42434b]">
                  {active.spam && (
                    <span className="mb-3 block w-fit rounded bg-[#ead9ce] px-2 py-1 text-xs font-semibold text-[#70452d]">
                      Spam
                    </span>
                  )}
                  {active.body}
                </div>
                {active.source && (
                  <details className="border-y border-[#e9e3d9] py-3 text-xs text-muted">
                    <summary className="cursor-pointer font-medium">
                      Submission details & attachments
                    </summary>
                    <dl className="mt-4 space-y-3">
                      {Object.entries<string | Submission['data'][string]>({
                        ...active.source.data,
                        'IP address': active.source.sender_ip,
                        Referrer: active.source.sender_referrer,
                        'User agent': active.source.sender_user_agent,
                      }).map(([key, value]) => (
                        <div
                          key={key}
                          className="grid gap-1 sm:grid-cols-[120px_minmax(0,1fr)]"
                        >
                          <dt className="font-semibold">{key}</dt>
                          <dd className="break-words">
                            {value == null ? (
                              '—'
                            ) : typeof value === 'string' ? (
                              value
                            ) : (
                              <a
                                href={value.url}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                {value.file_name}
                              </a>
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </details>
                )}
                <form
                  className="overflow-hidden rounded-lg border border-line-strong focus-within:border-brand"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div className="flex items-center gap-2 border-b border-[#e9e3d9] bg-[#faf7f1] px-4 py-3 text-sm font-medium">
                    <Reply size={16} />
                    <label htmlFor="inline-reply">Reply</label>
                    <span className="min-w-0 truncate text-xs font-normal text-muted">
                      to {active.email || '—'}
                    </span>
                  </div>
                  <textarea
                    id="inline-reply"
                    value={draft}
                    onChange={(e) =>
                      setDrafts({ ...drafts, [active.id]: e.target.value })
                    }
                    placeholder={
                      active.email
                        ? 'Write a reply…'
                        : 'No email address is available for this submission.'
                    }
                    disabled={!active.email}
                    rows={6}
                    className="block w-full resize-y border-0 bg-transparent px-4 py-4 text-sm leading-6 outline-none disabled:opacity-50"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e9e3d9] px-4 py-3">
                    <button
                      type="submit"
                      disabled
                      className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Send size={14} />
                      Send reply
                    </button>
                    <p className="text-xs text-muted">
                      Email sending not connected
                    </p>
                  </div>
                </form>
                <p className="text-xs text-muted">
                  Drafts stay here while switching messages. Refreshing clears
                  them.
                </p>
              </div>
            </>
          ) : (
            <div className="flex min-h-96 flex-col items-center justify-center gap-3 text-muted">
              <Inbox size={28} />
              <p>Select a submission to read it.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
