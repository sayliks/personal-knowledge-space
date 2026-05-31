import { prisma } from "@/lib/prisma"

export async function getAnalyticsStats(days = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [totalViews, uniqueVisitors, topPages, recentVisits] = await Promise.all([
    // Total page views
    prisma.pageView.count({
      where: { createdAt: { gte: startDate } },
    }),

    // Unique visitors (by IP)
    prisma.pageView.findMany({
      where: { createdAt: { gte: startDate } },
      select: { ip: true },
      distinct: ["ip"],
    }).then((results) => results.length),

    // Top pages
    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: startDate } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),

    // Recent visits
    prisma.pageView.findMany({
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ])

  return {
    totalViews,
    uniqueVisitors,
    topPages,
    recentVisits,
  }
}

export async function getVisitorsByDay(days = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const views = await prisma.pageView.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true },
  })

  // Group by day
  const viewsByDay: Record<string, number> = {}
  views.forEach((view) => {
    const day = view.createdAt.toISOString().split("T")[0]
    viewsByDay[day] = (viewsByDay[day] || 0) + 1
  })

  return Object.entries(viewsByDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
