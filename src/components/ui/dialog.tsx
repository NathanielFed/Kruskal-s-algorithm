import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export const Root = DialogPrimitive.Root;
export const Trigger = DialogPrimitive.Trigger;

export function Content({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40" />
      <DialogPrimitive.Content
        className={`fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-gray-200 bg-white p-6 shadow-lg rounded-md ${className ?? ""}`}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function Header({ children }: { children?: React.ReactNode }) {
  return <div className="flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>;
}

export function Title({ children }: { children?: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function Description({ children }: { children?: React.ReactNode }) {
  return <p className="text-sm text-gray-600">{children}</p>;
}