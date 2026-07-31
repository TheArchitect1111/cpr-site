import { defineEditableSurface, type EditableSurfaceManifest, type EditableSurfaceSection } from './types';

export type PortalEditorRegistration<T extends Record<string, unknown>> = {
  id: string;
  label: string;
  route: string;
  description: string;
  defaults: T;
  sections: EditableSurfaceSection[];
};

/**
 * Opt-in contract for future EA portals. Content sections may be edited,
 * reordered and hidden. Authentication, payments, records and workflow
 * controls must be registered with `protected: true`.
 */
export function defineEditablePortal<T extends Record<string, unknown>>(
  registration: PortalEditorRegistration<T>,
): EditableSurfaceManifest<T> {
  return defineEditableSurface({ ...registration, kind: 'portal' });
}
