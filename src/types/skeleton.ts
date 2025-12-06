export interface SkeletonConfig {
    width?: string | number
    height?: string | number
    className?: string
    animate?: boolean
    variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'avatar' | 'button'
    lines?: number
    spacing?: 'sm' | 'md' | 'lg'
}

export interface ComponentSkeletonMap {
    [componentName: string]: SkeletonConfig[]
}

export interface SkeletonProps {
    title?: string
    image?: string
    src?: string
    description?: string
    content?: string
    author?: string
    user?: string
}