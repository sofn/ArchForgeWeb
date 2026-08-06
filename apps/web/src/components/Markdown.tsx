"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

export function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        img: ({ src, alt }) => {
          const imageSrc = typeof src === "string" ? src : "";
          const imageAlt = typeof alt === "string" ? alt : "";
          return (
            <span className="relative my-4 block min-h-[200px] w-full">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="rounded-lg object-contain"
                unoptimized
              />
            </span>
          );
        },
        h1: ({ children }) => <h1 className="mb-4 mt-8 text-3xl font-bold">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-3 mt-6 text-2xl font-semibold">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-2 mt-5 text-xl font-semibold">{children}</h3>,
        p: ({ children }) => <p className="mb-4 leading-7 text-slate-700">{children}</p>,
        ul: ({ children }) => <ul className="mb-4 list-disc pl-6">{children}</ul>,
        ol: ({ children }) => <ol className="mb-4 list-decimal pl-6">{children}</ol>,
        li: ({ children }) => <li className="mb-1 text-slate-700">{children}</li>,
        pre: ({ children }) => <pre className="mb-4 overflow-x-auto rounded-lg bg-slate-100 p-4">{children}</pre>,
        code: ({ className, children }) => (
          <code className={`${className} rounded bg-slate-100 px-1 py-0.5 text-sm`}>{children}</code>
        )
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
