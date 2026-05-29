"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Toaster } from "sonner"

interface StudioLayoutProps {
  email: string
  children: React.ReactNode
}

export function StudioLayout({ email, children }: StudioLayoutProps) {
  const t = useTranslations("studio")
  const tc = useTranslations("common")
  const pathname = usePathname()

  const navigation = [
    { href: "/admin", label: t("studio"), icon: "◆" },
    { href: "/admin/posts", label: t("writing"), icon: "✎" },
    { href: "/admin/categories", label: t("paths"), icon: "⌘" },
    { href: "/admin/tags", label: t("connections"), icon: "∿" },
    { href: "/admin/comments", label: t("responses"), icon: "◉" },
  ]

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen relative">
      {/* Atmospheric background */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808004_1px,transparent_1px),linear-gradient(to_bottom,#80808004_1px,transparent_1px)] bg-[size:80px_80px]"
          style={{
            maskImage: 'linear-gradient(to bottom, black 10%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 10%, transparent 95%)'
          }}
        />
        <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-primary/[0.015] blur-[100px] rounded-full" />
      </div>

      <div className="flex">
        {/* Sidebar - refined and minimal */}
        <aside className="w-64 min-h-screen border-r border-border/20 bg-card/20 backdrop-blur-sm flex flex-col">
          {/* Header */}
          <div className="p-8 pb-12 border-b border-border/20">
            <Link href="/admin" className="block group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-muted/60 to-muted/30 border border-border/30 flex items-center justify-center text-sm font-serif">
                  S
                </div>
                <h1 className="text-lg font-serif tracking-tight group-hover:text-muted-foreground transition-colors duration-300">
                  {t("studioName")}
                </h1>
              </div>
              <p className="text-xs text-muted-foreground/50 font-mono">
                {email}
              </p>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-300
                  ${isActive(item.href)
                    ? 'bg-muted/40 text-foreground'
                    : 'text-muted-foreground/70 hover:text-foreground hover:bg-muted/20'
                  }
                `}
              >
                <span className="text-base opacity-60 group-hover:opacity-100 transition-opacity">
                  {item.icon}
                </span>
                <span className="font-medium tracking-tight">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-border/20">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground/70 hover:text-foreground hover:bg-muted/20 transition-all duration-300"
            >
              <span className="text-base opacity-60">→</span>
              <span className="font-medium tracking-tight">{tc("signOut")}</span>
            </button>

            {/* Back to garden */}
            <Link
              href="/"
              className="mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground/50 hover:text-muted-foreground transition-all duration-300"
            >
              <span className="text-base opacity-60">←</span>
              <span className="font-medium tracking-tight">{t("backToGarden")}</span>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-5xl mx-auto px-12 py-16">
            {children}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  )
}
