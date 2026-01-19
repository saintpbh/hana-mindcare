import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        const variants = {
            default: "bg-[var(--color-midnight-navy)] text-white shadow hover:bg-[var(--color-midnight-navy)]/90",
            destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600",
            outline: "border border-[var(--color-midnight-navy)]/10 bg-transparent shadow-sm hover:bg-[var(--color-warm-white)] hover:text-[var(--color-midnight-navy)]",
            secondary: "bg-[var(--color-champagne-gold)]/10 text-[var(--color-midnight-navy)] shadow-sm hover:bg-[var(--color-champagne-gold)]/20",
            ghost: "hover:bg-[var(--color-warm-white)] hover:text-[var(--color-midnight-navy)]",
            link: "text-[var(--color-midnight-navy)] underline-offset-4 hover:underline",
        };

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-8 rounded-md px-3 text-xs",
            lg: "h-12 rounded-2xl px-8",
            icon: "h-10 w-10",
        };

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-midnight-navy)]/20 disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
