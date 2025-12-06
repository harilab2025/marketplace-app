import { ComponentSkeletonMap, SkeletonProps } from "@/types/skeleton"

export class SkeletonAutoGenerator {
    private static instance: SkeletonAutoGenerator
    private registeredComponents: Map<string, ComponentSkeletonMap> = new Map()

    static getInstance(): SkeletonAutoGenerator {
        if (!SkeletonAutoGenerator.instance) {
            SkeletonAutoGenerator.instance = new SkeletonAutoGenerator()
        }
        return SkeletonAutoGenerator.instance
    }

    // Register component skeleton configuration
    registerComponent(name: string, config: ComponentSkeletonMap) {
        this.registeredComponents.set(name, config)
    }

    // Generate skeleton based on component props analysis
    generateSkeletonFromProps(componentName: string, props: SkeletonProps): ComponentSkeletonMap {
        const config: ComponentSkeletonMap = {}

        // Auto-detect skeleton needs based on props
        if (props.title) {
            config[componentName] = config[componentName] || []
            config[componentName].push({ variant: 'text', width: '200px', height: '20px', className: 'mb-2' })
        }

        if (props.image || props.src) {
            config[componentName] = config[componentName] || []
            config[componentName].push({ variant: 'rectangular', width: '100%', height: '200px', className: 'mb-4' })
        }

        if (props.description || props.content) {
            config[componentName] = config[componentName] || []
            config[componentName].push({ variant: 'text', lines: 3, spacing: 'sm' })
        }

        if (props.author || props.user) {
            config[componentName] = config[componentName] || []
            config[componentName].push({ variant: 'avatar', className: 'mb-2' })
        }

        return config
    }

    // Generate loading.tsx file content
    generateLoadingFile(componentName: string, customTemplate?: string): string {
        const template = customTemplate || componentName

        return `import { SkeletonGenerator } from '@/components/skeletons/SkeletonGenerator'

                    export default function Loading() {
                    return (
                        <div className="container mx-auto px-4 py-8">
                        <SkeletonGenerator template="${template}" />
                        </div>
                    )
                }`
    }

    // Generate multiple skeletons for list views
    generateListSkeletons(template: string, count: number = 5): string {
        return `import { SkeletonGenerator } from '@/components/skeletons/SkeletonGenerator'

                export default function Loading() {
                return (
                    <div className="container mx-auto px-4 py-8">
                    <div className="space-y-6">
                        {Array.from({ length: ${count} }, (_, i) => (
                        <SkeletonGenerator key={i} template="${template}" />
                        ))}
                    </div>
                    </div>
                )
                }`
    }
}