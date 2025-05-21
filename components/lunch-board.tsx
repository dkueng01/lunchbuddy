"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, Clock, ShoppingBag, Check, Plus } from "lucide-react"
import AddOptionForm from "@/components/add-option-form"
import VolunteerSection from "@/components/volunteer-section"
import RequestForm from "@/components/request-form"
import { getLunchData, addVote, getStatus, updateStatus } from "@/lib/data-service"
import type { LunchOption, Status, User, Vote } from "@/lib/types"

export default function LunchBoard() {
  const [options, setOptions] = useState<LunchOption[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [status, setStatus] = useState<Status>({ state: "planning", volunteerId: null })
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)

  // Current user - in a real app, this would come from authentication
  const currentUser = users[0] || { id: "user1", name: "Demo User" }

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const data = await getLunchData()
        setOptions(data.options)
        setVotes(data.votes)
        setUsers(data.users)
        const currentStatus = await getStatus()
        setStatus(currentStatus)
      } catch (error) {
        console.error("Failed to load lunch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle voting for an option
  const handleVote = async (optionId: string) => {
    if (status.state !== "planning") return

    try {
      const updatedVotes = await addVote(optionId, currentUser.id)
      setVotes(updatedVotes)
    } catch (error) {
      console.error("Failed to add vote:", error)
    }
  }

  // Update the lunch status
  const handleStatusUpdate = async (newState: string, volunteerId?: string) => {
    try {
      const updatedStatus = await updateStatus(newState, volunteerId)
      setStatus(updatedStatus)
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  // Calculate vote counts for each option
  const getVoteCount = (optionId: string) => {
    return votes.filter((vote) => vote.optionId === optionId).length
  }

  // Check if current user has voted for an option
  const hasVoted = (optionId: string) => {
    return votes.some((vote) => vote.optionId === optionId && vote.userId === currentUser.id)
  }

  // Get the winning option (most votes)
  const getWinningOption = () => {
    if (options.length === 0) return null

    const optionCounts = options.map((option) => ({
      option,
      count: getVoteCount(option.id),
    }))

    return optionCounts.sort((a, b) => b.count - a.count)[0].option
  }

  // Get volunteer user
  const getVolunteer = () => {
    if (!status.volunteerId) return null
    return users.find((user) => user.id === status.volunteerId)
  }

  // Determine if voting phase is complete (at least 3 votes total)
  const isVotingComplete = votes.length >= 1

  // Status badge component
  const StatusBadge = () => {
    const statusMap = {
      planning: { label: "Planning", icon: <Clock className="h-3 w-3 mr-1" /> },
      ordering: { label: "Ordering", icon: <ShoppingBag className="h-3 w-3 mr-1" /> },
      "picked up": { label: "Picked Up", icon: <ShoppingBag className="h-3 w-3 mr-1" /> },
      delivered: { label: "Delivered", icon: <Check className="h-3 w-3 mr-1" /> },
    }

    const statusInfo = statusMap[status.state as keyof typeof statusMap]

    return (
      <Badge variant="outline" className="ml-2">
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">Today's Lunch Options</h2>
          <StatusBadge />
        </div>

        {status.state === "planning" && (
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} variant={showAddForm ? "outline" : "default"}>
            <Plus className="h-4 w-4 mr-1" />
            {showAddForm ? "Cancel" : "Add Option"}
          </Button>
        )}
      </div>

      {showAddForm && (
        <AddOptionForm
          onOptionAdded={(newOption) => {
            setOptions([...options, newOption])
            setShowAddForm(false)
          }}
          currentUser={currentUser}
        />
      )}

      {options.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No lunch options yet. Be the first to add one!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {options.map((option) => (
            <Card key={option.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{option.name}</CardTitle>
                <CardDescription>
                  Added by {users.find((u) => u.id === option.addedBy)?.name || "Unknown"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{option.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-0">
                <div className="text-sm text-muted-foreground">
                  {getVoteCount(option.id)} vote{getVoteCount(option.id) !== 1 ? "s" : ""}
                </div>
                {status.state === "planning" && (
                  <Button
                    variant={hasVoted(option.id) ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleVote(option.id)}
                    disabled={loading}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {hasVoted(option.id) ? "Voted" : "Vote"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {status.state === "planning" && isVotingComplete && (
        <VolunteerSection
          winningOption={getWinningOption()}
          currentUser={currentUser}
          onVolunteer={() => handleStatusUpdate("ordering", currentUser.id)}
        />
      )}

      {(status.state === "ordering" || status.state === "picked up") && (
        <RequestForm
          volunteer={getVolunteer()}
          currentUser={currentUser}
          status={status}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {status.state === "delivered" && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-medium text-lg">Lunch has been delivered!</h3>
            <p className="text-muted-foreground">Enjoy your meal!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
