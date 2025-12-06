import Image from 'next/image'
import { Phone, Video, MoreVertical } from 'lucide-react'
import { Chat } from '../types'
import { getAvatarInitials, getRandomColor } from '../utils'

interface ChatHeaderProps {
    chat: Chat
}

export default function ChatHeader({ chat }: ChatHeaderProps) {
    return (
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center select-none">
                <div className="relative mr-3">
                    {chat.avatar && chat.avatar !== '' ? (
                        <Image
                            src={chat.avatar}
                            alt={chat.name}
                            className="w-10 h-10 rounded-full object-cover"
                            width={40}
                            height={40}
                        />
                    ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getRandomColor(chat.name)}`}>
                            {getAvatarInitials(chat.name)}
                        </div>
                    )}
                    {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-sky-500 rounded-full border-2 border-white"></div>
                    )}
                </div>
                <div>
                    <h2 className="font-semibold text-gray-900 text-sm">{chat.name}</h2>
                    <p className="text-xs text-gray-500">
                        {chat.online ? 'online' : 'last seen recently'}
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
