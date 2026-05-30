import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeHighlight from "rehype-highlight"
import rehypeSlug from "rehype-slug"
import rehypeRaw from "rehype-raw"
import { remarkWikiLink } from "@/lib/remark-wiki-link"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown
        // remark-math must run before remark-rehype so $...$ / $$...$$ become
        // math nodes; wiki-link/gfm only touch text and don't conflict.
        remarkPlugins={[remarkMath, remarkWikiLink, remarkGfm]}
        // Order matters: rehype-raw reparses embedded HTML first, then
        // rehype-katex turns math nodes into rendered KaTeX, then highlight
        // (so KaTeX output isn't treated as code) and slug last.
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight, rehypeSlug]}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
