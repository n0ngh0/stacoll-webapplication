"use client";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

type SafeMarkdownProps = {
  children: string;
  className?: string;
  components?: Components;
};

export function SafeMarkdown({ children, className, components }: SafeMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown rehypePlugins={[rehypeSanitize]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
