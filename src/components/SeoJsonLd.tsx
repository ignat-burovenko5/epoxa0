import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

/** Global structured data for Organization + WebSite (root layout). */
export default function SeoJsonLd() {
  const graphs = [organizationJsonLd(), websiteJsonLd()];

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graphs) }}
    />
  );
}
