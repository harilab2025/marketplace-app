'use client'

import { useState } from 'react'
import { Chat } from './types'
// import { chats } from './data'
import ChatUser from './chat.user'
import MenuUser from './menu.user'
import WelcomeScreen from './components/WelcomeScreen'
import Sidebar from './sidebar'
import SelectedUser from './selected.user'

export default function ChatPage() {
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
    // const [chatMessages, setChatMessages] = useState<Message[]>(messages)
    // const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isActive, setIsActive] = useState<string | null>('chats')

    // const handleSend = (messageText: string) => {
    //     if (messageText.trim()) {
    //         const newMessage: Message = {
    //             id: Date.now().toString(),
    //             text: messageText,
    //             time: new Date().toLocaleTimeString('en-US', {
    //                 hour: '2-digit',
    //                 minute: '2-digit',
    //                 hour12: true
    //             }),
    //             sent: true,
    //             delivered: true,
    //             read: false
    //         }

    //         setChatMessages([...chatMessages, newMessage])

    //         // Simulate message delivery and read status updates
    //         setTimeout(() => {
    //             setChatMessages(prev =>
    //                 prev.map(msg =>
    //                     msg.id === newMessage.id
    //                         ? { ...msg, delivered: true }
    //                         : msg
    //                 )
    //             )
    //         }, 1000)

    //         setTimeout(() => {
    //             setChatMessages(prev =>
    //                 prev.map(msg =>
    //                     msg.id === newMessage.id
    //                         ? { ...msg, read: true }
    //                         : msg
    //                 )
    //             )
    //         }, 2000)
    //     }
    // }

    return (
        <div className="flex h-screen bg-gray-100">

            {/* Left Navigation */}
            <MenuUser setIsActive={setIsActive} isActive={isActive} />

            {/* Sidebar */}
            <Sidebar
                onChatSelect={(chat: Chat) => {
                    // Pastikan chat memiliki properti yang sesuai dengan tipe Chat lokal
                    const mappedChat = {
                        ...chat,
                        hasNotification: chat.hasNotification ?? false,
                        type: chat.type // biarkan type tetap sesuai dengan tipe Chat ("group" | "private")
                    }
                    setSelectedChat(mappedChat)
                }}
                selectedChat={selectedChat}
            />

            <main className="flex-1 flex flex-col">
                {/* Selected User */}
                <SelectedUser
                    selectedChat={selectedChat}
                />
                {/* Chat Area */}
                {selectedChat ? (
                    <ChatUser />
                ) : (
                    <WelcomeScreen />
                )}
            </main>
        </div>
    )
}
