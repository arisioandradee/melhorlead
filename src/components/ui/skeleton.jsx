import { cn } from "@/lib/utils";

/**
 * Skeleton - Loading placeholder component
 * Uso: <Skeleton className="h-4 w-[250px]" />
 */
export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-md bg-muted/50",
                "before:absolute before:inset-0",
                "before:-translate-x-full before:animate-shimmer",
                "before:bg-gradient-to-r before:from-transparent before:via-foreground/10 before:to-transparent",
                className
            )}
            style={{
                backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
                backgroundSize: "1000px 100%",
            }}
            {...props}
        />
    );
}

/**
 * Card Skeleton - Pre-built card loading state
 */
export function CardSkeleton() {
    return (
        <div className="glass p-6 rounded-xl space-y-4 animate-fade-in">
            <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-10 w-20" />
            </div>

            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>

            <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
            </div>
        </div>
    );
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-border">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-8 w-20" />
        </div>
    );
}

/**
 * Grid Skeleton - For results grid
 */
export function GridSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <CardSkeleton />
                </div>
            ))}
        </div>
    );
}
