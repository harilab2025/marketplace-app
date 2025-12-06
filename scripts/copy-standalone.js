// scripts/copy-standalone.js
const fs = require('fs-extra');
const path = require('path');

async function copyStandaloneAssets() {
    try {
        const projectRoot = path.resolve(__dirname, '..');
        const standaloneDir = path.join(projectRoot, '.next/standalone');

        // Validasi: Pastikan .next/standalone ada
        if (!fs.existsSync(standaloneDir)) {
            throw new Error('Standalone directory not found. Run next build first.');
        }

        // Whitelist: Hanya copy folder yang dibutuhkan
        const allowedPaths = [
            { src: 'public', dest: 'public' },
            { src: '.next/static', dest: '.next/static' }
        ];

        for (const { src, dest } of allowedPaths) {
            const srcPath = path.join(projectRoot, src);
            const destPath = path.join(standaloneDir, dest);

            // Skip jika source tidak ada
            if (!fs.existsSync(srcPath)) {
                console.warn(`⚠️  ${src} not found, skipping...`);
                continue;
            }

            // Copy dengan filter (exclude sensitive files)
            await fs.copy(srcPath, destPath, {
                filter: (src) => {
                    // Exclude sensitive files
                    const excludePatterns = [
                        /\.env/,
                        /\.git/,
                        /node_modules/,
                        /\.DS_Store/,
                        /Thumbs\.db/,
                        /\.secret/,
                        /private/i
                    ];

                    return !excludePatterns.some(pattern => pattern.test(src));
                }
            });

            console.log(`✅ Copied ${src} to standalone`);
        }

        console.log('✅ Standalone assets copied successfully!');
    } catch (error) {
        console.error('❌ Error copying standalone assets:', error);
        process.exit(1);
    }
}

copyStandaloneAssets();