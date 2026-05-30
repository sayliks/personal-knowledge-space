import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { KnowledgeGraph } from "@/components/blog/KnowledgeGraph"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("graph")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default async function GraphPage() {
  const t = await getTranslations("graph")

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <header className="mx-auto mb-8 max-w-2xl">
        <h1 className="font-mono text-xs lowercase tracking-wide text-muted-foreground/50">
          {t("title")}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground/75">
          {t("description")}
        </p>
      </header>

      <KnowledgeGraph />
    </main>
  )
}
