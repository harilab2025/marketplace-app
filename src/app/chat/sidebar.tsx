'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Search, MoreVertical, MessageSquare, Bell, VolumeX, SearchIcon, CirclePlus } from 'lucide-react'
import Image from 'next/image'
import { motion } from "framer-motion";

interface Chat {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    unread: number;
    avatar: string;
    online: boolean;
    type: 'group' | 'private';
    hasNotification: boolean;
    notificationType?: 'message' | 'mention' | 'urgent';
    isMuted?: boolean;
}

interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: Date;
}

interface SidebarProps {
    onChatSelect: (chat: Chat) => void;
    selectedChat: Chat | null;
}

export default function Sidebar({ onChatSelect, selectedChat }: SidebarProps) {
    const [sidebarWidth, setSidebarWidth] = useState(420)
    const sidebarRef = useRef<HTMLDivElement>(null)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'info',
            title: 'New message from John',
            message: 'Hey, are you available for a quick call?',
            timestamp: new Date(Date.now() - 5 * 60000) // 5 minutes ago
        },
        {
            id: '2',
            type: 'warning',
            title: 'Group mention',
            message: 'You were mentioned in BIMTEK KOTA AMBON 2025',
            timestamp: new Date(Date.now() - 15 * 60000) // 15 minutes ago
        },
        {
            id: '3',
            type: 'success',
            title: 'File uploaded',
            message: 'Document.pdf has been uploaded successfully',
            timestamp: new Date(Date.now() - 30 * 60000) // 30 minutes ago
        }
    ])

    const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
        const startX = mouseDownEvent.clientX
        const startWidth = sidebarWidth

        const doDrag = (mouseMoveEvent: MouseEvent) => {
            const newWidth = startWidth + mouseMoveEvent.clientX - startX
            if (newWidth >= 300 && newWidth <= 600) {
                setSidebarWidth(newWidth)
            }
        }

        const stopDrag = () => {
            document.removeEventListener('mousemove', doDrag)
            document.removeEventListener('mouseup', stopDrag)
        }

        document.addEventListener('mousemove', doDrag)
        document.addEventListener('mouseup', stopDrag)
    }, [sidebarWidth])

    const getAvatarInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const getRandomColor = (name: string) => {
        const colors = [
            'bg-red-500', 'bg-blue-500', 'bg-sky-500', 'bg-yellow-500',
            'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
        ]
        const index = name.length % colors.length
        return colors[index]
    }

    const chats = useMemo<Chat[]>(() => [
        {
            id: '1',
            name: 'BIMTEK KOTA AMBON 2025',
            lastMessage: 'You were added',
            time: '13:20:40',
            unread: 2,
            avatar: '',
            online: false,
            type: 'group',
            hasNotification: true,
            notificationType: 'mention',
            isMuted: false
        },
        {
            id: '2',
            name: 'John Doe',
            lastMessage: 'Hey, are you there?',
            time: '12:45:30',
            unread: 1,
            avatar: '',
            online: true,
            type: 'private',
            hasNotification: true,
            notificationType: 'message',
            isMuted: false
        },
        {
            id: '3',
            name: 'Team Project',
            lastMessage: 'Meeting at 3 PM',
            time: '11:30:15',
            unread: 0,
            avatar: '',
            online: false,
            type: 'group',
            hasNotification: false,
            notificationType: undefined,
            isMuted: true
        }
    ], [])

    // Calculate total unread messages
    const totalUnread = chats.reduce((total, chat) => total + chat.unread, 0)

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission()
            return permission === 'granted'
        }
        return false
    }

    // const showBrowserNotification = (chat: Chat, message: string) => {
    //     if (Notification.permission === 'granted') {
    //         new Notification(`${chat.name}`, {
    //             body: message,
    //             icon: chat.avatar || '/default-avatar.png',
    //             badge: '/notification-badge.png',
    //             tag: chat.id, // Prevents duplicate notifications for same chat
    //             requireInteraction: false,
    //             silent: false
    //         })
    //     }
    // }

    // Request notification permission on component mount
    useEffect(() => {
        requestNotificationPermission()
    }, [])

    // Simulate receiving new messages (you would replace this with real WebSocket/API calls)
    // const simulateNewMessage = useCallback((chatId: string, message: string) => {
    //     const chat = chats.find(c => c.id === chatId)
    //     if (chat) {
    //         // Show browser notification
    //         showBrowserNotification(chat, message)

    //         // Add to in-app notifications
    //         const newNotification: Notification = {
    //             id: Date.now().toString(),
    //             type: 'info',
    //             title: `New message from ${chat.name}`,
    //             message: message,
    //             timestamp: new Date()
    //         }
    //         setNotifications(prev => [newNotification, ...prev])
    //     }
    // }, [chats])


    // Close notifications panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setShowNotifications(false)
            }
        }

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showNotifications])

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return '✅'
            case 'warning':
                return '⚠️'
            case 'error':
                return '❌'
            default:
                return '💬'
        }
    }

    const clearNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const clearAllNotifications = () => {
        setNotifications([])
    }

    return (
        <div
            ref={sidebarRef}
            className="bg-white border-r border-gray-200 flex flex-col relative"
            style={{ width: `${sidebarWidth}px` }}
        >
            <div className="px-4 pt-4 pb-1 border-b border-gray-200 relative">
                <div className="flex items-center justify-between mb-4 select-none">
                    <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
                    <div className="flex space-x-1">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                        >
                            <Bell size={20} className="text-gray-600" />
                            {(totalUnread > 0 || notifications.length > 0) && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 min-w-5 h-5 flex items-center justify-center">
                                    {Math.max(totalUnread, notifications.length) > 99 ? '99+' : Math.max(totalUnread, notifications.length)}
                                </span>
                            )}
                        </button>
                        <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <MessageSquare size={20} className="text-gray-600" />
                            <CirclePlus size={15} className="absolute top-1 right-1 text-gray-600 bg-white rounded-full" />
                        </button>
                        <button onClick={() => setShowSearch(!showSearch)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <SearchIcon size={20} className="text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <MoreVertical size={20} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Notifications Panel */}
                <motion.div
                    initial={{ opacity: 0, height: 0, visibility: 'hidden' }}
                    animate={showNotifications ? { opacity: 1, height: 'auto', visibility: 'visible' } : { opacity: 0, height: 0, visibility: 'hidden' }}
                    transition={{ duration: 0.2 }}
                    className={`absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50`}>
                    <div className={`${showNotifications ? 'border-b border-gray-200' : ''} p-3 flex justify-between items-center`}>
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {showNotifications && notifications.length > 0 && (
                            <button
                                onClick={clearAllNotifications}
                                className="text-xs text-sky-500 hover:text-sky-600 transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {showNotifications && notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No notifications
                            </div>
                        ) : (
                            showNotifications && notifications.map(notification => (
                                <div key={notification.id} className="p-3 hover:bg-gray-100 group rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start space-x-2 flex-1">
                                            <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm text-gray-900">{notification.title}</p>
                                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                                <span className="text-xs text-gray-500 mt-1 block">
                                                    {notification.timestamp.toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => clearNotification(notification.id)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all ml-2"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -10, height: 0, visibility: 'hidden' }}
                    animate={showSearch ? { opacity: 1, y: 0, height: 'auto', visibility: 'visible' } : { opacity: 0, y: -10, height: 0, visibility: 'hidden' }}
                    transition={{ duration: 0.2 }}
                    className="relative"
                >
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search or start a new chat"
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all placeholder:select-none"
                    />
                </motion.div>
            </div>

            <div className="flex-1 overflow-y-auto select-none">
                {chats.map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => onChatSelect(chat)}
                        className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors ${selectedChat?.id === chat.id ? 'bg-sky-50 border-r-4 border-sky-500' : ''
                            }`}
                    >
                        <div className="relative mr-3 flex-shrink-0">
                            {chat.avatar && chat.avatar !== '' ? (
                                <Image
                                    src={chat.avatar}
                                    alt={chat.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                    width={48}
                                    height={48}
                                />
                            ) : (
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getRandomColor(chat.name)}`}>
                                    {getAvatarInitials(chat.name)}
                                </div>
                            )}
                            {chat.online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}

                            {/* Notification indicators */}
                            {chat.hasNotification && !chat.isMuted && (
                                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${chat.notificationType === 'urgent' ? 'bg-red-500' :
                                    chat.notificationType === 'mention' ? 'bg-orange-500' :
                                        'bg-sky-500'
                                    }`}></div>
                            )}

                            {chat.isMuted && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                                    <VolumeX size={10} className="text-white" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-medium text-gray-900 truncate text-sm">{chat.name}</h3>
                                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{chat.time}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                                {chat.unread > 0 && (
                                    <span className="bg-sky-500 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center ml-2 flex-shrink-0">
                                        {chat.unread}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div
                className="absolute top-0 right-0 w-1 h-full cursor-ew-resize hover:bg-sky-500 transition-colors group"
                onMouseDown={startResizing}
            >
                <div className="w-full h-full bg-transparent group-hover:bg-sky-500 transition-colors"></div>
            </div>
        </div>
    )
}