'use client'
import { useMenusidebar } from '@/context/dashboard/useMenu.sidebar';
import { useToggleSidebar } from '@/context/dashboard/useToggle.sidebar';
import { ChevronRight } from 'lucide-react';
import React from 'react';

export default function Container({
    children,
}: {
    children: React.ReactNode;
}) {
    const { selectedMenu } = useMenusidebar();
    const { toggleSidebar, setToggleSidebar } = useToggleSidebar();

    return (
        <div className='w-full h-screen z-50 p-3'>
            <div className='w-full h-full flex flex-col space-y-3 items-start bg-zinc-50 rounded-4xl shadow-2xl drop-shadow-2xl px-6 py-4'>
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
