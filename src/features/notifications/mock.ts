const now = Date.now();
const minutesAgo = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

/**
 * SAMPLE DATA ONLY. Rheo has no notification service or endpoint yet.
 */
export type SampleNotification = {
  id: string;
  title: string;
  created_at: string;
  unread: boolean;
};

export const sampleNotifications: SampleNotification[] = [
  {
    id: "n-1",
    title: "Firewall rule for db-reporting-01 failed to apply",
    created_at: minutesAgo(248),
    unread: true,
  },
  {
    id: "n-2",
    title: "Three requests are waiting for your approval",
    created_at: minutesAgo(40),
    unread: true,
  },
  {
    id: "n-3",
    title: "DNS record reports.internal is live",
    created_at: minutesAgo(94),
    unread: false,
  },
];
