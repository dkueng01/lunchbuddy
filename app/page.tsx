import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Users, Vote, ShoppingBag, Clock } from "lucide-react"
import { createPlanningSession } from "@/lib/data-service"

export default function LandingPage() {
  return (
    <main className="container max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">LunchBuddy</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Solve the daily "where to eat?" problem with your team. Coordinate lunch plans easily and efficiently.
        </p>
      </div>

      <div className="text-center mb-12">
        <form
          action={async () => {
            "use server"
            const sessionId = await createPlanningSession()
            return { sessionId }
          }}
        >
          <Button size="lg" className="gap-2" type="submit">
            Start Planning Lunch
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-2 text-sm text-muted-foreground">
          No sign-up required. Just create a session and share the link.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
        <FeatureCard
          icon={<Users className="h-8 w-8 text-blue-500" />}
          title="Team Coordination"
          description="Bring your team together to decide on lunch options without the back-and-forth messages."
        />
        <FeatureCard
          icon={<Vote className="h-8 w-8 text-green-500" />}
          title="Democratic Voting"
          description="Vote for your favorite options and see what's most popular in real-time."
        />
        <FeatureCard
          icon={<ShoppingBag className="h-8 w-8 text-amber-500" />}
          title="Volunteer System"
          description="Easily volunteer to pick up food and collect everyone's orders in one place."
        />
        <FeatureCard
          icon={<Clock className="h-8 w-8 text-purple-500" />}
          title="Status Tracking"
          description="Track the lunch process from planning to delivery with clear status updates."
        />
      </div>

      <div className="bg-slate-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-center">How It Works</h2>
        <ol className="space-y-4 max-w-2xl mx-auto">
          <li className="flex gap-3">
            <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <p className="font-medium">Create a planning session</p>
              <p className="text-muted-foreground">
                Start a new lunch planning session and share the link with your team.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <p className="font-medium">Add and vote for lunch options</p>
              <p className="text-muted-foreground">
                Team members can suggest places to eat and vote for their favorites.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <p className="font-medium">Volunteer to get the food</p>
              <p className="text-muted-foreground">
                Once voting is complete, someone can volunteer to pick up or order the food.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 font-bold">
              4
            </div>
            <div>
              <p className="font-medium">Submit your order</p>
              <p className="text-muted-foreground">Team members can specify exactly what they want to order.</p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 font-bold">
              5
            </div>
            <div>
              <p className="font-medium">Track status and enjoy lunch</p>
              <p className="text-muted-foreground">
                Follow the status from ordering to delivery, then enjoy your meal!
              </p>
            </div>
          </li>
        </ol>
      </div>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-center">{icon}</div>
        <h3 className="font-semibold text-lg mb-2 text-center">{title}</h3>
        <p className="text-sm text-muted-foreground text-center">{description}</p>
      </CardContent>
    </Card>
  )
}
