#!/usr/bin/env node

// scripts/generate-skeleton.js
import fs from 'fs'
import path from 'path'
import { program } from 'commander'

// Template configurations
const SKELETON_TEMPLATES = {
    page: {
        template: 'article',
        wrapper: 'container mx-auto px-4 py-8'
    },
    list: {
        template: 'card',
        count: 6,
        wrapper: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 container mx-auto px-4 py-8'
    },
    dashboard: {
        template: 'dashboard',
        wrapper: 'container mx-auto px-4 py-8'
    },
    profile: {
        template: 'profile',
        wrapper: 'max-w-md mx-auto px-4 py-8'
    },
    form: {
        template: 'form',
        wrapper: 'max-w-lg mx-auto px-4 py-8'
    },
    table: {
        template: 'table',
        wrapper: 'container mx-auto px-4 py-8'
    }
}

// Generate loading.tsx file
function generateLoadingFile(templateType, outputPath, options = {}) {
    const config = SKELETON_TEMPLATES[templateType]
    if (!config) {
        console.error(`❌ Template type "${templateType}" not found`)
        process.exit(1)
    }

    const { template, count, wrapper } = config
    const { customTemplate, customWrapper, customCount } = options

    let content = `import { SkeletonGenerator } from '@/components/skeletons/SkeletonGenerator'\n\n`

    if (count || customCount) {
        const skeletonCount = customCount || count
        content += `export default function Loading() {
  return (
    <div className="${customWrapper || wrapper}">
      <div className="space-y-6">
        {Array.from({ length: ${skeletonCount} }, (_, i) => (
          <SkeletonGenerator 
            key={i} 
            template="${customTemplate || template}" 
            className="w-full"
          />
        ))}
      </div>
    </div>
  )
}`
    } else {
        content += `export default function Loading() {
  return (
    <div className="${customWrapper || wrapper}">
      <SkeletonGenerator template="${customTemplate || template}" />
    </div>
  )
}`
    }

    // Ensure directory exists
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }

    // Write file
    fs.writeFileSync(outputPath, content)
    console.log(`✅ Loading skeleton generated: ${outputPath}`)
}

// Scan directory for components and generate skeletons
function scanAndGenerate(scanDir, outputDir, options = {}) {
    console.log(`🔍 Scanning directory: ${scanDir}`)

    if (!fs.existsSync(scanDir)) {
        console.error(`❌ Directory not found: ${scanDir}`)
        process.exit(1)
    }

    const files = fs.readdirSync(scanDir, { recursive: true })
    const componentFiles = files.filter(file =>
        (file.endsWith('.tsx') || file.endsWith('.jsx')) &&
        !file.includes('.test.') &&
        !file.includes('.spec.') &&
        !file.includes('loading.') &&
        file !== 'layout.tsx' &&
        file !== 'layout.jsx'
    )

    console.log(`📁 Found ${componentFiles.length} component files`)

    componentFiles.forEach(file => {
        const fullPath = path.join(scanDir, file)
        const content = fs.readFileSync(fullPath, 'utf-8')

        // Analyze component to determine skeleton type
        const skeletonType = analyzeComponentType(content, file)
        const relativePath = path.relative(scanDir, fullPath)
        const outputPath = path.join(outputDir, path.dirname(relativePath), 'loading.tsx')

        // Skip if loading.tsx already exists and not force
        if (fs.existsSync(outputPath) && !options.force) {
            console.log(`⏭️  Skipping (exists): ${outputPath}`)
            return
        }

        generateLoadingFile(skeletonType, outputPath, options)
    })
}

// Analyze component content to determine appropriate skeleton
function analyzeComponentType(content, filename) {
    const lowerContent = content.toLowerCase()
    const lowerFilename = filename.toLowerCase()

    // Check for specific patterns
    if (lowerFilename.includes('dashboard') || lowerContent.includes('dashboard')) {
        return 'dashboard'
    }

    if (lowerFilename.includes('profile') || lowerContent.includes('profile')) {
        return 'profile'
    }

    if (lowerFilename.includes('form') || lowerContent.includes('form') || lowerContent.includes('<form')) {
        return 'form'
    }

    if (lowerFilename.includes('table') || lowerContent.includes('table') || lowerContent.includes('<table')) {
        return 'table'
    }

    if (lowerFilename.includes('list') || lowerContent.includes('.map(') || lowerContent.includes('array.from')) {
        return 'list'
    }

    // Default to page
    return 'page'
}

