# EA Communication Center Research And Build Plan

## Objective

Build Communication Center as a reusable EA platform module that can be installed into CPR, BrotherHub, SisterHub, Pulse, Amplifi, Update Hub, Training Transformation, Simplifi, NSP, and future portals.

Communication Center should let each portal communicate, notify, engage, collect feedback, and trigger action without rebuilding the same tools repeatedly.

## Current Repository Findings

### Primary Build Target

Repository: `cpr-site`

Stack: Next.js 15, TypeScript, Tailwind-style CSS, Airtable, Resend, Stripe, Vercel

Relevant existing features:

- Portal login and admin login
- Parent and athlete portal pages
- Direct messaging with Airtable-backed message records
- Ask CPR ticket flow with Airtable-backed ticket records
- Admin message thread view
- Admin ticket management
- Read status field for messages
- Athlete activity and engagement scoring
- Resend email helper
- Resource, document, event, and content relevance modules

Recommended action: Reuse as V1 implementation base.

### Production Reference

Repository: `template-sports-recruitment`

Stack: Next.js, JavaScript, Airtable, Resend

Relevant existing features:

- CPR public site
- Application intake
- Admin lead management
- Password reset help
- Family Hub opt-in link
- Resend confirmation email
- Help links

Recommended action: Reference production behavior and keep CPR-specific language out of the reusable module.

### Platform Integration Source

Repository: `next-steps-pro/efficiency-architects`

Stack: React, Vercel API routes, Airtable, Resend, OAuth connection framework

Relevant existing features:

- Connection Center
- OAuth callback framework
- Connection provider registry
- Connection health pattern
- Amplifi content generation and publishing
- Update Hub publish workflow
- Training Hub
- Pulse command center
- Platform store concepts
- EA email helper

Recommended action: Reuse Connection Center, Amplifi, Update Hub, Pulse, and email patterns when Communication Center expands beyond the CPR V1 module.

### Hub Reference Repositories

Repositories: `BrotherHub`, `SisterHub`

Relevant existing features:

- Blueprint intake forms
- Hub module selection
- Communication tool selection
- Portal setup language

Recommended action: Reference for onboarding and portal owner setup wizard language.

## External Pattern Research

These products should be studied for patterns only. Do not clone product design, code, data model, or branding.

### Rocket.Chat

Source: https://github.com/RocketChat/Rocket.Chat

Useful patterns:

- Channels, direct messages, discussions, and threads
- File sharing
- Voice and video integrations
- Federation concept
- Role and attribute-based access control
- Apps and external integration model
- Security and compliance posture

EA adaptation:

- Use simple portal channels, role-based visibility, threaded conversations later, attachment support, and secure integration hooks.

### Mattermost

Source: https://github.com/mattermost/mattermost

Useful patterns:

- Chat plus workflow automation
- Webhooks, slash commands, apps, plugins, and API-driven integration
- Mobile and desktop parity
- Self-hosted collaboration model
- Security bulletin and admin control posture

EA adaptation:

- Use workflow-ready message events, admin controls, mobile-first communication, and integration extension points.

### Gitter

Source: https://gitlab.com/gitterHQ/webapp

Useful patterns:

- Rooms tied to a context
- Searchable message archives
- Inline media
- GitHub-style mentions and references
- Low-friction community chat

EA adaptation:

- Use context-based spaces like Athlete, Parent, Event, Training, Chapter, Client, and searchable history.

### Lemmy

Source: https://github.com/LemmyNet/lemmy

Useful patterns:

- Community discussion spaces
- Posts and threaded comments
- Moderation roles
- Sticky posts
- Lock, remove, restore, ban, and moderation logs
- Notifications for replies and mentions
- RSS and inbox concepts

EA adaptation:

- Use optional Community Discussion per portal, moderated topics, pinned posts, announcements, reply notifications, and public admin logs for governance.

## V1 Product Definition

Communication Center V1 should include:

1. Dashboard
2. Announcements
3. Messages
4. Notifications
5. Feedback Center
6. AI Draft Assistant shell
7. Communication Intelligence summary

V1 should not include:

- Full social publishing
- Complex real-time chat infrastructure
- Federation
- Voice or video calls
- Advanced moderation
- Full automation builder

Those belong in later phases.

## Proposed Data Model

### communication_announcements

- id
- portalId
- title
- body
- audience
- priority
- status
- channels
- pinned
- scheduledAt
- publishedAt
- archivedAt
- authorId
- createdAt
- updatedAt

Statuses:

- Draft
- Scheduled
- Published
- Archived

### communication_messages

- id
- portalId
- threadId
- subjectId
- subjectType
- senderId
- senderName
- senderRole
- recipientType
- recipientIds
- body
- attachments
- readBy
- priority
- createdAt

Subject types:

- athlete
- parent
- event
- training
- client
- chapter
- organization
- general

### communication_threads

- id
- portalId
- title
- subjectType
- subjectId
- participants
- lastMessageAt
- unreadCount
- status
- createdAt
- updatedAt

Statuses:

- Open
- Waiting
- Closed
- Archived

### communication_notifications

- id
- portalId
- userId
- type
- title
- body
- priority
- sourceType
- sourceId
- readAt
- actionUrl
- createdAt

Priority levels:

- Low
- Normal
- High
- Urgent

### communication_feedback

- id
- portalId
- submittedById
- submittedByName
- submittedByRole
- category
- subject
- body
- status
- assignedTo
- response
- createdAt
- updatedAt
- resolvedAt

