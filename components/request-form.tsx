"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addFoodRequest } from "@/lib/data-service"
import type { Status, User } from "@/lib/types"
import { ShoppingBag, Check } from "lucide-react"

interface RequestFormProps {
  volunteer: User | null | undefined
  currentUser: User
  status: Status
  onStatusUpdate: (newState: string) => void
}

export default function RequestForm({ volunteer, currentUser, status, onStatusUpdate }: RequestFormProps) {
  const [request, setRequest] = useState("")
  const [loading, setLoading] = useState(false)

  const isVolunteer = volunteer?.id === currentUser.id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!request.trim()) return

    setLoading(true)
    try {
      await addFoodRequest({
        userId: currentUser.id,
        volunteerId: volunteer?.id || "",
        request,
        status: "pending",
      })

      setRequest("")
    } catch (error) {
      console.error("Failed to add food request:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg">
          {isVolunteer ? "You are getting the food" : `${volunteer?.name} is getting the food`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status.state === "ordering" && (
          <>
            {isVolunteer ? (
              <div className="space-y-4">
                <p className="text-sm">
                  You've volunteered to get the food. Wait for your colleagues to add their requests, then mark when
                  you've picked up the food.
                </p>
                <Button onClick={() => onStatusUpdate("picked up")} className="w-full">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  I've Picked Up the Food
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="request">What would you like to order?</Label>
                  <Input
                    id="request"
                    placeholder="e.g., Pepperoni Pizza, Chicken Salad"
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading || !request.trim()} className="w-full">
                  {loading ? "Adding..." : "Add My Order"}
                </Button>
              </form>
            )}
          </>
        )}

        {status.state === "picked up" && (
          <div className="space-y-4">
            <p className="text-sm">
              {isVolunteer
                ? "You've picked up the food. Mark as delivered when you've distributed it."
                : `${volunteer?.name} has picked up the food and will deliver it soon.`}
            </p>
            {isVolunteer && (
              <Button onClick={() => onStatusUpdate("delivered")} className="w-full">
                <Check className="h-4 w-4 mr-2" />
                I've Delivered the Food
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