// Generate component skeleton config
function generateSkeletonConfig(componentPath, outputPath) {
    if (!fs.existsSync(componentPath)) {
        console.error(`❌ Component file not found: ${componentPath}`)
        process.exit(1)
    }

    const content = fs.readFileSync(componentPath, 'utf-8')
    const config = analyzeComponentStructure(content)

    const configContent = `// Auto-generated skeleton configuration
import { ComponentSkeletonMap } from '@/types/skeleton'

export const skeletonConfig: ComponentSkeletonMap = ${JSON.stringify(config, null, 2)}
`

    fs.writeFileSync(outputPath, configContent)
    console.log(`✅ Skeleton config generated: ${outputPath}`)
}

// Analyze component structure for skeleton generation
function analyzeComponentStructure(content) {
    const config = {}
    const componentName = 'component'
    config[componentName] = []

    // Look for common patterns
    if (content.includes('img') || content.includes('Image')) {
        config[componentName].push({
            variant: 'rectangular',
            width: '100%',
            height: '200px',
            className: 'mb-4'
        })
    }

    if (content.includes('h1') || content.includes('title')) {
        config[componentName].push({
            variant: 'text',
            width: '250px',
            height: '24px',
            className: 'mb-4'
        })
    }

    if (content.includes('h2') || content.includes('h3')) {
        config[componentName].push({
            variant: 'text',
            width: '200px',
            height: '18px',
            className: 'mb-2'
        })
    }

    if (content.includes('p') || content.includes('description')) {
        config[componentName].push({
            variant: 'text',
            lines: 3,
            spacing: 'md',
            className: 'mb-4'
        })
    }

    if (content.includes('button') || content.includes('Button')) {
        config[componentName].push({
            variant: 'button',
            width: '120px',
            className: 'mt-4'
        })
    }

    if (content.includes('avatar') || content.includes('profile')) {
        config[componentName].unshift({
            variant: 'avatar',
            className: 'mb-4'
        })
    }

    return config
}

// CLI Commands
program
    .name('skeleton-generator')
    .description('Auto generate skeleton loading components for Next.js')
    .version('1.0.0')

program
    .command('generate')
    .alias('g')
    .description('Generate loading.tsx file')
    .argument('<type>', 'Skeleton type (page, list, dashboard, profile, form, table)')
    .argument('<output>', 'Output file path')
    .option('-t, --template <template>', 'Custom template name')
    .option('-w, --wrapper <wrapper>', 'Custom wrapper className')
    .option('-c, --count <count>', 'Number of skeleton items for list type', parseInt)
    .action((type, output, options) => {
        generateLoadingFile(type, output, {
            customTemplate: options.template,
            customWrapper: options.wrapper,
            customCount: options.count
        })
    })

program
    .command('scan')
    .alias('s')
    .description('Scan directory and auto-generate skeletons')
    .argument('<scanDir>', 'Directory to scan for components')
    .argument('<outputDir>', 'Output directory for loading files')
    .option('-f, --force', 'Overwrite existing loading files')
    .option('-t, --template <template>', 'Force specific template for all')
    .action((scanDir, outputDir, options) => {
        scanAndGenerate(scanDir, outputDir, options)
    })

program
    .command('config')
    .alias('c')
    .description('Generate skeleton configuration from component')
    .argument('<componentPath>', 'Path to component file')
    .argument('<outputPath>', 'Output path for config file')
    .action((componentPath, outputPath) => {
        generateSkeletonConfig(componentPath, outputPath)
    })

program
    .command('init')
    .description('Initialize skeleton system in project')
    .option('-p, --path <path>', 'Project path', '.')
    .action((options) => {
        const projectPath = options.path
        console.log(`🚀 Initializing skeleton system in: ${projectPath}`)

        // Create necessary directories and files
        const dirs = [
            'components/ui',
            'components/skeletons',
            'types',
            'utils'
        ]

        dirs.forEach(dir => {
            const fullPath = path.join(projectPath, dir)
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true })
                console.log(`📁 Created directory: ${dir}`)
            }
        })

        // Copy template files (in real implementation, these would be actual files)
        console.log(`✅ Skeleton system initialized successfully!`)
        console.log(`\n📖 Usage examples:`)
        console.log(`   npx skeleton-generator generate page ./app/blog/loading.tsx`)
        console.log(`   npx skeleton-generator scan ./app ./app`)
        console.log(`   npx skeleton-generator config ./components/BlogPost.tsx ./config/blog-skeleton.ts`)
    })

program.parse()

// Package.json script suggestions
console.log(`
📦 Add these scripts to your package.json:
{
  "scripts": {
    "skeleton:generate": "node scripts/generate-skeleton.js generate",
    "skeleton:scan": "node scripts/generate-skeleton.js scan ./app ./app",
    "skeleton:init": "node scripts/generate-skeleton.js init"
  }
}
`)