import { useState } from 'react'
import { Smile, Paperclip, Send, Mic } from 'lucide-react'

interface MessageInputProps {
    onSend: (text: string) => void
}

export default function MessageInput({ onSend }: MessageInputProps) {
    const [messageText, setMessageText] = useState('')

    const handleSend = () => {
        if (messageText.trim()) {
            onSend(messageText)
            setMessageText('')
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
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
                        onClick={handleSend}
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
    )
}
