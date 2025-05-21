import { Suspense } from "react"
import LunchBoard from "@/components/lunch-board"
import LoadingState from "@/components/loading-state"

export default function Home() {
  return (
    <main className="container max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">LunchBuddy</h1>
        <p className="text-muted-foreground">Solve the daily "where to eat?" problem together</p>
      </header>

      <Suspense fallback={<LoadingState />}>
        <LunchBoard />
      </Suspense>
    </main>
  )
}
