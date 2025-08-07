import { cva } from "class-variance-authority";

export const pillVariants = cva(
  "inline-flex items-center rounded-full text-xs font-medium",
  {
    variants: {
      variant: {
        default:
          "bg-secondary text-primary-foreground shadow hover:bg-primary/90",
      },
      size: {
        default: "px-1.5 py-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
