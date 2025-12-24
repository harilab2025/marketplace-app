import { VerificationStatus } from '@/store/productsSlice';
import { Badge } from '@/components/ui/badge';

interface ProductStatusBadgeProps {
    status: VerificationStatus;
    className?: string;
}

const statusConfig: Record<VerificationStatus, { color: string; label: string; className: string }> = {
    DRAFT: {
        color: 'gray',
        label: 'Draft',
        className: 'bg-gray-100 text-gray-800 border-gray-300'
    },
    PENDING: {
        color: 'yellow',
        label: 'Pending Review',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    },
    APPROVED: {
        color: 'green',
        label: 'Approved',
        className: 'bg-green-100 text-green-800 border-green-300'
    },
    REJECTED: {
        color: 'red',
        label: 'Rejected',
        className: 'bg-red-100 text-red-800 border-red-300'
    },
    PUBLISHED: {
        color: 'blue',
        label: 'Live',
        className: 'bg-blue-100 text-blue-800 border-blue-300'
    },
    UNPUBLISHED: {
        color: 'gray',
        label: 'Unpublished',
        className: 'bg-gray-100 text-gray-700 border-gray-300'
    }
};

export default function ProductStatusBadge({ status, className = '' }: ProductStatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Badge
            variant="outline"
            className={`${config.className} ${className}`}
        >
            {config.label}
        </Badge>
    );
}
