'use client';

import React from 'react';
import { NotificationDropdown } from '@/components/dashboard/NotificationDropdown';
import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
    securityLevel?: string;
  };
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className='w-full h-16 p-6 flex items-center justify-between border-b border-zinc-200'>
      <div className="w-full flex items-center justify-between">
        {/* Left side - Placeholder for future elements */}
        <div className=''>
          <Input type="text" placeholder="Search..." className="w-64" />
        </div>
        {/* Right side - Notifications and User Menu */}
        <div className="flex items-center gap-4">
          <NotificationDropdown />
          <UserDropdown user={user} />
        </div>
      </div>
    </header>
  );
}
