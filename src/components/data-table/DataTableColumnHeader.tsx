import { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    LucideChevronDown,
    LucideChevronUp,
    LucideChevronsUpDown,
} from "lucide-react";

interface DataTableColumnHeaderProps<TData, TValue>
    extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;
    title: string;
    sortable?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    sortable = true,
    className,
}: DataTableColumnHeaderProps<TData, TValue>) {
    if (!sortable) {
        return <div className={className}>{title}</div>;
    }

    return (
        <div className={className}>
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                className="-ml-3 h-8 data-[state=open]:bg-accent"
            >
                <span>{title}</span>
                {column.getIsSorted() === "asc" ? (
                    <LucideChevronUp className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                    <LucideChevronDown className="ml-2 h-4 w-4" />
                ) : (
                    <LucideChevronsUpDown className="ml-2 h-4 w-4" />
                )}
            </Button>
        </div>
    );
}
