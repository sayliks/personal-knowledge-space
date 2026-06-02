import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { SayliksSplash } from "./SayliksSplash"
import { getPublishedPosts, getPublishedPhotos, getPublishedQuotes } from "@/lib/queries"
import { PhotoWall } from "@/components/blog/PhotoWall"
import { DailyQuote } from "@/components/blog/DailyQuote"
import { HomePostFeed } from "@/components/blog/HomePostFeed"
import { HomeQuoteFeed } from "@/components/blog/HomeQuoteFeed"

export const dynamic = "force-dynamic"
const HOME_FEED_PAGE_SIZE = 6

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home")

  return {
    title: t("siteTitle"),
    description: t("tagline"),
  }
}

export default async function HomePage() {
  const tPosts = await getTranslations("posts")
  const tCommon = await getTranslations("common")
  const cookieStore = await cookies()
  const shouldPlayIntro = cookieStore.get("sayliks_intro_seen")?.value !== "1"
  const [postsResult, photos, quotesResult] = await Promise.all([
    getPublishedPosts({ page: 1, pageSize: HOME_FEED_PAGE_SIZE }),
    getPublishedPhotos(),
    getPublishedQuotes({ page: 1, pageSize: HOME_FEED_PAGE_SIZE }),
  ])
  const displayPhotos = photos.slice(0, 16)
  const feedLabels = {
    loadMore: tPosts("loadMore"),
    loadingMore: tPosts("loadingMore"),
    allLoaded: tPosts("allLoaded"),
  }

  return (
    <>
      <SayliksSplash shouldPlay={shouldPlayIntro} />
      <div className="mx-auto max-w-[908px] px-5 sm:px-6">
        {/* Daily Quote Section */}
        <div className="pt-14 pb-8 sm:pt-20">
          <DailyQuote />
        </div>

        {/* Quotes Section */}
        <section className="pb-10">
          <header className="pb-8">
            <h1 className="font-mono text-xs lowercase tracking-wide text-muted-foreground font-medium">
              {tPosts("quotes")}
            </h1>
          </header>

          <div className="border-t border-border/40 pt-6">
            <HomeQuoteFeed
              initialQuotes={quotesResult.quotes.map((quote) => ({
                id: quote.id,
                title: quote.title,
                content: quote.content,
                publishedAt: quote.publishedAt?.toISOString() ?? null,
                createdAt: quote.createdAt.toISOString(),
                updatedAt: quote.updatedAt.toISOString(),
              }))}
              pageSize={HOME_FEED_PAGE_SIZE}
              total={quotesResult.total}
              labels={{
                noItems: tPosts("noQuotes"),
                ...feedLabels,
              }}
            />
          </div>
        </section>

        {/* Writing Section */}
        <section id="blog" className="blog-panel" aria-labelledby="blog-heading">
          <header className="blog-panel-header flex items-center justify-between gap-4">
            <h1
              id="blog-heading"
              className="font-mono text-xs lowercase tracking-wide text-muted-foreground font-medium"
            >
              {tPosts("title")}
            </h1>
            <Link
              href="/posts"
              className="font-mono text-xs lowercase tracking-wide text-muted-foreground/50 transition-colors hover:text-foreground shrink-0"
            >
              {tPosts("viewAll")}
            </Link>
          </header>

          <div className="blog-panel-list">
            <HomePostFeed
              initialPosts={postsResult.posts.map((post) => ({
                id: post.id,
                title: post.title,
                slug: post.slug,
                summary: post.summary,
                coverImage: post.coverImage,
                publishedAt: post.publishedAt?.toISOString() ?? null,
                updatedAt: post.updatedAt.toISOString(),
                category: post.category
                  ? {
                      title: post.category.title,
                    }
                  : null,
              }))}
              pageSize={HOME_FEED_PAGE_SIZE}
              total={postsResult.total}
              labels={{
                noItems: tPosts("noPosts"),
                tended: tCommon("tended"),
                ...feedLabels,
              }}
            />
          </div>
        </section>

        {/* Photo Wall Section */}
        {photos.length > 0 && (
          <>
            <header className="pt-8 pb-6 flex items-center justify-between gap-4">
              <h2 className="font-mono text-xs lowercase tracking-wide text-muted-foreground font-medium">
                {tPosts("gallery")}
              </h2>
              <Link
                href="/gallery"
                className="font-mono text-xs lowercase tracking-wide text-muted-foreground/50 hover:text-foreground transition-colors shrink-0"
              >
                {tPosts("viewAll")}
              </Link>
            </header>

            <div className="border-t border-border/40 pt-6 pb-10">
              <PhotoWall photos={displayPhotos} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
