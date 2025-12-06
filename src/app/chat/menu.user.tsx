'use client'

import { MessageSquare, Phone as PhoneIcon, Archive, Settings, User, MenuIcon } from 'lucide-react'
import { useState } from 'react'
import { motion } from "framer-motion";

const menuItems = ({ setActiveMenu, setIsActive }: { setActiveMenu: React.Dispatch<React.SetStateAction<string | null>>, setIsActive: React.Dispatch<React.SetStateAction<string | null>> }) => [
    {
        icon: <MessageSquare size={18} />,
        label: 'Chats',
        onClick: () => { setActiveMenu('chats'); setIsActive('chats') }
    },
    {
        icon: <PhoneIcon size={18} />,
        label: 'Calls',
        onClick: () => { setActiveMenu('calls'); setIsActive('calls') }
    },
    {
        icon: <Archive size={18} />,
        label: 'Archived',
        onClick: () => { setActiveMenu('archived'); setIsActive('archived') }
    },
    {
        icon: <Settings size={18} />,
        label: 'Settings',
        onClick: () => { setActiveMenu('settings'); setIsActive('settings') }
    },
    {
        icon: <User size={18} />,
        label: 'Profile',
        onClick: () => { setActiveMenu('profile'); setIsActive('profile') }
    }
]

export default function MenuUser({ setIsActive, isActive }: { setIsActive: React.Dispatch<React.SetStateAction<string | null>>, isActive: string | null }) {
    const [activeMenu, setActiveMenu] = useState<string | null>(isActive);
    const [toggleSidebar, setToggleSidebar] = useState<boolean>(false);

    return (
        <div className={`${toggleSidebar ? 'w-64' : 'w-16'} px-3 bg-gray-800 flex flex-col py-4 transition-all duration-300 ease-in-out`}>
            <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-semibold mb-2 cursor-pointer">
                <MessageSquare size={18} />
            </div>

            <div className="space-y-1">
                <button onClick={() => setToggleSidebar(!toggleSidebar)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                    <MenuIcon size={18} />
                </button>
                {menuItems({ setActiveMenu, setIsActive }).map(item => (
                    <div key={item.label}>
                        {item.label.toLowerCase() === 'settings' &&
                            <div className='border-gray-100/10 border-t-[0.1px] w-full mt-10 mb-5'>
                            </div>
                        }
                        <button
                            onClick={item.onClick}
                            className={`${toggleSidebar ? 'w-full' : 'w-10'} h-10 flex items-center space-x-3 px-[10px] text-gray-400 hover:text-white hover:bg-gray-700 transition-color duration-200 ease-in-out ${activeMenu === item.label.toLowerCase() ? 'bg-gray-700 text-white' : ''} group`}
                        >
                            <motion.span
                                initial={{ opacity: 1 }}
                                animate={toggleSidebar ? { opacity: 1 } : { opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="transition-transform duration-200 group-hover:scale-110"
                            >
                                {item.icon}
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={toggleSidebar ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="text-sm select-none"
                            >
                                {item.label}
                            </motion.span>
                        </button>

                    </div>
                ))}
            </div>
        </div>
    )
}
