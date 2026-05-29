import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { SearchDialog } from "@/components/layout/SearchDialog"

export async function Header() {
  const t = await getTranslations("common")

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-4xl mx-auto flex flex-col gap-2 px-4 py-3 sm:h-14 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight sm:text-2xl"
          style={{ fontFamily: "var(--font-brand)" }}
        >
          {t("siteTitle")}
        </Link>
        <nav className="flex w-full flex-wrap items-center gap-1 text-xs text-muted-foreground sm:w-auto sm:flex-nowrap sm:text-sm">
          <Link href="/posts" className="hover:text-foreground transition-colors px-2 py-1">
            {t("articles")}
          </Link>
          <Link href="/about" className="hover:text-foreground transition-colors px-2 py-1">
            {t("about")}
          </Link>
          <SearchDialog />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
