import { getPublishedPosts, getAllCategories } from "@/lib/queries"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home")
  return {
    title: t("siteTitle"),
    description: t("tagline"),
  }
}

export default async function HomePage() {
  const t = await getTranslations("home")

  // Get recent posts
  const { posts } = await getPublishedPosts({ page: 1, pageSize: 5 })

  // Get categories
  const categories = await getAllCategories()

  return (
    <div className="min-h-screen">
      {/* Subtle grid background */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        {/* Hero / Introduction */}
        <header className="mb-20">
          <div className="flex items-start gap-6 mb-8">
            {/* Avatar placeholder - you can replace with actual image */}
            <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center text-2xl font-serif">
              S
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-serif mb-3 tracking-tight">
                {t("heroName")}
              </h1>
              <p className="text-muted-foreground leading-relaxed max-w-xl">
                {t("heroIntro")}
              </p>
            </div>
          </div>

          {/* Simple navigation */}
          <nav className="flex gap-6 text-sm">
            <Link href="/posts" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("navWriting")}
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("navAbout")}
            </Link>
            <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("navSearch")}
            </Link>
          </nav>
        </header>

        {/* Knowledge Areas / Categories */}
        {categories.length > 0 && (
          <section className="mb-20">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6 font-mono">
              {t("knowledgeAreas")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="inline-flex items-baseline gap-2 px-3 py-1.5 text-sm border border-border/50 hover:border-border hover:bg-muted/30 transition-colors rounded"
                >
                  <span>{category.title}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {category._count.documents}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent Writing */}
        <section className="mb-20">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-8 font-mono">
            {t("recentWriting")}
          </h2>

          {posts.length === 0 ? (
            <p className="text-muted-foreground italic">
              {t("noPostsYet")}
            </p>
          ) : (
            <div className="space-y-12">
              {posts.map((post, index) => (
                <article key={post.id} className="group">
                  <Link href={`/posts/${post.slug}`} className="block">
                    {/* Date and category */}
                    <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground font-mono">
                      <time dateTime={post.publishedAt?.toISOString()}>
                        {post.publishedAt?.toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }).replace(/\//g, '.')}
                      </time>
                      {post.category && (
                        <>
                          <span className="text-border">·</span>
                          <span>{post.category.title}</span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-serif mb-3 group-hover:text-muted-foreground transition-colors leading-snug">
                      {post.title}
                    </h3>

                    {/* Summary */}
                    {post.summary && (
                      <p className="text-muted-foreground leading-relaxed line-clamp-2">
                        {post.summary}
                      </p>
                    )}

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.slice(0, 3).map((pt) => (
                          <span
                            key={pt.tag.id}
                            className="text-xs text-muted-foreground font-mono"
                          >
                            #{pt.tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>

                  {/* Divider for all but last item */}
                  {index < posts.length - 1 && (
                    <hr className="mt-12 border-border/50" />
                  )}
                </article>
              ))}
            </div>
          )}

          {/* View all link */}
          {posts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border/50">
              <Link
                href="/posts"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
              >
                {t("viewAllPosts")} →
              </Link>
            </div>
          )}
        </section>

        {/* Footer note */}
        <footer className="pt-12 border-t border-border/50">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("footerNote")}
          </p>
        </footer>
      </div>
    </div>
  )
}
