import { Skeleton } from '@/components/ui/Skeleton'
import { ComponentSkeletonMap } from '@/types/skeleton'

interface SkeletonGeneratorProps {
    template: string
    config?: ComponentSkeletonMap
    className?: string
}

// Predefined skeleton templates
const SKELETON_TEMPLATES: ComponentSkeletonMap = {
    // Card components
    card: [
        { variant: 'rectangular', width: '100%', height: '200px', className: 'mb-4' },
        { variant: 'text', lines: 2, spacing: 'sm', className: 'mb-2' },
        { variant: 'button', width: '120px', className: 'mt-4' }
    ],

    // Profile/User components
    profile: [
        { variant: 'avatar', className: 'mb-4' },
        { variant: 'text', width: '150px', className: 'mb-1' },
        { variant: 'text', width: '100px', height: '12px' }
    ],

    // Article/Blog components
    article: [
        { variant: 'text', width: '300px', height: '24px', className: 'mb-4' },
        { variant: 'rectangular', width: '100%', height: '250px', className: 'mb-4' },
        { variant: 'text', lines: 4, spacing: 'md' },
        { variant: 'text', width: '200px', height: '12px', className: 'mt-6' }
    ],

    // List components
    list: [
        ...Array(5).fill(null).map((_, i) => ({
            variant: 'rectangular' as const,
            width: '100%',
            height: '60px',
            className: i < 4 ? 'mb-3' : ''
        }))
    ],

    // Table components
    table: [
        { variant: 'rectangular', width: '100%', height: '40px', className: 'mb-2' },
        ...Array(6).fill(null).map((_, i) => ({
            variant: 'rectangular' as const,
            width: '100%',
            height: '48px',
            className: i < 5 ? 'mb-1' : ''
        }))
    ],

    // Dashboard components
    dashboard: [
        { variant: 'text', width: '200px', height: '28px', className: 'mb-6' },
        { variant: 'rectangular', width: '100%', height: '300px', className: 'mb-6' },
        { variant: 'rectangular', width: '100%', height: '200px' }
    ],

    // Form components
    form: [
        { variant: 'text', width: '100px', height: '16px', className: 'mb-2' },
        { variant: 'rectangular', width: '100%', height: '40px', className: 'mb-4' },
        { variant: 'text', width: '100px', height: '16px', className: 'mb-2' },
        { variant: 'rectangular', width: '100%', height: '40px', className: 'mb-4' },
        { variant: 'button', width: '120px', height: '40px', className: 'mt-4' }
    ],

    // E-commerce components
    product: [
        { variant: 'rectangular', width: '100%', height: '300px', className: 'mb-4' },
        { variant: 'text', width: '250px', height: '20px', className: 'mb-2' },
        { variant: 'text', width: '100px', height: '16px', className: 'mb-4' },
        { variant: 'text', lines: 3, spacing: 'sm', className: 'mb-4' },
        { variant: 'button', width: '140px', height: '44px' }
    ],

    // Navigation components
    navbar: [
        { variant: 'rectangular', width: '120px', height: '32px', className: 'mr-8' },
        { variant: 'rectangular', width: '80px', height: '32px', className: 'mr-4' },
        { variant: 'rectangular', width: '80px', height: '32px', className: 'mr-4' },
        { variant: 'circular', width: '32px', height: '32px' }
    ],

    // Comment components
    comment: [
        { variant: 'avatar', className: 'mb-2' },
        { variant: 'text', width: '120px', height: '14px', className: 'mb-2' },
        { variant: 'text', lines: 2, spacing: 'sm' },
        { variant: 'text', width: '80px', height: '12px', className: 'mt-2' }
    ]
}

export function SkeletonGenerator({ template, config, className = '' }: SkeletonGeneratorProps) {
    const skeletonConfig = config?.[template] || SKELETON_TEMPLATES[template]

    if (!skeletonConfig) {
        console.warn(`Skeleton template "${template}" not found`)
        return (
            <div className={`p-4 ${className}`}>
                <Skeleton variant="text" lines={3} />
            </div>
        )
    }

    return (
        <div className={`animate-pulse ${className}`}>
            {skeletonConfig.map((item, index) => (
                <Skeleton key={index} {...item} />
            ))}
        </div>
    )
}