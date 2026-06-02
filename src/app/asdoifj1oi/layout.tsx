import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Image compress lab",
  robots: { index: false, follow: false },
};

export default function ImageLabLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
