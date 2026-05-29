import { getPublishedPosts, getAllCategories } from "@/lib/queries"
import { getTranslations } from "next-intl/server"
import { PostCard } from "@/components/blog/PostCard"
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
  const tAbout = await getTranslations("about")
  const tPosts = await getTranslations("posts")

  const { posts } = await getPublishedPosts({ page: 1, pageSize: 6 })
  const categories = await getAllCategories()

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section - Minimalist & Typography-focused */}
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-20">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              {tAbout("bio")}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 text-foreground hover:opacity-70 transition-opacity font-medium group"
            >
              {t("explorePosts")}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {t("aboutMe")}
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Posts - Clean List */}
      <section className="max-w-3xl mx-auto px-4 py-16 md:py-20">
        <div className="flex items-baseline justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            {t("recentPosts")}
          </h2>
          <Link
            href="/posts"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("viewAll")} →
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">
            {tPosts("noPosts")}
          </p>
        ) : (
          <div className="space-y-12">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Categories - Minimal Grid */}
      {categories.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 py-16 md:py-20 border-t border-border/40">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">
            {t("categories")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group block p-6 border border-border/40 hover:border-border transition-colors"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-medium group-hover:text-foreground transition-colors">
                    {category.title}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {category._count.documents}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Simple CTA */}
      <section className="max-w-3xl mx-auto px-4 py-20 md:py-24">
        <div className="text-center space-y-6">
          <p className="text-xl text-muted-foreground">
            {t("ctaDescription")}
          </p>
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-foreground hover:opacity-70 transition-opacity font-medium text-lg group"
          >
            {t("startReading")}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
