"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award } from "lucide-react"
import type { LunchOption, User } from "@/lib/types"

interface VolunteerSectionProps {
  winningOption: LunchOption | null
  currentUser: User
  onVolunteer: () => void
}

export default function VolunteerSection({ winningOption, currentUser, onVolunteer }: VolunteerSectionProps) {
  if (!winningOption) return null

  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Award className="h-5 w-5 mr-2 text-amber-500" />
          Current Winner: {winningOption.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Voting is still open, but we need someone to volunteer to get the food. Would you like to volunteer?
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={onVolunteer} className="w-full">
          I'll Volunteer to Get the Food
        </Button>
      </CardFooter>
    </Card>
  )
}
