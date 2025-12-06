import { SkeletonConfig } from '@/types/skeleton'

interface SkeletonProps extends SkeletonConfig {
    children?: React.ReactNode
}

export function Skeleton({
    width = '100%',
    height = '1rem',
    className = '',
    animate = true,
    variant = 'rectangular',
    lines = 1,
    spacing = 'md',
    children
}: SkeletonProps) {
    const baseClasses = 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 bg-[length:200%_100%]'
    const animateClasses = animate ? 'animate-pulse' : ''

    const variantClasses = {
        text: 'rounded-md h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
        card: 'rounded-xl shadow-sm',
        avatar: 'rounded-full w-10 h-10',
        button: 'rounded-lg h-10 px-4'
    }

    const spacingClasses = {
        sm: 'space-y-1',
        md: 'space-y-2',
        lg: 'space-y-4'
    }

    if (lines > 1) {
        return (
            <div className={`${spacingClasses[spacing]} ${className}`}>
                {Array.from({ length: lines }, (_, i) => (
                    <div
                        key={i}
                        className={`${baseClasses} ${animateClasses} ${variantClasses[variant]}`}
                        style={{
                            width: i === lines - 1 ? '75%' : width,
                            height: height
                        }}
                    />
                ))}
            </div>
        )
    }

    return (
        <div
            className={`${baseClasses} ${animateClasses} ${variantClasses[variant]} ${className}`}
            style={{ width, height }}
        >
            {children}
        </div>
    )
}