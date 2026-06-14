import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/utils";

const typographyVariants = cva("text-foreground", {
 variants: {
 variant: {
 h1: "font-bold text-base",
 h2: "text-base",
 h3: "text-md",
 h4: "text-sm",
 p: "text-xs",
 lead: "text-xl text-muted-foreground",
 large: "text-lg font-semibold",
 small: "text-sm font-medium leading-none",
 muted: "text-sm text-muted-foreground",
 blockquote: "mt-6 border-l-2 border-border pl-6 italic",
 code: "relative rounded-sm bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
 list: "my-6 ml-6 list-disc [&>li]:mt-2",
 sub: "text-xs text-muted-foreground",
 },
 },
 defaultVariants: {
 variant: "p",
 },
});

type TypographyVariant = NonNullable<VariantProps<typeof typographyVariants>["variant"]>;

const defaultElementMap: Record<TypographyVariant, keyof React.JSX.IntrinsicElements> = {
 h1: "h1",
 h2: "h2",
 h3: "h3",
 h4: "h4",
 p: "p",
 lead: "p",
 large: "div",
 small: "small",
 muted: "p",
 blockquote: "blockquote",
 code: "code",
 list: "ul",
 sub: "span",
};

function Typography({
 className,
 variant = "p",
 as,
 asChild = false,
 ...props
}: React.HTMLAttributes<HTMLElement> &
 VariantProps<typeof typographyVariants> & {
 as?: keyof React.JSX.IntrinsicElements;
 asChild?: boolean;
 }) {
 const Comp = asChild ? Slot.Root : ((as ?? defaultElementMap[(variant ?? "p") as TypographyVariant]) as React.ElementType);

 return <Comp data-slot="typography" data-variant={variant} className={cn(typographyVariants({ variant, className }))} {...props} />;
}

export { Typography, typographyVariants };
