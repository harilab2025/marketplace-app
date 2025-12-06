import { useState, useEffect } from 'react'
import { ComponentSkeletonMap } from '@/types/skeleton'
import { SkeletonGenerator } from '@/components/skeletons/SkeletonGenerator'

export function useSkeletonGenerator(componentName: string, customConfig?: ComponentSkeletonMap) {
    const [isLoading, setIsLoading] = useState(true)
    const [skeletonConfig, setSkeletonConfig] = useState<ComponentSkeletonMap>({})

    useEffect(() => {
        if (customConfig) {
            setSkeletonConfig(customConfig)
        }
    }, [customConfig])

    const showSkeleton = (duration?: number) => {
        setIsLoading(true)
        if (duration) {
            setTimeout(() => setIsLoading(false), duration)
        }
    }

    const hideSkeleton = () => setIsLoading(false)

    return {
        isLoading,
        showSkeleton,
        hideSkeleton,
        SkeletonComponent: () => (
            <SkeletonGenerator
                template={componentName}
                config={skeletonConfig}
            />
        )
    }
}