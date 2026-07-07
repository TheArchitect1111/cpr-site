'use client';

import { useEffect, useMemo, useState } from 'react';

type AdminCommand = {
  id: string;
  label: string;
  detail: string;
  group: string;
  href: string;
  risk?: 'safe' | 'confirm';
  requiredRole?: string;
};

type Props = {
  permissions: string[];
};

const ADMIN_COMMAND_PALETTE_EVENT = 'ea:admin-command-palette';

const adminCommands: AdminCommand[] = [
  { id: 'attention', label: 'Open Attention', detail: 'Review the highest-priority owner decisions.', group: 'Today', href: '/admin' },
  { id: 'registrants', label: 'Review Registrants', detail: 'Decide who should move forward next.', group: 'People', href: '/admin?tab=registrants' },
  { id: 'send-message', label: 'Send Announcement', detail: 'Open the communication center.', group: 'Communications', href: '/admin?tab=communication' },
  { id: 'tickets', label: 'Review Tickets', detail: 'Resolve support items that need ownership.', group: 'People', href: '/admin?tab=tickets' },
  { id: 'outreach', label: 'Review Outreach', detail: 'Advance the warmest recruiting relationship.', group: 'Growth', href: '/admin?tab=outreach' },
  { id: 'publish-update', label: 'Post Update', detail: 'Review the next public or portal update.', group: 'Build', href: '/admin/update-portal' },
  { id: 'create-client', label: 'Create Client', detail: 'Create a client only when enrollment is ready.', group: 'Operations', href: '/admin/create-client', risk: 'confirm', requiredRole: 'owner' },
  { id: 'create-event', label: 'Review Events', detail: 'Make sure the next event has a clear action.', group: 'Build', href: '/admin?tab=site-events' },
  { id: 'team', label: 'Review Team Access', detail: 'Confirm owner and staff permissions.', group: 'Platform', href: '/admin?tab=team', risk: 'confirm', requiredRole: 'owner' },
  { id: 'settings', label: 'Account Settings', detail: 'Review credential readiness.', group: 'Platform', href: '/admin/account' },
];

const quickActionIds = ['registrants', 'publish-update', 'send-message', 'create-event'];

function quickActionLabel(command: AdminCommand) {
  if (command.id === 'publish-update') return 'Post Update';
  if (command.id === 'send-message') return 'Send Announcement';
  return command.label;
}

function findAdminCommand(id: string) {
  return adminCommands.find((command) => command.id === id);
}

function riskLabel(risk?: AdminCommand['risk']) {
  return risk === 'confirm' ? 'Confirm' : 'Ready';
}

function canRunCommand(command: AdminCommand, permissions: string[]) {
  if (!command.requiredRole) return true;
  return permissions.includes(command.requiredRole);
}

function commandRequiresConfirmation(command: AdminCommand) {
  return command.risk === 'confirm';
}

export default function AdminCommandPalette({ permissions }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pendingCommand, setPendingCommand] = useState<AdminCommand | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      } else if (event.key === '/' && !isTyping) {
        event.preventDefault();
        setOpen(true);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    function onOpen(event: Event) {
      const detail = (event as CustomEvent<{ query?: string }>).detail;
      setQuery(detail?.query ?? '');
      setOpen(true);
    }
    window.addEventListener(ADMIN_COMMAND_PALETTE_EVENT, onOpen);
    return () => window.removeEventListener(ADMIN_COMMAND_PALETTE_EVENT, onOpen);
  }, []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const ownerVisibleCommands = adminCommands.filter((command) => command.href && command.group !== 'Developer');
    if (!needle) return ownerVisibleCommands;
    return ownerVisibleCommands.filter((command) =>
      `${command.label} ${command.detail} ${command.group}`.toLowerCase().includes(needle),
    );
  }, [query]);

  const quickActions = useMemo(
    () => quickActionIds.map((id) => findAdminCommand(id)).filter(Boolean) as AdminCommand[],
    [],
  );

  function executeCommand(command: AdminCommand) {
    setPendingCommand(null);
    setOpen(false);
    if (command.href) window.location.assign(command.href);
  }

  function runCommand(command: AdminCommand) {
    if (!canRunCommand(command, permissions)) {
      setOpen(true);
      return;
    }

    if (commandRequiresConfirmation(command)) {
      setOpen(true);
      setPendingCommand(command);
      return;
    }

    executeCommand(command);
  }

  return (
    <>
      <div className="ea-topbar">
        <details className="ea-mobile-workspaces">
          <summary>Workspaces</summary>
          <nav aria-label="Mobile owner workspaces">
            <a href="/admin">Attention</a>
            <a href="/admin?tab=registrants">People</a>
            <a href="/admin?tab=outreach">Opportunity</a>
            <a href="/admin/update-portal">Creation</a>
            <a href="/admin?tab=activity">Health</a>
            <a href="/admin?tab=team">Platform</a>
          </nav>
        </details>
        <button className="ea-search" type="button" onClick={() => setOpen(true)}>
          <span>Find</span>
          <strong>Find priority items, people, schools, messages, payments...</strong>
          <kbd>Ctrl K</kbd>
        </button>
        <div className="ea-quick-actions">
          {quickActions.map((command) => (
            <button key={command.id} type="button" onClick={() => runCommand(command)}>
              {quickActionLabel(command)}
            </button>
          ))}
        </div>
        <a className="admin-logout" href="/api/admin/logout">Sign Out</a>
      </div>

      {open && (
        <div className="ea-command-overlay" role="dialog" aria-modal="true" aria-label="Command palette">
          <div className="ea-command-panel">
            <div className="ea-command-input-row">
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find a priority item, person, page, or action..."
              />
              <button type="button" onClick={() => setOpen(false)}>Close</button>
            </div>
            <div className="ea-command-list">
              {pendingCommand ? (
                <section className="ea-command-confirm" aria-label="Confirm command action">
                  <span>{riskLabel(pendingCommand.risk)}</span>
                  <strong>Confirm {pendingCommand.label}</strong>
                  <small>{pendingCommand.detail}</small>
                  <div>
                    <button type="button" onClick={() => executeCommand(pendingCommand)}>Confirm</button>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingCommand(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </section>
              ) : null}
              {results.map((command) => (
                <button type="button" key={command.id} onClick={() => runCommand(command)}>
                  <span>{command.group}</span>
                  <strong>{command.label}</strong>
                  <small>{command.detail}</small>
                  <em className={`ea-command-risk risk-${command.risk ?? 'safe'}`}>{riskLabel(command.risk)}</em>
                </button>
              ))}
              {results.length === 0 && <div className="ea-command-empty">No action needed right now. Recommended next step: return to Attention or try a people, communication, or creation action.</div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
