import { Suspense } from "react"
import Link from "next/link"
import { getPostBySlug } from "@/lib/queries"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer"
import { CommentSection } from "@/components/blog/CommentSection"
import { Backlinks } from "@/components/blog/Backlinks"
import { RelatedNotes } from "@/components/blog/RelatedNotes"
import { formatDateLong } from "@/lib/utils"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  try {
    const { slug } = await params
    const post = await getPostBySlug(decodeURIComponent(slug))
    if (!post) return { title: "Not Found" }
    return {
      title: post.title,
      description: post.summary ?? undefined,
    }
  } catch {
    return { title: "Not Found" }
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  let post
  try {
    post = await getPostBySlug(decodedSlug)
  } catch (e) {
    console.error("PostPage: getPostBySlug failed:", e)
    notFound()
  }

  const t = await getTranslations("post")

  if (!post || !post.published) {
    notFound()
  }

  const tags = post.tags.map((pt) => pt.tag)

  return (
    <article>
      {/* Article header — restrained, part of the system */}
      <header className="mx-auto max-w-2xl px-5 sm:px-6 pt-14 sm:pt-16 pb-8">
        <div className="mb-5 flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground/45">
          <time dateTime={post.publishedAt?.toISOString()}>
            {post.publishedAt ? formatDateLong(post.publishedAt) : t("draft")}
          </time>
          {post.category && (
            <>
              <span className="text-border/60">·</span>
              <Link
                href={`/categories/${post.category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {post.category.title}
              </Link>
            </>
          )}
          <span className="text-border/60">·</span>
          <span>{post.author.name}</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-medium leading-snug tracking-tight text-balance">
          {post.title}
        </h1>

        {post.summary && (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground/80">
            {post.summary}
          </p>
        )}

        {tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1.5">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="font-mono text-xs text-muted-foreground/45 hover:text-foreground transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Article content — optimal reading experience */}
      <div className="mx-auto max-w-2xl px-5 sm:px-6 pt-4 pb-16 border-t border-border/40">
        {post.content && <MarkdownRenderer content={post.content} />}
      </div>

      {/* Backlinks - knowledge connections */}
      <div className="mx-auto max-w-2xl px-5 sm:px-6 pb-10">
        <Suspense>
          <Backlinks postId={post.id} />
        </Suspense>
      </div>

      {/* Related Notes - shared topics */}
      <div className="mx-auto max-w-2xl px-5 sm:px-6 pb-10">
        <Suspense>
          <RelatedNotes postId={post.id} tags={tags} categoryId={post.categoryId} />
        </Suspense>
      </div>

      {/* Comments - separated section */}
      <div className="mx-auto max-w-2xl px-5 sm:px-6 pb-16 sm:pb-20">
        <Suspense>
          <CommentSection postId={post.id} />
        </Suspense>
      </div>
    </article>
  )
}
