import { LucideBaggageClaim, LucideBinoculars, LucideChartColumn, LucideChartNoAxesCombined, LucideDatabase, LucideFileChartColumn, LucideFolderKanban, LucideGrid2X2Plus, LucideLayoutDashboard, LucideListOrdered, LucidePackage2, LucideSettings, LucideUser, LucideUserCircle, LucideUsersRound, LucideClipboardCheck, LucideActivity } from 'lucide-react'
export const menuDashboard = [
    {
        title: 'Dashboard',
        btn_title: 'Overview',
        btn_icon: <LucideBinoculars size={20} />,
        list: [
            {
                btn_title: 'Dashboard',
                btn_icon: <LucideLayoutDashboard size={20} />,
                btn_link: '/dashboard'
                // No roles = accessible to all users
            },
            {
                btn_title: 'Analytics',
                btn_icon: <LucideChartColumn size={20} />,
                btn_link: '/dashboard/analytics',
                roles: ['SUPERADMIN', 'PRODUCT_MANAGER']
            },
        ]
    },
    {
        title: 'Dashboard',
        btn_title: 'Management',
        btn_icon: <LucideFolderKanban size={20} />,
        list: [
            {
                btn_title: 'Users',
                btn_icon: <LucideUser size={20} />,
                btn_link: '/dashboard/management-users',
                roles: ['SUPERADMIN']
            },
            {
                btn_title: 'Categories',
                btn_icon: <LucideGrid2X2Plus size={20} />,
                btn_link: '/dashboard/management-categories',
                roles: ['SUPERADMIN']
            },
            {
                btn_title: 'Products',
                btn_icon: <LucidePackage2 size={20} />,
                btn_link: '/dashboard/management-products',
                roles: ['SUPERADMIN', 'PRODUCT_MANAGER']
            },
            {
                btn_title: 'Review Queue',
                btn_icon: <LucideClipboardCheck size={20} />,
                btn_link: '/dashboard/review-queue',
                roles: ['SUPERADMIN', 'PRODUCT_REVIEWER']
            },
            {
                btn_title: 'Orders',
                btn_icon: <LucideListOrdered size={20} />,
                btn_link: '/dashboard/management-orders',
                roles: ['SUPERADMIN', 'CASHIER']
            }
        ]
    },
    {
        title: 'Dashboard',
        btn_title: 'Report',
        btn_icon: <LucideFileChartColumn size={20} />,
        list: [
            {
                btn_title: 'Sales',
                btn_icon: <LucideChartNoAxesCombined size={20} />,
                btn_link: '/dashboard/reports-sales',
                roles: ['SUPERADMIN', 'CASHIER']
            },
            {
                btn_title: 'Inventory',
                btn_icon: <LucideBaggageClaim size={20} />,
                btn_link: '/dashboard/reports-inventory',
                roles: ['SUPERADMIN', 'PRODUCT_MANAGER']
            },
            {
                btn_title: 'Customers',
                btn_icon: <LucideUsersRound size={20} />,
                btn_link: '/dashboard/reports-customers',
                roles: ['SUPERADMIN', 'CASHIER']
            }
        ]
    },
    {
        title: 'Dashboard',
        btn_title: 'Account',
        btn_icon: <LucideUserCircle size={20} />,
        list: [
            {
                btn_title: 'Profile',
                btn_icon: <LucideUserCircle size={20} />,
                btn_link: '/dashboard/profile'
            },
            {
                btn_title: 'Settings',
                btn_icon: <LucideSettings size={20} />,
                btn_link: '/dashboard/settings'
            }
        ]
    },
    {
        title: 'Dashboard',
        btn_title: 'System',
        btn_icon: <LucideSettings size={20} />,
        list: [
            {
                btn_title: 'Cache Management',
                btn_icon: <LucideDatabase size={20} />,
                btn_link: '/dashboard/cache-management',
                roles: ['SUPERADMIN']
            },
            {
                btn_title: 'ES Monitoring',
                btn_icon: <LucideActivity size={20} />,
                btn_link: '/dashboard/elasticsearch-monitoring',
                roles: ['SUPERADMIN']
            }
        ]
    }
]