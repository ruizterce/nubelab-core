"use client";

import { type ReactNode } from "react";

export function StaggerFadeIn({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        opacity: 0,
        transform: "translateY(8px)",
        animation: `stagger-fade 300ms ease forwards`,
        animationDelay: `${index * 200}ms`,
      }}
    >
      {children}
    </div>
  );
}
