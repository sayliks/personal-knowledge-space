"use client"

import { SearchDialog } from "@/components/layout/SearchDialog"
import { NavigationMenu } from "@/components/layout/NavigationMenu"

type HeaderNavProps = {
  labels: {
    articles: string
    graph: string
    about: string
    search: string
  }
}

export function HeaderNav({ labels }: HeaderNavProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <SearchDialog />
      <NavigationMenu labels={labels} />
    </div>
  )
}
