'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { eaChassis } from '@/config/ea-chassis';
import './cpr-help-assistant.css';

type Message = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  href?: string;
  cta?: string;
};

type Intent = {
  id: string;
  label: string;
  match: string[];
  answer: string;
  href: string;
  cta: string;
};

function buildIntents(base: string): Intent[] {
  return [
    {
      id: 'next',
      label: 'What should I do next?',
      match: ['next', 'start', 'do first', 'where do i begin', 'what now'],
      answer:
        'Start with the dashboard. It ranks the most important next step based on setup, recent activity, and open items.',
      href: base,
      cta: 'Open dashboard',
    },
    {
      id: 'profile',
      label: 'Complete my profile',
      match: ['profile', 'bio', 'details', 'school', 'stats'],
      answer:
        'Your profile is the foundation for this portal. Make sure the basics, key details, documents, and contact info are complete.',
      href: `${base}/recruiting-timeline`,
      cta: 'View profile steps',
    },
    {
      id: 'film',
      label: 'Upload film or documents',
      match: ['film', 'video', 'highlight', 'document', 'transcript', 'upload'],
      answer:
        'Use the Document Vault for videos, forms, files, and other items the team needs to support your next steps.',
      href: `${base}/document-vault`,
      cta: 'Open document vault',
    },
    {
      id: 'timeline',
      label: 'Understand my timeline',
      match: ['timeline', 'roadmap', 'when', 'deadline', 'process'],
      answer:
        'The timeline explains what matters by stage, what is already complete, and what needs attention next.',
      href: `${base}/recruiting-timeline`,
      cta: 'Open timeline',
    },
    {
      id: 'eligibility',
      label: 'Eligibility questions',
      match: ['eligibility', 'ncaa', 'naia', 'u sports', 'grades', 'gpa', 'clearinghouse'],
      answer:
        'Eligibility rules vary by governing body. Start with the Eligibility Center to understand registration, academics, and next requirements.',
      href: `${base}/eligibility-center`,
      cta: 'Open eligibility center',
    },
    {
      id: 'scholarships',
      label: 'Scholarships and offers',
      match: ['scholarship', 'offer', 'money', 'aid', 'school interest', 'program'],
      answer:
        'The opportunities center helps you understand available options, tracked interest, support paths, and decisions.',
      href: `${base}/scholarship-center`,
      cta: 'Open scholarship center',
    },
    {
      id: 'messages',
      label: 'Message the team',
      match: ['message', 'coach mike', 'talk', 'contact', 'reply', 'team'],
      answer: eaChassis.assistant.messageAnswer,
      href: `${base}/messaging-center`,
      cta: 'Open messages',
    },
    {
      id: 'ask',
      label: eaChassis.assistant.supportQuestionLabel,
      match: ['ask', 'question', 'help', 'stuck', 'support', 'ticket'],
      answer: eaChassis.assistant.supportAnswer,
      href: `${base}/ask-cpr`,
      cta: eaChassis.assistant.supportQuestionCta,
    },
    {
      id: 'updates',
      label: 'Find latest updates',
      match: ['update', 'latest', 'progress', 'feed', 'what changed'],
      answer: eaChassis.assistant.updatesAnswer,
      href: `${base}/updates`,
      cta: 'Open updates',
    },
    {
      id: 'resources',
      label: 'Open resources',
      match: ['resource', 'learn', 'guide', 'article', 'video', 'how it works'],
      answer:
        'The Resource Library and learning centers explain important topics, preparation steps, and owner-selected guidance in plain language.',
      href: `${base}/resource-library`,
      cta: 'Open resources',
    },
  ];
}

function createAssistantMessage(intent: Intent): Message {
  return {
    id: `${intent.id}-${Date.now()}`,
    role: 'assistant',
    text: intent.answer,
    href: intent.href,
    cta: intent.cta,
  };
}

export default function CprHelpAssistant({
  portalType,
  slug,
}: {
  portalType: 'athlete' | 'parent';
  slug: string;
}) {
  const base = `/portal/${portalType}/${slug}`;
  const intents = useMemo(() => buildIntents(base), [base]);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: eaChassis.assistant.welcome,
    },
  ]);

  function findIntent(text: string) {
    const normalized = text.toLowerCase();
    return (
      intents.find((intent) => intent.match.some((phrase) => normalized.includes(phrase))) ||
      intents[0]
    );
  }

  function ask(text: string) {
    const value = text.trim();
    if (!value) return;
    const intent = findIntent(value);
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', text: value },
      createAssistantMessage(intent),
    ]);
    setInput('');
    setOpen(true);
  }

  return (
    <div className={`cpr-help${open ? ' is-open' : ''}`}>
      {open && (
        <section className="cpr-help-panel" aria-label={eaChassis.assistant.name}>
          <header>
            <div>
              <span>{eaChassis.assistant.name}</span>
              <strong>What do you need?</strong>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close help">
              ×
            </button>
          </header>

          <div className="cpr-help-messages" aria-live="polite">
            {messages.map((message) => (
              <article key={message.id} className={`cpr-help-message ${message.role}`}>
                <p>{message.text}</p>
                {message.href && message.cta && (
                  <Link href={message.href}>{message.cta}</Link>
                )}
              </article>
            ))}
          </div>

          <div className="cpr-help-prompts">
            {intents.slice(0, 5).map((intent) => (
              <button key={intent.id} type="button" onClick={() => ask(intent.label)}>
                {intent.label}
              </button>
            ))}
          </div>

          <form
            className="cpr-help-form"
            onSubmit={(event) => {
              event.preventDefault();
              ask(input);
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about film, eligibility, updates..."
              aria-label={`Ask ${eaChassis.assistant.name}`}
            />
            <button type="submit">Ask</button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="cpr-help-fab"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? `Close ${eaChassis.assistant.name}` : `Open ${eaChassis.assistant.name}`}
      >
        Ask
      </button>
    </div>
  );
}
