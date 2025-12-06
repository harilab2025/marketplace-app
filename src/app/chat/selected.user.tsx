'use client'

import { MoreVertical, Phone, Video } from 'lucide-react'
import Image from 'next/image'
import { Chat } from './types'

interface Props {
    selectedChat?: Chat | null
}

export default function SelectedUser({ selectedChat }: Props) {
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

    if (!selectedChat) return null

    return (
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
    )
}
