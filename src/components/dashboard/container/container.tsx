'use client';
import { useMenusidebar } from '@/contexts/dashboard/useMenu.sidebar';
import { useToggleSidebar } from '@/contexts/dashboard/useToggle.sidebar';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import Header from '../header/header';
import { userData } from '@/lib/auth.user';
import { redirect } from 'next/navigation';

export default function Container({
    children, user
}: {
    children: React.ReactNode;
    user: Awaited<ReturnType<typeof userData>>;
}) {
    const { selectedMenu } = useMenusidebar();
    const { toggleSidebar, setToggleSidebar } = useToggleSidebar();
    if (!user) {
        redirect('/');
    }
    return (
        <div className='w-full h-screen z-50 flex flex-col'>
            <Header user={{
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                securityLevel: user.securityLevel,
            }} />
            <div className='w-full h-full flex flex-col space-y-3 items-start px-6 py-4 overflow-auto'>
                <div className='flex space-x-3 items-center'>
                    <span className={`cursor-pointer hover:scale-125 transition-transform ease-in-out duration-300 ${toggleSidebar ? 'transform rotate-180' : 'transform rotate-0'
                        }`} onClick={() => setToggleSidebar(!toggleSidebar)}>
                        <ChevronRight size={16} className="transition-all duration-300 ease-in-out w-7 h-7" />
                    </span>
                    <div className='font-bold tracking-wide'>{selectedMenu.btn_title}</div>
                </div>
                <div className='w-full h-full overflow-y-auto'>
                    {children}
                </div>
            </div>
        </div>
    )
}
