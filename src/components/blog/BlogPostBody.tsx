import { markdownToHtml, plainToParagraphs } from "@/lib/blog/markdown";
import type { BlogBodyFormat } from "@/lib/blog/types";

type BlogPostBodyProps = {
  body: string;
  bodyFormat?: BlogBodyFormat;
  className?: string;
};

export default function BlogPostBody({
  body,
  bodyFormat = "plain",
  className = "",
}: BlogPostBodyProps) {
  if (bodyFormat === "markdown") {
    return (
      <div
        className={`blog-prose space-y-4 mb-10 ${className}`.trim()}
        dangerouslySetInnerHTML={{ __html: markdownToHtml(body) }}
      />
    );
  }

  return (
    <div className={`space-y-4 mb-10 ${className}`.trim()}>
      {plainToParagraphs(body).map((paragraph) => (
        <p
          key={paragraph.slice(0, 48)}
          className="font-sans text-sm md:text-base leading-relaxed text-museum-light/75 whitespace-pre-line"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
