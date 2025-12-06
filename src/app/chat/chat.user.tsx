'use client'

import { useCallback, useRef, useState, useEffect } from 'react';
import { Smile, Paperclip, Mic, Send, MoreVertical, Trash2, Edit, Forward, Reply, CheckSquare, Share, X } from 'lucide-react';

interface Message {
    id: string
    text: string
    time: string
    sent: boolean
    delivered: boolean
    read: boolean
    isEditing?: boolean
    originalText?: string
}

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
        text: "I'm doing great, thanks! How about you?",
        time: '10:26',
        sent: true,
        delivered: true,
        read: true
    },
]

const emojis = [
    '😀', '😂', '😍', '😎', '😊', '😢', '😡', '😱', '😴', '😋',
    '👍', '👎', '👌', '✌️', '🤝', '👏', '🙏', '💪', '👋', '🤷‍♂️',
    '❤️', '💔', '💯', '🔥', '⭐', '🎉', '🎊', '🌟', '💎', '🎈'
];

export default function ChatUser() {
    const [messageText, setMessageText] = useState('')
    const [chatMessages, setChatMessages] = useState<Message[]>(messages)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [contextMenu, setContextMenu] = useState<{ messageId: string, x: number, y: number } | null>(null)
    const [selectedMessages, setSelectedMessages] = useState<string[]>([])
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [replyingTo, setReplyingTo] = useState<Message | null>(null)
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const emojiPickerRef = useRef<HTMLDivElement>(null)

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
            setReplyingTo(null)
            adjustTextareaHeight()

            // Simulate message delivery after 50ms
            setTimeout(() => {
                setChatMessages(prev =>
                    prev.map(msg =>
                        msg.id === newMessage.id
                            ? { ...msg, delivered: true }
                            : msg
                    )
                )
                scrollToBottom();
            }, 50)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
        }
    }

    const scrollToBottom = useCallback(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [chatContainerRef])

    const handleEmojiSelect = (emoji: string) => {
        setMessageText(prev => prev + emoji)
        setShowEmojiPicker(false)
        if (textareaRef.current) {
            textareaRef.current.focus()
        }
    }

    const handleContextMenu = (e: React.MouseEvent, messageId: string) => {
        e.preventDefault()

        // Get viewport dimensions
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const menuWidth = 150
        const menuHeight = 240 // Approximate height of menu

        // Calculate position with boundary checks
        let x = e.clientX - menuWidth - 25
        let y = e.clientY

        // Adjust x position if menu would overflow right edge
        if (x + menuWidth > viewportWidth) {
            x = viewportWidth - menuWidth - 10
        }

        // Adjust y position if menu would overflow bottom edge
        if (y + menuHeight > viewportHeight) {
            y = e.clientY - menuHeight
        }

        // Ensure menu doesn't go above viewport
        if (y < 10) {
            y = 10
        }

        setContextMenu({
            messageId,
            x,
            y
        })
    }

    const closeContextMenu = () => {
        setContextMenu(null)
    }

    const deleteMessage = (messageId: string) => {
        setChatMessages(prev => prev.filter(msg => msg.id !== messageId))
        closeContextMenu()
    }

    const editMessage = (messageId: string) => {
        setChatMessages(prev => prev.map(msg =>
            msg.id === messageId
                ? { ...msg, isEditing: true, originalText: msg.text }
                : msg
        ))
        closeContextMenu()
    }

    const saveEditedMessage = (messageId: string, newText: string) => {
        setChatMessages(prev => prev.map(msg =>
            msg.id === messageId
                ? { ...msg, text: newText, isEditing: false, originalText: undefined }
                : msg
        ))
    }

    const cancelEdit = (messageId: string) => {
        setChatMessages(prev => prev.map(msg =>
            msg.id === messageId
                ? { ...msg, text: msg.originalText || msg.text, isEditing: false, originalText: undefined }
                : msg
        ))
    }

    const forwardMessage = (messageId: string) => {
        const message = chatMessages.find(msg => msg.id === messageId)
        if (message) {
            alert(`Forwarding message: "${message.text}"`)
        }
        closeContextMenu()
    }

    const replyToMessage = (messageId: string) => {
        const message = chatMessages.find(msg => msg.id === messageId)
        if (message) {
            setReplyingTo(message)
            if (textareaRef.current) {
                textareaRef.current.focus()
            }
        }
        closeContextMenu()
    }

    const selectMessage = (messageId: string) => {
        setIsSelectionMode(true)
        setSelectedMessages(prev =>
            prev.includes(messageId)
                ? prev.filter(id => id !== messageId)
                : [...prev, messageId]
        )
        closeContextMenu()
    }

    const shareMessage = (messageId: string) => {
        const message = chatMessages.find(msg => msg.id === messageId)
        if (message && navigator.share) {
            navigator.share({
                text: message.text
            }).catch(console.error)
        } else if (message) {
            navigator.clipboard.writeText(message.text)
            alert('Message copied to clipboard!')
        }
        closeContextMenu()
    }

    const exitSelectionMode = () => {
        setIsSelectionMode(false)
        setSelectedMessages([])
    }

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (contextMenu) {
                closeContextMenu()
            }
            if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmojiPicker(false)
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [contextMenu, showEmojiPicker])

    useEffect(() => {
        adjustTextareaHeight()
    }, [messageText])

    return (
        <>
            <div className="flex flex-col flex-1 overflow-y-auto p-4 bg-gradient-to-b from-sky-50 to-sky-100 space-y-4 justify-end" ref={chatContainerRef}>
                {chatMessages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sent ? 'justify-end' : 'justify-start'} group relative`}
                    >
                        <div className="flex items-center">
                            {/* Message options button */}
                            {message.sent && !message.isEditing && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleContextMenu(e, message.id)
                                    }}
                                    className="mr-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-full transition-all flex-shrink-0"
                                >
                                    <MoreVertical size={14} className="text-gray-600" />
                                </button>
                            )}
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${selectedMessages.includes(message.id)
                                    ? 'ring-2 ring-blue-400'
                                    : ''
                                    } ${message.sent
                                        ? 'bg-sky-500 text-white rounded-br-sm selection:bg-white selection:text-sky-500'
                                        : 'bg-white text-gray-900 rounded-bl-sm selection:bg-sky-500 selection:text-white'
                                    } shadow-sm`}
                                onContextMenu={(e) => handleContextMenu(e, message.id)}
                            >
                                {message.isEditing ? (
                                    <div className="space-y-2">
                                        <textarea
                                            className="w-full p-2 text-sm bg-transparent border border-gray-300 rounded resize-none focus:outline-none focus:border-blue-400"
                                            value={message.text}
                                            onChange={(e) => setChatMessages(prev => prev.map(msg =>
                                                msg.id === message.id
                                                    ? { ...msg, text: e.target.value }
                                                    : msg
                                            ))}
                                            autoFocus
                                            rows={3}
                                        />
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => cancelEdit(message.id)}
                                                className="px-2 py-1 text-xs bg-gray-300 hover:bg-gray-400 rounded"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => saveEditedMessage(message.id, message.text)}
                                                className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm select-text whitespace-pre-wrap">{message.text}</p>
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
                                                            className={`w-4 h-4 -ml-2 ${message.read ? 'text-green-300 stroke-1 stroke-green-300' : 'text-sky-100'}`}
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
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Selection Mode Header */}
            {isSelectionMode && (
                <div className="bg-blue-100 p-3 border-t border-blue-200 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">
                        {selectedMessages.length} message(s) selected
                    </span>
                    <button
                        onClick={exitSelectionMode}
                        className="p-1 hover:bg-blue-200 rounded-full transition-colors"
                    >
                        <X size={16} className="text-blue-800" />
                    </button>
                </div>
            )}

            {/* Reply Preview */}
            {replyingTo && (
                <div className="bg-gray-100 p-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Reply size={16} className="text-gray-600" />
                        <span className="text-sm text-gray-700 truncate max-w-xs">
                            Replying to: {replyingTo.text}
                        </span>
                    </div>
                    <button
                        onClick={() => setReplyingTo(null)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={16} className="text-gray-600" />
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                <div className="flex items-end space-x-2">
                    <div className="relative">
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <Smile size={20} className="text-gray-600" />
                        </button>

                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div
                                ref={emojiPickerRef}
                                className="absolute bottom-12 left-0 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-64 max-h-48 overflow-y-auto z-10"
                            >
                                <div className="grid grid-cols-8 gap-2">
                                    {emojis.map((emoji, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleEmojiSelect(emoji)}
                                            className="text-xl hover:bg-gray-100 p-1 rounded transition-colors"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <Paperclip size={20} className="text-gray-600" />
                    </button>

                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message"
                            className="w-full px-4 py-2 rounded-2xl appearance-none focus:outline-none placeholder:select-none resize-none min-h-[40px] max-h-[120px] overflow-clip"
                            rows={1}
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

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 w-40 max-w-[90vw]"
                    style={{
                        left: contextMenu.x,
                        top: contextMenu.y
                    }}
                >
                    <button
                        onClick={() => replyToMessage(contextMenu.messageId)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
                    >
                        <Reply size={16} />
                        <span>Reply</span>
                    </button>
                    <button
                        onClick={() => forwardMessage(contextMenu.messageId)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
                    >
                        <Forward size={16} />
                        <span>Forward</span>
                    </button>
                    <button
                        onClick={() => editMessage(contextMenu.messageId)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
                    >
                        <Edit size={16} />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={() => selectMessage(contextMenu.messageId)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
                    >
                        <CheckSquare size={16} />
                        <span>Select</span>
                    </button>
                    <button
                        onClick={() => shareMessage(contextMenu.messageId)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
                    >
                        <Share size={16} />
                        <span>Share</span>
                    </button>
                    <hr className="my-1" />
                    <button
                        onClick={() => deleteMessage(contextMenu.messageId)}
                        className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center space-x-2 text-sm text-red-600"
                    >
                        <Trash2 size={16} />
                        <span>Delete</span>
                    </button>
                </div>
            )}
        </>
    )
}