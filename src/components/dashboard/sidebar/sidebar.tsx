'use client'
import { menuDashboard } from '@/constants/menu/menu.dashboard';
import { useToggleSidebar } from '@/context/dashboard/useToggle.sidebar';
import { ChevronRight } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
    const data = menuDashboard;
    const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
    const [activeLink, setActiveLink] = useState('');
    const { toggleSidebar } = useToggleSidebar();
    const pathname = usePathname();
    const router = useRouter();
    const isNavigatingRef = useRef(false);
    const toggleSection = (index: number) => {

        // Cek apakah ada item aktif di section ini
        const hasActiveItem = data[index].list.some(item => item.btn_link === activeLink);
        // Jika ada item aktif, jangan biarkan collapse
        if (hasActiveItem && expandedSections[index]) {
            return;
        }

        setExpandedSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleLinkClick = (link: string) => {
        // Prevent multiple rapid clicks and navigation
        if (activeLink === link || isNavigatingRef.current) return;

        isNavigatingRef.current = true;
        setActiveLink(link);

        // Use router.push with error handling and prevent multiple calls
        try {
            router.push(link);
        } catch (error) {
            console.error('Navigation error:', error);
        } finally {
            // Reset navigation flag after a short delay
            setTimeout(() => {
                isNavigatingRef.current = false;
            }, 100);
        }

        // Auto expand section yang mengandung link aktif
        data.forEach((section, index) => {
            const hasActiveItem = section.list.some(item => item.btn_link === link);
            if (hasActiveItem) {
                setExpandedSections(prev => ({
                    ...prev,
                    [index]: true
                }));
            }
        });
    };

    useEffect(() => {
        setActiveLink(pathname);
        data.forEach((section, index) => {
            const hasActiveItem = section.list.some(item => item.btn_link === pathname);
            if (hasActiveItem) {
                setExpandedSections(prev => ({
                    ...prev,
                    [index]: true
                }));
            }
        });
    }, [data, pathname]);

    // Cleanup navigation flag on unmount
    useEffect(() => {
        return () => {
            isNavigatingRef.current = false;
        };
    }, []);


    return (
        <div className={`${toggleSidebar ? 'w-64 min-w-64' : 'w-[3.3rem] min-w-[3.3rem]'} h-screen z-50 py-3 ml-3 transition-all duration-300 ease-in-out text-sm`}>
            <div className='w-full h-full flex flex-col space-y-3 items-start bg-zinc-50 rounded-4xl shadow-2xl drop-shadow-2xl'>
                <header className='bg-zinc-300 rounded-t-4xl w-full py-2 flex justify-center'>LOGO</header>
                <section className={`w-full ${toggleSidebar ? 'px-2' : ''}`}>
                    {data.map((section, index) => (
                        <div key={index} className="mb-2 w-full">
                            {/* Section Header */}
                            <button
                                type='button'
                                onClick={() => { toggleSection(index) }} className={`w-full flex items-center justify-between px-4 py-3 text-left ${(data[index].list.some(item => item.btn_link === activeLink)) ? 'bg-zinc-100 text-zinc-400 font-medium' : 'hover:bg-zinc-100 transition-all duration-200 ease-in-out cursor-pointer space-x-2 text-zinc-600'}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={toggleSidebar ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="transition-transform duration-200 ease-in-out hover:scale-110"
                                    >
                                        {section.btn_icon}
                                    </motion.span>
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={toggleSidebar ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className=""
                                    >
                                        {section.btn_title}
                                    </motion.span>
                                </div>
                                {(data[index].list.some(item => item.btn_link === activeLink)) ? '' : <span className={`text-zinc-400 transition-all duration-300 ease-in-out ${expandedSections[index] ? 'transform rotate-90' : 'transform rotate-0'
                                    }`}>
                                    <ChevronRight size={16} className="transition-all duration-300 ease-in-out" />
                                </span>}
                            </button>

                            {/* Expandable List */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSections[index]
                                ? 'max-h-96 opacity-100'
                                : (toggleSidebar ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100')
                                }`}>
                                <div className={`${toggleSidebar ? expandedSections[index]
                                    ? 'translate-y-0 scale-y-100 pl-4 pr-5'
                                    : '-translate-y-2 scale-y-95 pl-4 pr-5' : ''} transform transition-all duration-300 ease-in-out`}>
                                    {section.list.map((item, itemIndex) => (
                                        <button
                                            key={itemIndex}
                                            type='button'
                                            onClick={() => handleLinkClick(item.btn_link)}
                                            className={`w-full flex items-center space-x-3 ${toggleSidebar ? 'px-4 text-left rounded-lg transition-all duration-200 ease-in-out transform hover:translate-x-2' : 'px-4'} ${activeLink === item.btn_link
                                                ? 'text-zinc-800 font-bold bg-zinc-200 px-4'
                                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800'} py-2 cursor-pointer`}
                                            style={{
                                                transitionDelay: expandedSections[index] ? `${itemIndex * 50}ms` : '0ms'
                                            }}
                                        >
                                            <span className="text-current transition-transform duration-200 ease-in-out">
                                                {toggleSidebar ? item.btn_icon : (<Tooltip>
                                                    <TooltipTrigger asChild>
                                                        {item.btn_icon}
                                                    </TooltipTrigger>
                                                    <TooltipContent side='right'>
                                                        <p>{item.btn_title}</p>
                                                    </TooltipContent>
                                                </Tooltip>)}
                                            </span>
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={toggleSidebar ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="text-sm"
                                            >
                                                {item.btn_title}
                                            </motion.span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    )
}
