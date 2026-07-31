export type EditableSurfaceKind = 'website' | 'portal';

export type EditableSurfaceSection = {
  id: string;
  label: string;
  description: string;
  /** Dot path into the surface content object. */
  contentPath: string;
  /** Locked sections remain visible but cannot be changed by an owner. */
  protected?: boolean;
};

export type EditableSurfaceManifest<T extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  label: string;
  route: string;
  kind: EditableSurfaceKind;
  description: string;
  sections: EditableSurfaceSection[];
  defaults: T;
};

export type EditableSectionState = {
  id: string;
  visible: boolean;
  order: number;
};

export type EditableSurfaceDocument<T extends Record<string, unknown> = Record<string, unknown>> = {
  surfaceId: string;
  content: T;
  sections: EditableSectionState[];
  updatedAt: string;
};

export function defineEditableSurface<T extends Record<string, unknown>>(
  manifest: EditableSurfaceManifest<T>,
): EditableSurfaceManifest<T> {
  return manifest;
}
