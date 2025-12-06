import type { NextConfig } from "next";
import os from 'os';

// Enhanced Security Headers
const getSecurityHeaders = (isDev: boolean) => {
  const headers = [
    {
      key: 'X-Frame-Options',
      value: 'DENY'
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff'
    },
    {
      key: 'X-DNS-Prefetch-Control',
      value: 'on'
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin'
    },
    {
      key: 'Permissions-Policy',
      value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()'
    },
    {
      key: 'X-XSS-Protection',
      value: '0'
    }
  ];

  // Only add HSTS in production
  if (!isDev) {
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload'
    });
  }

  // CSP: Only enable in production
  if (!isDev) {
    headers.push({
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "worker-src 'self' blob:",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests"
      ].join('; ')
    });
  }

  return headers;
};

const nextConfig: NextConfig = {
  // React Configuration
  reactStrictMode: true,

  // Performance Optimizations
  poweredByHeader: false,
  compress: true,

  // Compiler Options
  compiler: {
    removeConsole: process.env.APP_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Experimental Features
  experimental: {
    // Optimized Package Imports
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      'lodash-es',
      'recharts',
      'framer-motion'
    ],

    // Server Actions Configuration
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: [
        'http://localhost:3005',
        'http://DESKTOP-G02RU1N:3005',
        ...(process.env.ASSET_PREFIX ? [process.env.ASSET_PREFIX] : [])
      ]
    },

    // Performance Optimizations
    optimisticClientCache: true,
    scrollRestoration: true,

    // Memory optimizations
    memoryBasedWorkersCount: true,
    cpus: Math.max(1, (os.cpus().length || 1) - 1),
  },

  // Image Optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // Add your allowed image domains here
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   port: '',
      //   pathname: '/images/**',
      // },
    ],
  },

  // Headers Configuration
  async headers() {
    const isDev = process.env.APP_ENV !== 'production';
    const securityHeaders = getSecurityHeaders(isDev);

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/api/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate'
          }
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      // Add your redirects here
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },

  // Rewrites
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },

  // Webpack Configuration
  webpack: (config, { dev, isServer }) => {
    // Fallbacks for Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module: { context?: string }) {
                const match = module.context?.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                );

                const packageName = match?.[1] || 'unknown';
                return `npm.${packageName.replace('@', '')}`;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
          },
          maxInitialRequests: 25,
          minSize: 20000,
        }
      };
    }

    return config;
  },

  // Environment Variables (public)
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'My App',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3005',
  },

  // Output Configuration
  output: 'standalone', // For Docker deployment

  // Only use assetPrefix in production
  assetPrefix: process.env.APP_ENV === 'production' && process.env.ASSET_PREFIX
    ? process.env.ASSET_PREFIX
    : '',

  // TypeScript Configuration
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Dev Indicators (Next.js 16 only supports boolean)
  devIndicators: {
    position: 'bottom-right',
  },

  // Production Browser Source Maps
  productionBrowserSourceMaps: false,

  // Generate ETags
  generateEtags: true,

  // HTTP Keep Alive
  httpAgentOptions: {
    keepAlive: true,
  },

  // ⚠️ REMOVED: onDemandEntries is deprecated in Next.js 16
  // On-demand compilation is now handled automatically by Turbopack
};

export default nextConfig;