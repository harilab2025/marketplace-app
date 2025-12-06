// app/page.tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { Search, MoreVertical, Phone, Video, Smile, Paperclip, Mic, Send, MessageSquare, Users, Phone as PhoneIcon, Archive, Settings, User } from 'lucide-react'
import Image from 'next/image'

interface Chat {
    id: string
    name: string
    lastMessage: string
    time: string
    unread: number
    avatar: string
    online: boolean
    type: 'personal' | 'group'
}

interface Message {
    id: string
    text: string
    time: string
    sent: boolean
    delivered: boolean
    read: boolean
}

const chats: Chat[] = [
    {
        id: '1',
        name: 'BIMTEK KOTA AMBON 2025',
        lastMessage: 'You were added',
        time: '13:20:40',
        unread: 0,
        avatar: '',
        online: false,
        type: 'group'
    },
    {
        id: '2',
        name: 'Up simojang',
        lastMessage: 'You were added',
        time: '13:20:40',
        unread: 0,
        avatar: '',
        online: false,
        type: 'group'
    },
    {
        id: '3',
        name: 'Sistem Akses Joss SisKaJos',
        lastMessage: 'You were added',
        time: '13:20:40',
        unread: 0,
        avatar: '/api/placeholder/40/40',
        online: false,
        type: 'group'
    },
    {
        id: '4',
        name: 'Divisi Sosial Anthurium',
        lastMessage: 'You were added',
        time: '13:20:40',
        unread: 0,
        avatar: '/api/placeholder/40/40',
        online: false,
        type: 'group'
    },
    {
        id: '5',
        name: 'KALTENG - RAKOR DAN BIMTEK',
        lastMessage: 'You were added',
        time: '13:20:40',
        unread: 0,
        avatar: '',
        online: false,
        type: 'group'
    },
    {
        id: '6',
        name: 'Ortu Siswa Kelas 1C',
        lastMessage: 'You were added',
        time: '13:20:40',
        unread: 0,
        avatar: '/api/placeholder/40/40',
        online: false,
        type: 'group'
    },
    {
        id: '7',
        name: 'RKM MASJID BAITUSSALAM',
        lastMessage: 'You were added',
        time: '13:20:40',
        unread: 0,
        avatar: '/api/placeholder/40/40',
        online: false,
        type: 'group'
    },
    {
        id: '8',
        name: 'Sub Pokja RB Tematik Persetuju...',
        lastMessage: 'You were added',
        time: '13:20:40',
        unread: 0,
        avatar: '',
        online: false,
        type: 'group'
    },
    {
        id: '9',
        name: 'Bimtek Mahakam Ulu di Sama...',
        lastMessage: 'You were added',
        time: '13:20:40',
        unread: 0,
        avatar: '/api/placeholder/40/40',
        online: false,
        type: 'group'
    },
    {
        id: '10',
        name: 'Palapa Dev',
        lastMessage: 'You were added',
        time: '13:20:40',
        unread: 0,
        avatar: '',
        online: false,
        type: 'group'
    },
    {
        id: '11',
        name: 'Migrasi Inageoportal',
        lastMessage: 'You were added',
        time: '13:20:40',
        unread: 0,
        avatar: '',
        online: false,
        type: 'group'
    },
    {
        id: '12',
        name: 'Direktorat Kelembagaan dan J...',
        lastMessage: 'You were added',
        time: '13:20:40',
        unread: 0,
        avatar: '/api/placeholder/40/40',
        online: false,
        type: 'group'
    }
]

const messages: Message[] = [
    {
        id: '1',
        text: 'Hey! How are you doing?',
        time: '10:25',
        sent: false,
        delivered: true,
        read: true
    },
    {
        id: '2',
        text: 'I\'m doing great, thanks! How about you?',
        time: '10:26',
        sent: true,
        delivered: true,
        read: true
    },
    {
        id: '3',
        text: 'Same here! Are we still on for the meeting today?',
        time: '10:27',
        sent: false,
        delivered: true,
        read: true
    },
    {
        id: '4',
        text: 'Yes, absolutely! See you at 3 PM in the conference room.',
        time: '10:28',
        sent: true,
        delivered: true,
        read: false
    },
    {
        id: '5',
        text: 'Perfect! I\'ll bring the presentation slides.',
        time: '10:30',
        sent: false,
        delivered: true,
        read: false
    }
]

