"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addFoodRequest, getFoodRequests } from "@/lib/data-service"
import type { Status, User, FoodRequest } from "@/lib/types"
import { ShoppingBag, Check } from "lucide-react"

interface RequestFormProps {
  volunteer: User | null | undefined
  currentUser: User
  status: Status
  onStatusUpdate: (newState: string) => void
  planningId: string
}

export default function RequestForm({ volunteer, currentUser, status, onStatusUpdate, planningId }: RequestFormProps) {
  const [request, setRequest] = useState("")
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<FoodRequest[]>([])

  const isVolunteer = volunteer?.id === currentUser.id

  // Fetch existing requests
  useEffect(() => {
    async function fetchRequests() {
      try {
        const data = await getFoodRequests(planningId)
        setRequests(data)
      } catch (error) {
        console.error("Failed to fetch requests:", error)
      }
    }

    fetchRequests()

    // Poll for new requests
    const interval = setInterval(fetchRequests, 5000)
    return () => clearInterval(interval)
  }, [planningId])

  // Check if current user has already submitted a request
  const hasSubmittedRequest = requests.some((r) => r.userId === currentUser.id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!request.trim()) return

    setLoading(true)
    try {
      const newRequest = await addFoodRequest(planningId, {
        userId: currentUser.id,
        volunteerId: volunteer?.id || "",
        request,
        status: "pending",
      })

      setRequests([...requests, newRequest])
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

                {requests.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Current Requests:</h4>
                    <ul className="space-y-2 bg-white p-3 rounded-md">
                      {requests.map((req) => (
                        <li key={req.id} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                          <span className="font-medium">{req.request}</span>
                          <span className="text-xs ml-2 text-blue-500">{'('+ req.userId + ')'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button onClick={() => onStatusUpdate("picked up")} className="w-full">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  I've Picked Up the Food
                </Button>
              </div>
            ) : (
              <>
                {hasSubmittedRequest ? (
                  <div>
                    <p className="text-sm mb-4">You've submitted your request. Wait for the food to be picked up.</p>

                    {requests.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">All Requests:</h4>
                        <ul className="space-y-2 bg-white p-3 rounded-md">
                          {requests.map((req) => (
                            <li key={req.id} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                              <span className="font-medium">{req.request}</span>
                              {req.userId === currentUser.id && (
                                <span className="text-xs ml-2 text-blue-500">(yours)</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
          </>
        )}

        {status.state === "picked up" && (
          <div className="space-y-4">
            <p className="text-sm">
              {isVolunteer
                ? "You've picked up the food. Mark as delivered when you've distributed it."
                : `${volunteer?.name} has picked up the food and will deliver it soon.`}
            </p>

            {requests.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Orders:</h4>
                <ul className="space-y-2 bg-white p-3 rounded-md">
                  {requests.map((req) => (
                    <li key={req.id} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                      <span className="font-medium">{req.request}</span>
                      {req.userId === currentUser.id && <span className="text-xs ml-2 text-blue-500">(yours)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
