import { Suspense } from "react"
import { redirect } from "next/navigation"
import LunchBoard from "@/components/lunch-board"
import LoadingState from "@/components/loading-state"
import { getPlanningSession } from "@/lib/data-service"

export default async function PlanningPage({ params }: { params: { id: string } }) {
  // Check if planning session exists
  const session = await getPlanningSession(params.id)

  // If session doesn't exist, redirect to home
  if (!session) {
    redirect("/")
  }

  return (
    <main className="container max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">LunchBuddy</h1>
        <p className="text-muted-foreground">Planning session: {params.id}</p>
      </header>

      <Suspense fallback={<LoadingState />}>
        <LunchBoard planningId={params.id} />
      </Suspense>
    </main>
  )
}
