import type { Metadata } from "next";
import LegalDocumentPage from "@/components/LegalDocumentPage";
import { legalDocuments } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

const document = legalDocuments[0];

export const metadata: Metadata = {
  title: `${document.title} | ${siteConfig.name}`,
  description: document.paragraphs[0],
};

export default function PrivacyPolicyPage() {
  return <LegalDocumentPage document={document} />;
}
