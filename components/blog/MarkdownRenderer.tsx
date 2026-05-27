import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import rehypeSlug from "rehype-slug"
import { remarkWikiLink } from "@/lib/remark-wiki-link"
import type { PluggableList } from "react-markdown"

const remarkPlugins: PluggableList = [remarkWikiLink, remarkGfm]
const rehypePlugins: PluggableList = [rehypeHighlight, rehypeSlug]

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
