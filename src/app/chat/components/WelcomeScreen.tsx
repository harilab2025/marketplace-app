export default function WelcomeScreen() {
    return (
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
    )
}
