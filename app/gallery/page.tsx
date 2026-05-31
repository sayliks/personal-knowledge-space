import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import { getPublishedPhotos } from "@/lib/queries"
import { PhotoWall } from "@/components/blog/PhotoWall"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("posts")

  return {
    title: t("gallery"),
    description: t("gallery"),
  }
}

export default async function GalleryPage() {
  const t = await getTranslations("posts")
  const photos = await getPublishedPhotos()

  return (
    <div className="mx-auto max-w-[908px] px-5 sm:px-6">
      <header className="pt-14 pb-8 sm:pt-20">
        <h1 className="font-mono text-xs lowercase tracking-wide text-muted-foreground/50">
          {t("gallery")}
        </h1>
      </header>

      <div className="border-t border-border/40 pt-6 pb-10">
        {photos.length === 0 ? (
          <p className="text-sm italic text-muted-foreground/50">No photos yet</p>
        ) : (
          <PhotoWall photos={photos} />
        )}
      </div>
    </div>
  )
}