export default function WhatsAppClone() {
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
    const [messageText, setMessageText] = useState('')
    const [chatMessages, setChatMessages] = useState<Message[]>(messages)
    const [sidebarWidth, setSidebarWidth] = useState(420)
    const sidebarRef = useRef<HTMLDivElement>(null)

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

    const sendMessage = () => {
        if (messageText.trim()) {
            const newMessage: Message = {
                id: Date.now().toString(),
                text: messageText,
                time: new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }),
                sent: true,
                delivered: false,
                read: false
            }
            setChatMessages([...chatMessages, newMessage])
            setMessageText('')

            // Simulate message delivery after 1 second
            setTimeout(() => {
                setChatMessages(prev =>
                    prev.map(msg =>
                        msg.id === newMessage.id
                            ? { ...msg, delivered: true }
                            : msg
                    )
                )
            }, 1000)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

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

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Left Navigation Panel */}
            <div className="w-16 bg-gray-800 flex flex-col items-center py-4">
                <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-semibold mb-6 cursor-pointer">
                    <MessageSquare size={20} />
                </div>

                <div className="space-y-4">
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                        <MessageSquare size={20} />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                        <Users size={20} />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                        <PhoneIcon size={20} />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                        <Archive size={20} />
                    </button>
                </div>

                <div className="mt-auto space-y-4">
                    <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                        <Settings size={20} />
                    </button>
                    <button className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs">
                        <User size={16} />
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className="bg-white border-r border-gray-200 flex flex-col relative"
                style={{ width: `${sidebarWidth}px` }}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4 select-none">
                        <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
                        <div className="flex space-x-1">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <MessageSquare size={20} className="text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <MoreVertical size={20} className="text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search or start a new chat"
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all placeholder:select-none"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto select-none">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
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
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-sky-500 rounded-full border-2 border-white"></div>
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

                {/* Resize Handle */}
                <div
                    className="absolute top-0 right-0 w-1 h-full cursor-ew-resize hover:bg-sky-500 transition-colors group"
                    onMouseDown={startResizing}
                >
                    <div className="w-full h-full bg-transparent group-hover:bg-sky-500 transition-colors"></div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center select-none">
                                <div className="relative mr-3">
                                    {selectedChat.avatar && selectedChat.avatar !== '' ? (
                                        <Image
                                            src={selectedChat.avatar}
                                            alt={selectedChat.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                            width={40}
                                            height={40}
                                        />
                                    ) : (
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getRandomColor(selectedChat.name)}`}>
                                            {getAvatarInitials(selectedChat.name)}
                                        </div>
                                    )}
                                    {selectedChat.online && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-sky-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900 text-sm">{selectedChat.name}</h2>
                                    <p className="text-xs text-gray-500">
                                        {selectedChat.online ? 'online' : 'last seen recently'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <Phone size={20} className="text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <Video size={20} className="text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <MoreVertical size={20} className="text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-sky-50 to-sky-100 chat-bg">
                            <div className="space-y-4">
                                {chatMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sent
                                                ? 'bg-sky-500 text-white rounded-br-sm'
                                                : 'bg-white text-gray-900 rounded-bl-sm'
                                                } shadow-sm`}
                                        >
                                            <p
                                                className="text-sm select-text selection:bg-sky-500 selection:text-white"
                                                onKeyDown={(e) => {
                                                    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >{message.text}</p>
                                            <div className="flex items-center justify-end mt-1 space-x-1 select-none">
                                                <span className={`text-xs ${message.sent ? 'text-sky-100' : 'text-gray-500'}`}>
                                                    {message.time}
                                                </span>
                                                {message.sent && (
                                                    <div className="flex">
                                                        <svg
                                                            className={`w-4 h-4 ${message.read
                                                                ? 'text-green-300 stroke-1 stroke-green-300'
                                                                : message.delivered
                                                                    ? 'text-sky-100'
                                                                    : 'text-sky-300'
                                                                }`}
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        {message.delivered && (
                                                            <svg
                                                                className={`w-4 h-4 -ml-2 ${message.read ? 'text-green-300 stroke-1 stroke-green-300' : 'text-sky-100'
                                                                    }`}
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="bg-gray-50 p-4 border-t border-gray-200">
                            <div className="flex items-center space-x-2">
                                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <Smile size={20} className="text-gray-600" />
                                </button>
                                <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <Paperclip size={20} className="text-gray-600" />
                                </button>

                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Type a message"
                                        className="w-full px-4 py-2 pr-12 rounded-full bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:select-none"
                                    />
                                </div>

                                {messageText.trim() ? (
                                    <button
                                        onClick={sendMessage}
                                        className="p-2 bg-sky-500 hover:bg-sky-600 rounded-full text-white transition-colors"
                                    >
                                        <Send size={20} />
                                    </button>
                                ) : (
                                    <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                        <Mic size={20} className="text-gray-600" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center px-8">
                        <div className="w-80 h-80 mb-8 opacity-10">
                            <svg viewBox="0 0 303 172" className="w-full h-full">
                                <defs>
                                    <linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#f0f0f0" />
                                        <stop offset="100%" stopColor="#e0e0e0" />
                                    </linearGradient>
                                </defs>
                                <path fill="url(#a)" d="M229.2 142.4c1.6-9.6 6.8-17.9 15.4-23.2 15.4-9.5 35.1-5.2 43.9 9.6 4.4 7.4 5.3 16.4 2.5 24.6-2.8 8.2-8.9 15.2-17.1 19.6-16.3 8.8-37 4.2-46.2-10.3-4.6-7.2-5.6-16-3.7-24.2l5.2 3.9z" />
                                <circle cx="150" cy="86" r="80" fill="#f0f0f0" opacity="0.3" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-light text-gray-500 mb-2">WhatsApp for Windows</h2>
                        <p className="text-gray-400 max-w-md mb-2">
                            Send and receive messages without keeping your phone online.
                        </p>
                        <p className="text-gray-400 max-w-md text-sm">
                            Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
                        </p>

                        <div className="mt-16 flex items-center text-xs text-gray-400">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            End-to-end encrypted
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}