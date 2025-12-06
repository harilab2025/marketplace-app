export function getAvatarInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function getRandomColor(name: string) {
    const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-sky-500', 'bg-yellow-500',
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ]
    const index = name.length % colors.length
    return colors[index]
}
