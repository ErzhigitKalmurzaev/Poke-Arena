"use client"

import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/shared/lib/utils"

const Menu = MenuPrimitive.Root
const MenuTrigger = MenuPrimitive.Trigger
const MenuGroup = MenuPrimitive.Group

function MenuContent({
  className,
  children,
  side = "bottom",
  sideOffset = 8,
  align = "end",
  alignOffset = 0,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
      >
        <MenuPrimitive.Popup
          data-slot="menu-content"
          className={cn(
            "relative isolate z-50 min-w-48 origin-(--transform-origin) rounded-2xl bg-popover p-1.5 text-popover-foreground shadow-xl ring-1 ring-white/10 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function MenuItem({
  className,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & { variant?: "default" | "destructive" }) {
  return (
    <MenuPrimitive.Item
      data-slot="menu-item"
      data-variant={variant}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 data-[variant=destructive]:text-destructive data-[variant=destructive]:data-highlighted:bg-destructive/15 data-[variant=destructive]:data-highlighted:text-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

/**
 * Plain heading for the top of a popup, NOT Base UI's `Menu.GroupLabel` -
 * that part reads MenuGroupContext and throws unless it's wrapped in a
 * `<Menu.Group>`, which is the wrong semantics for a label that titles the
 * whole menu rather than one group of items inside it. Use MenuGroupLabel
 * (below) when there really are groups to label.
 */
function MenuLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="menu-label"
      className={cn(
        "px-2.5 py-1.5 font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase",
        className
      )}
      {...props}
    />
  )
}

function MenuGroupLabel({ className, ...props }: MenuPrimitive.GroupLabel.Props) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="menu-group-label"
      className={cn(
        "px-2.5 py-1.5 font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase",
        className
      )}
      {...props}
    />
  )
}

function MenuSeparator({ className, ...props }: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="menu-separator"
      className={cn("pointer-events-none -mx-1.5 my-1.5 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
}
