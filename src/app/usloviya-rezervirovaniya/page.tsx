import type { Metadata } from "next";
import LegalDocumentPage from "@/components/LegalDocumentPage";
import { getLegalDocument } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";

const document = getLegalDocument("usloviya-rezervirovaniya")!;

export const metadata: Metadata = pageMetadata({
  title: document.title,
  description: document.intro[0],
  path: "/usloviya-rezervirovaniya",
});

export default function ReservationTermsPage() {
  return <LegalDocumentPage document={document} />;
}
