export interface Chat {
    id: string
    name: string
    lastMessage: string
    time: string
    unread: number
    avatar: string
    online: boolean
    type: 'personal' | 'group'
}

export interface Message {
    id: string
    text: string
    time: string
    sent: boolean
    delivered: boolean
    read: boolean
}