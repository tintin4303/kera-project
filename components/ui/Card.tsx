import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export default function Card({
    children,
    hover = false,
    padding = 'md',
    className,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                'rounded-xl bg-white shadow-sm border border-gray-200',
                paddingClasses[padding],
                hover && 'transition-shadow hover:shadow-md',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
