import { LucideBaggageClaim, LucideBinoculars, LucideChartColumn, LucideChartNoAxesCombined, LucideFileChartColumn, LucideFolderKanban, LucideLayoutDashboard, LucideListOrdered, LucidePackage2, LucideUser, LucideUsersRound } from 'lucide-react'
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
            },
            {
                btn_title: 'Analytics',
                btn_icon: <LucideChartColumn size={20} />,
                btn_link: '/dashboard/analytics'
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
            },
            {
                btn_title: 'Products',
                btn_icon: <LucidePackage2 size={20} />,
                btn_link: '/dashboard/management-products'
            },
            {
                btn_title: 'Orders',
                btn_icon: <LucideListOrdered size={20} />,
                btn_link: '/dashboard/management-orders'
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
                btn_link: '/dashboard/reports-sales'
            },
            {
                btn_title: 'Inventory',
                btn_icon: <LucideBaggageClaim size={20} />,
                btn_link: '/dashboard/reports-inventory'
            },
            {
                btn_title: 'Customers',
                btn_icon: <LucideUsersRound size={20} />,
                btn_link: '/dashboard/reports-customers'
            }
        ]
    }
]