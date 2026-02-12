"use client";

import DOMPurify from "dompurify";

interface SafeHtmlContentProps {
  html: string;
  className?: string;
}

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "b", "em", "i", "u",
    "span", "div", "ul", "ol", "li", "a", "blockquote",
    "h1", "h2", "h3", "h4", "h5", "h6",
  ],
  ALLOWED_ATTR: ["style", "href", "target", "rel"],
} satisfies DOMPurify.Config;

export default function SafeHtmlContent({ html, className }: SafeHtmlContentProps) {
  const sanitized = DOMPurify.sanitize(html, SANITIZE_CONFIG) as string;
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
