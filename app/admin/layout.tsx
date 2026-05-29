export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { StudioLayout } from "@/components/admin/StudioLayout"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "admin") redirect("/")

  return (
    <StudioLayout email={session.user.email ?? ""}>
      {children}
    </StudioLayout>
  )
}
