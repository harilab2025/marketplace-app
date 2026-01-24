import React from 'react';
import {
  LucideIcon,
  Monitor,
  Smartphone,
  Activity,
  Shield,
  Bell,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  variant?: 'default' | 'minimal';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  variant = 'default',
}: EmptyStateProps) {
  if (variant === 'minimal') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-gray-100 rounded-full p-4 mb-4">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-md">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} size="sm">
            {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-linear-to-br from-gray-100 to-gray-200 rounded-full p-6 mb-4">
          <Icon className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6 max-w-md">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="flex items-center gap-2">
            {ActionIcon && <ActionIcon className="h-4 w-4" />}
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Predefined empty states for common scenarios
export function NoSessionsEmptyState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <EmptyState
      icon={Monitor}
      title="No Active Sessions"
      description="You don't have any active sessions. Your current session is the only one."
      actionLabel={onRefresh ? "Refresh" : undefined}
      onAction={onRefresh}
      actionIcon={onRefresh ? RefreshCw : undefined}
      variant="minimal"
    />
  );
}

export function NoDevicesEmptyState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <EmptyState
      icon={Smartphone}
      title="No Trusted Devices"
      description="You haven't added any trusted devices yet. Devices will appear here when you trust them during login."
      actionLabel={onRefresh ? "Refresh" : undefined}
      onAction={onRefresh}
      actionIcon={onRefresh ? RefreshCw : undefined}
      variant="minimal"
    />
  );
}

export function NoActivityEmptyState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <EmptyState
      icon={Activity}
      title="No Recent Activity"
      description="No security activity has been recorded recently. Your account activity will appear here."
      actionLabel={onRefresh ? "Refresh" : undefined}
      onAction={onRefresh}
      actionIcon={onRefresh ? RefreshCw : undefined}
      variant="minimal"
    />
  );
}

export function NoIncidentsEmptyState() {
  return (
    <EmptyState
      icon={Shield}
      title="No Security Incidents"
      description="Great news! There are no security incidents to report. Your system is secure."
      variant="minimal"
    />
  );
}

export function NoNotificationsEmptyState() {
  return (
    <EmptyState
      icon={Bell}
      title="No Notifications"
      description="You're all caught up! No new notifications at this time."
      variant="minimal"
    />
  );
}
