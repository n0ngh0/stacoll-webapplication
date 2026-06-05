"use client";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

type SafeMarkdownProps = {
  children: string;
  className?: string;
  components?: Components;
};

export function SafeMarkdown({ children, className, components }: SafeMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
