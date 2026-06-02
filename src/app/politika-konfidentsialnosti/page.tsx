import type { Metadata } from "next";
import LegalDocumentPage from "@/components/LegalDocumentPage";
import { getLegalDocument } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";

const document = getLegalDocument("politika-konfidentsialnosti")!;

export const metadata: Metadata = pageMetadata({
  title: document.title,
  description: document.intro[0],
  path: "/politika-konfidentsialnosti",
});

export default function PrivacyPolicyPage() {
  return <LegalDocumentPage document={document} />;
}
