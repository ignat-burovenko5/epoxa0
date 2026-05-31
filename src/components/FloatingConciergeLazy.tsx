"use client";

import dynamic from "next/dynamic";

const FloatingConcierge = dynamic(() => import("@/components/FloatingConcierge"), {
  ssr: false,
});

export default function FloatingConciergeLazy() {
  return <FloatingConcierge />;
}
