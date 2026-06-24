export type CommunicationMessage = {
  id: string;
  subjectId: string;
  sender: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type CommunicationFeedback = {
  id: string;
  subjectId: string;
  subject: string;
  body: string;
  status: string;
  createdAt: string;
  response?: string;
};

export type CommunicationAnnouncement = {
  id: string;
  title: string;
  body: string;
  status: 'Draft' | 'Scheduled' | 'Published' | 'Archived';
  audience: string;
  channels: string[];
  recipientEmails?: string[];
  emailSentAt?: string;
  emailDeliveryStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  pinned?: boolean;
  scheduledAt?: string;
  publishedAt?: string;
};

export type CommunicationNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  sourceType: string;
  sourceId: string;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
};

export type CommunicationCenterConfig = {
  portalName: string;
  primaryColor: string;
  accentColor: string;
  supportLabel?: string;
};
