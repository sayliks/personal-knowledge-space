import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { SearchDialog } from "@/components/layout/SearchDialog"

export async function Header() {
  const t = await getTranslations("common")

  return (
    <header className="border-b border-border/40">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <Link
          href="/"
          className="font-mono text-sm text-foreground/80 hover:text-foreground transition-colors"
        >
          {t("siteTitle")}
        </Link>
        <nav className="flex items-center gap-4 font-mono text-xs text-muted-foreground/60">
          <Link href="/posts" className="hover:text-foreground transition-colors">
            {t("articles")}
          </Link>
          <Link href="/about" className="hover:text-foreground transition-colors">
            {t("about")}
          </Link>
          <SearchDialog />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
