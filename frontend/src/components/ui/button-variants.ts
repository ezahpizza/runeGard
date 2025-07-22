import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--mid-black))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "text-background bg-primary border-2 border-r-4 border-b-4 border-foreground hover:translate-x-1 hover:translate-y-1 hover:border-r-2 hover:border-b-2",
        noShadow: "text-background bg-primary border-2 border-foreground",
        neutral:
          "bg-background text-foreground border-2 border-r-4 border-b-4 border-foreground hover:translate-x-1 hover:translate-y-1 hover:border-r-2 hover:border-b-2",
        reverse:
          "text-background bg-primary border-2 border-foreground hover:translate-x-[-1px] hover:translate-y-[-1px] hover:border-r-4 hover:border-b-4",
        ghost:
          "text-foreground hover:bg-accent hover:text-accent-foreground border-2 border-transparent",
        outline:
          "text-foreground bg-background border-2 border-foreground hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
