import { getTranslations } from "next-intl/server"
import { getAnalyticsStats, getVisitorsByDay } from "@/lib/analytics"

export const dynamic = "force-dynamic"

function formatDate(date: Date) {
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })
}

export default async function AnalyticsPage() {
  const t = await getTranslations("admin")
  const stats = await getAnalyticsStats(7)
  const dailyViews = await getVisitorsByDay(7)

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-medium mb-2">{t("analytics")}</h1>
        <p className="text-sm text-muted-foreground">{t("last7Days")}</p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-border/40 rounded-lg p-6">
          <div className="text-sm text-muted-foreground mb-1">{t("totalViews")}</div>
          <div className="text-3xl font-semibold">{stats.totalViews}</div>
        </div>
        <div className="border border-border/40 rounded-lg p-6">
          <div className="text-sm text-muted-foreground mb-1">{t("uniqueVisitors")}</div>
          <div className="text-3xl font-semibold">{stats.uniqueVisitors}</div>
        </div>
      </div>

      {/* Daily Views Chart */}
      <div className="border border-border/40 rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">{t("dailyViews")}</h2>
        <div className="space-y-2">
          {dailyViews.map((day) => (
            <div key={day.date} className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground w-24">{day.date}</div>
              <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (day.count / Math.max(...dailyViews.map(d => d.count))) * 100)}%`,
                  }}
                />
              </div>
              <div className="text-sm font-medium w-12 text-right">{day.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Pages */}
      <div className="border border-border/40 rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">{t("topPages")}</h2>
        <div className="space-y-3">
          {stats.topPages.map((page) => (
            <div key={page.path} className="flex items-center justify-between">
              <div className="text-sm font-mono truncate flex-1">{page.path}</div>
              <div className="text-sm font-medium ml-4">{page._count.path} {t("views")}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Visits */}
      <div className="border border-border/40 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border/40">
          <h2 className="text-lg font-medium">{t("recentVisits")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-4 py-2.5 text-xs font-medium">{t("time")}</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium">{t("path")}</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium">{t("ip")}</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium">{t("userAgent")}</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium">{t("referer")}</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentVisits.map((visit) => (
                <tr key={visit.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(visit.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono max-w-xs truncate">
                    {visit.path}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">
                    {visit.ip || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate">
                    {visit.userAgent || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate">
                    {visit.referer || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
