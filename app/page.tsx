import { getAllCategories, getAllTags, getHomePosts } from "@/lib/queries"
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

function isTransientPrismaError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return (
    error.message.includes("Connection terminated unexpectedly") ||
    error.message.includes("Operation has timed out") ||
    error.message.includes("P1001")
  )
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function safeHomeQuery<T>(label: string, query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query()
  } catch (error) {
    if (isTransientPrismaError(error)) {
      await delay(100)
      try {
        return await query()
      } catch (retryError) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`HomePage: ${label} query retry failed:`, retryError)
        }
        return fallback
      }
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(`HomePage: ${label} query failed:`, error)
    }
    return fallback
  }
}

export default async function HomePage() {
  const t = await getTranslations("home")

  const posts = await safeHomeQuery("posts", () => getHomePosts(6), [])
  const categories = await safeHomeQuery("categories", () => getAllCategories(), [])
  const tags = await safeHomeQuery("tags", () => getAllTags(), [])

  const sortedTags = [...tags]
    .sort((a, b) => b._count.documents - a._count.documents)
    .filter((tag) => tag._count.documents > 0)

  const modules = [
    {
      label: t("moduleNotes"),
      description: t("moduleNotesDesc"),
      href: "/posts",
      count: posts.length ? t("moduleCount", { count: posts.length }) : t("moduleOpen"),
      active: true,
    },
    {
      label: t("moduleTools"),
      description: t("moduleToolsDesc"),
      href: "/search",
      count: t("moduleSearch"),
      active: false,
    },
    {
      label: t("moduleGuides"),
      description: t("moduleGuidesDesc"),
      // TODO: Replace with a dedicated /guides route when the knowledge-base guide surface exists.
      href: categories[0] ? `/categories/${categories[0].slug}` : "/posts",
      count: categories.length ? t("moduleCount", { count: categories.length }) : t("moduleOpen"),
      active: false,
    },
    {
      label: t("moduleProjects"),
      description: t("moduleProjectsDesc"),
      // TODO: Replace with a dedicated /projects route when project documents are modeled separately.
      href: sortedTags[0] ? `/tags/${sortedTags[0].slug}` : "/about",
      count: sortedTags.length ? t("moduleCount", { count: sortedTags.length }) : t("moduleOpen"),
      active: false,
    },
  ]

  return (
    <main className="knowledge-home mx-auto w-full max-w-[1180px] px-5 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-18">
      <section className="max-w-4xl">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/38">
            {t("indexLabel")}
          </p>
          <h1 className="knowledge-hero-statement mt-6 max-w-4xl text-balance">
            {t("knowledgeStatement")}{" "}
            <span className="knowledge-hero-highlight">{t("knowledgeHighlight")}</span>
          </h1>

          <nav aria-label={t("moduleNavigation")} className="mt-12 border-b border-foreground/10 sm:mt-16 dark:border-white/10">
            {modules.map((module, index) => (
              <Link
                key={module.label}
                href={module.href}
                data-active={module.active ? "true" : undefined}
                className="kb-index-row group grid gap-3 border-t border-foreground/10 py-5 transition-colors hover:border-foreground/28 dark:border-white/10 dark:hover:border-white/24 sm:grid-cols-[4rem_minmax(0,1fr)_12rem_2rem] sm:items-baseline"
              >
                <span className="hidden font-mono text-[11px] text-muted-foreground/38 sm:block">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="knowledge-module-label text-[clamp(36px,10vw,68px)] font-medium leading-[0.94] tracking-[-0.025em] transition-colors">
                  {module.label}
                </span>
                <span className="max-w-[15rem] text-xs leading-5 text-muted-foreground/64 transition-colors group-hover:text-muted-foreground">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/42">
                    {module.count}
                  </span>
                  {module.description}
                </span>
                <span className="self-start justify-self-start font-mono text-2xl leading-none text-muted-foreground/28 transition-transform group-hover:translate-x-1 group-hover:text-foreground/66 sm:self-center">
                  →
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </section>

    </main>
  )
}
