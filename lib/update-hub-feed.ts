import type { ContentRequestRecord } from '@/lib/content-requests';

export type UpdateHubFeedItem = {
  id: string;
  date: string;
  title: string;
  body: string;
  requestType: string;
  status: string;
};

const PUBLISHED_STATUSES = new Set(['Published', 'Completed']);
const PENDING_CLIENT_STATUSES = new Set([
  'Pending Review',
  'In Progress',
  'Awaiting Approval',
  'Needs Additional Information',
]);
const ADMIN_QUEUE_STATUSES = new Set([
  'Pending Review',
  'In Progress',
  'Awaiting Approval',
  'Scheduled',
]);

export function isPublishedStatus(status: string): boolean {
  return PUBLISHED_STATUSES.has(status);
}

export function isPendingClientStatus(status: string): boolean {
  return PENDING_CLIENT_STATUSES.has(status);
}

export function isAdminQueueStatus(status: string): boolean {
  return ADMIN_QUEUE_STATUSES.has(status);
}

export function getPublishedFeedItems(requests: ContentRequestRecord[]): UpdateHubFeedItem[] {
  return requests
    .filter((r) => isPublishedStatus(r.status))
    .map((r) => ({
      id: r.id,
      date: r.datePublished ?? r.dateSubmitted ?? '',
      title: r.title,
      body: r.publishedContent ?? r.description ?? '',
      requestType: r.requestType,
      status: r.status,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPendingRequests(requests: ContentRequestRecord[]): ContentRequestRecord[] {
  return requests.filter((r) => isPendingClientStatus(r.status));
}

export function getQueueRequests(requests: ContentRequestRecord[]): ContentRequestRecord[] {
  return requests.filter((r) => isAdminQueueStatus(r.status));
}
