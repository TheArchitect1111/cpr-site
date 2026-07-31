# EA Full-Surface Editor

The editor is a reusable, manifest-driven capability for EA websites and portals.

## Registration

- Websites use `defineEditableSurface` from `lib/surface-editor/types.ts`.
- Portals use `defineEditablePortal` from `lib/surface-editor/portal.ts`.
- Each manifest declares a route, default content and named sections.
- The shared admin editor supplies text, links, images, list management, section visibility and ordering.
- Saved owner changes are isolated by surface ID in durable Blob storage.

## Safety boundary

Content and presentation sections are editable. Authentication, payments,
applications, data records and workflow actions must use `protected: true` and
remain controlled by application code.

## CPR coverage

The homepage keeps its purpose-built editor. The shared full-surface editor
covers Recruitment, Resources, Camps, Merchandise, Coach Rav Tribute and every
chapter of The Experience. Dynamic athlete profiles and protected forms keep
their dedicated editors/workflows.