Statuses:

- New
- Assigned
- In Review
- Responded
- Resolved
- Archived

### communication_events

- id
- portalId
- eventType
- sourceType
- sourceId
- actorId
- actorName
- label
- metadata
- createdAt

This becomes the feed into Pulse.

## Component Hierarchy

```text
CommunicationCenter
  CommunicationShell
    CommunicationSidebar
    CommunicationMobileTabs
    CommunicationDashboard
      CommunicationHealthCard
      PriorityQueue
      RecentActivity
      ChannelStatus
    AnnouncementCenter
      AnnouncementComposer
      AnnouncementList
      AnnouncementPreview
    MessageCenter
      ThreadList
      ThreadView
      MessageComposer
    NotificationCenter
      NotificationList
      NotificationPreferences
    FeedbackCenter
      FeedbackInbox
      FeedbackDetail
      FeedbackComposer
    CommunicationAssistant
      DraftPromptPanel
      GeneratedDraftPreview
    CommunicationMetrics
      EngagementCards
      ChannelPerformance
```

## User Flows

### Portal Member

1. Opens Communication Center
2. Sees unread updates, messages, and action items
3. Reads announcement or message
4. Replies, asks a question, or completes the requested action
5. Activity is logged for Pulse

### Portal Admin

1. Opens Communication Center dashboard
2. Reviews high-priority messages, unread threads, open feedback, and scheduled announcements
3. Sends announcement or replies to thread
4. Uses AI assistant to draft copy
5. Publishes to portal first, then email or SMS when connected
6. Watches communication health improve

### Portal Owner Setup

1. Opens Connection Center
2. Sees required, recommended, and advanced connections
3. Connects email
4. Connects calendar
5. Optional: connects SMS, social, file storage, payments, CRM
6. Capability Requirements Matrix updates portal health score

## Mobile Wireframe

```text
+----------------------------------+
| Communication Center             |
| Health 87%                       |
+----------------------------------+
| Today                            |
| 3 urgent items                   |
| 6 unread messages                |
| 2 feedback requests              |
+----------------------------------+
| [Announcements] [Messages]       |
| [Notifications] [Feedback]       |
+----------------------------------+
| Priority Queue                   |
| 1. Reply to parent question      |
| 2. Publish event reminder        |
| 3. Review feedback ticket        |
+----------------------------------+
| Recent Activity                  |
| Announcement published           |
| Parent message received          |
| Ticket resolved                  |
+----------------------------------+
```

## Dashboard Design

Top metrics:

- Unread messages
- Open feedback
- Scheduled announcements
- Communication health

Primary action:

- Create update

Secondary actions:

- Draft with AI
- Send message
- Review feedback
- Check connections

Communication Health Score should consider:

- Open feedback age
- Unread message age
- Announcement cadence
- Delivery channel coverage
- Response rate
- Connection health

## Integration Plan

### V1

- Airtable storage using existing CPR patterns
- Resend email helper reuse
- Portal and admin UI
- Pulse-ready event log
- Connection Center status read-only placeholder

### V2

- Connect to EA Connection Center
- Publish announcements to email
- Add SMS through Twilio
- Add notification preferences
- Add approval workflow for announcements

### V3

- Amplifi integration for social publishing
- Update Hub one-update publish flow
- Universal search
- Portal Copilot queries
- Automation Builder triggers

### V4

- Advanced community discussion
- Moderation logs
- Channel analytics
- Cross-portal communication intelligence
- Full Capability Requirements Matrix

## Recommended Build Path

1. Normalize CPR messages and tickets into reusable Communication Center types.
2. Add `components/communication-center` with shared UI.
3. Add `/admin/communication` or `?tab=communication` entry.
4. Add portal-facing Communication Center entry point.
5. Add Airtable table adapter that supports sample data fallback.
6. Add event logging for Pulse.
7. Add email notification hooks through existing Resend helper.
8. Add Connection Center status cards as placeholders until EA Connection Center is wired into CPR.

## Build Recommendation

Start with CPR as the proof-of-concept because it already has the strongest working communication foundation.

Then extract the module into a reusable EA package pattern once V1 is proven.

## V1 Implementation Status

Completed in the CPR Next app:

- Admin Communication Center tab
- Reusable Communication Center component
- Announcement create form
- Save draft
- Schedule announcement
- Publish announcement
- Archive announcement
- Portal and email channel selection
- Resend delivery for published email announcements
- Notification record creation
- Communication event logging
- Communication health metrics
- Message and feedback rollups from existing CPR data

## Airtable Tables Required For Live V1

### Communication Announcements

Fields:

- Title
- Body
- Audience
- Channels
- Recipient Emails
- Pinned
- Status
- Scheduled At
- Published At
- Archived At
- Email Sent At
- Email Delivery Status
- Created At
- Updated At

### Communication Notifications

Fields:

- Type
- Title
- Body
- Priority
- Source Type
- Source ID
- Action URL
- Read At
- Created At

### Communication Events

Fields:

- Event Type
- Source Type
- Source ID
- Actor Name
- Label
- Metadata
- Created At

Environment overrides are supported:

- `AIRTABLE_COMMUNICATION_ANNOUNCEMENTS_TABLE`
- `AIRTABLE_COMMUNICATION_NOTIFICATIONS_TABLE`
- `AIRTABLE_COMMUNICATION_EVENTS_TABLE`

Email delivery uses the existing Resend settings:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
