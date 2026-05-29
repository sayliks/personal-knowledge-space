import { getTranslations } from "next-intl/server"
import { getStudioStats, getRecentPosts } from "@/lib/queries"
import Link from "next/link"

export default async function StudioDashboard() {
  const t = await getTranslations("studio")

  const [{ postCount, categoryCount, tagCount, pendingComments }, recentPosts] =
    await Promise.all([getStudioStats(), getRecentPosts(5)])

  return (
    <div className="space-y-16">
      {/* Header */}
      <header>
        <h1 className="text-4xl md:text-5xl font-serif mb-4 tracking-tight leading-tight">
          {t("welcome")}
        </h1>
        <p className="text-muted-foreground/70 leading-relaxed max-w-2xl">
          {t("welcomeMessage")}
        </p>
      </header>

      {/* Currently section */}
      <section className="pt-8 border-t border-border/20">
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-xs uppercase tracking-widest text-muted-foreground/40 font-mono">
            {t("currentlyLabel")}
          </span>
          <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
        </div>
        <p className="text-sm text-muted-foreground/60 leading-relaxed max-w-2xl">
          {t("currentlyMessage")}
        </p>
      </section>

      {/* Garden overview - subtle metrics */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground/40 mb-8 font-mono">
          {t("gardenOverview")}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <Link
            href="/admin/posts"
            className="group block space-y-2 hover:translate-x-1 transition-transform duration-300"
          >
            <div className="text-3xl font-serif text-muted-foreground/80 group-hover:text-foreground transition-colors">
              {postCount}
            </div>
            <div className="text-sm text-muted-foreground/50 font-mono">
              {t("writings")}
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="group block space-y-2 hover:translate-x-1 transition-transform duration-300"
          >
            <div className="text-3xl font-serif text-muted-foreground/80 group-hover:text-foreground transition-colors">
              {categoryCount}
            </div>
            <div className="text-sm text-muted-foreground/50 font-mono">
              {t("knowledgePaths")}
            </div>
          </Link>

          <Link
            href="/admin/tags"
            className="group block space-y-2 hover:translate-x-1 transition-transform duration-300"
          >
            <div className="text-3xl font-serif text-muted-foreground/80 group-hover:text-foreground transition-colors">
              {tagCount}
            </div>
            <div className="text-sm text-muted-foreground/50 font-mono">
              {t("connections")}
            </div>
          </Link>

          <Link
            href="/admin/comments"
            className="group block space-y-2 hover:translate-x-1 transition-transform duration-300"
          >
            <div className="text-3xl font-serif text-muted-foreground/80 group-hover:text-foreground transition-colors">
              {pendingComments}
            </div>
            <div className="text-sm text-muted-foreground/50 font-mono">
              {t("pendingResponses")}
            </div>
          </Link>
        </div>
      </section>

      {/* Recent activity timeline */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-muted-foreground/40 mb-8 font-mono">
          {t("recentActivity")}
        </h2>

        <div className="space-y-6">
          {recentPosts.map((post) => (
            <Link
              key={post.id}
              href={`/admin/posts/${post.id}/edit`}
              className="group block"
            >
              <div className="flex items-baseline gap-4">
                <time className="text-xs text-muted-foreground/40 font-mono shrink-0 w-24">
                  {post.updatedAt.toLocaleDateString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit'
                  }).replace(/\//g, '.')}
                </time>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-base font-medium group-hover:text-muted-foreground transition-colors">
                      {post.title}
                    </h3>
                    <span className={`text-xs font-mono ${
                      post.published
                        ? 'text-muted-foreground/40'
                        : 'text-primary/60'
                    }`}>
                      {post.published ? t("published") : t("draft")}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {recentPosts.length === 0 && (
          <p className="text-sm text-muted-foreground/50 italic">
            {t("noRecentActivity")}
          </p>
        )}
      </section>

      {/* Quick actions */}
      <section className="pt-8 border-t border-border/20">
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground/5 hover:bg-foreground/10 border border-border/20 hover:border-border/40 rounded-lg text-sm font-medium transition-all duration-300"
          >
            <span>+</span>
            <span>{t("newWriting")}</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border/20 hover:border-border/40 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            <span>→</span>
            <span>{t("viewGarden")}</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
