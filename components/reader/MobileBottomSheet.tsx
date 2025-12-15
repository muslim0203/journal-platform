"use client";

import { ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function MobileBottomSheet({ open, onClose, children }: Props) {
  return (
    <div className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-x-0 bottom-0 max-h-[70vh] rounded-t-2xl bg-white p-4 shadow-2xl transition-transform dark:bg-neutral-900 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-neutral-300" />
        <div className="overflow-y-auto">{children}</div>
        <button
          onClick={onClose}
          className="mt-3 w-full rounded-md bg-neutral-100 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-neutral-800"
        >
          Yopish
        </button>
      </div>
    </div>
  );
}

