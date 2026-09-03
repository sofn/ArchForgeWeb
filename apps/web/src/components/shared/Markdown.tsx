"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { isAllowedImageUrl } from "@/lib/image";
// Light theme import; the dark variant is hand-scoped under `.dark` in
// globals.css (importing github-dark.css here would fully override the light
// theme — both use the same .hljs selector specificity).
import "highlight.js/styles/github.css";

function MarkdownImage({ src, alt }: { src?: string; alt?: string }) {
  const imageSrc = typeof src === "string" ? src : "";
  const imageAlt = typeof alt === "string" ? alt : "";

  if (!imageSrc) return null;

  if (isAllowedImageUrl(imageSrc)) {
    return (
      <span className="relative my-4 block min-h-[200px] w-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="rounded-lg object-contain"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </span>
    );
  }

  return (
    <span className="relative my-4 block min-h-[200px] w-full">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        className="rounded-lg object-contain"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        unoptimized
      />
    </span>
  );
}

export function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        img: ({ src, alt }) => {
          const imageSrc = typeof src === "string" ? src : "";
          const imageAlt = typeof alt === "string" ? alt : "";
          return <MarkdownImage src={imageSrc} alt={imageAlt} />;
        },
        h1: ({ children }) => <h1 className="mt-8 mb-4 text-3xl font-bold">{children}</h1>,
        h2: ({ children }) => <h2 className="mt-6 mb-3 text-2xl font-semibold">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-5 mb-2 text-xl font-semibold">{children}</h3>,
        p: ({ children }) => <p className="mb-4 leading-7 text-slate-700 dark:text-slate-300">{children}</p>,
        ul: ({ children }) => <ul className="mb-4 list-disc pl-6">{children}</ul>,
        ol: ({ children }) => <ol className="mb-4 list-decimal pl-6">{children}</ol>,
        li: ({ children }) => <li className="mb-1 text-slate-700 dark:text-slate-300">{children}</li>,
        pre: ({ children }) => (
          <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-100 p-4">{children}</pre>
        ),
        code: ({ className, children }) => (
          <code className={`${className} rounded bg-slate-100 px-1 py-0.5 text-sm`}>
            {children}
          </code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
