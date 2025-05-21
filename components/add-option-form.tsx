"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { addLunchOption } from "@/lib/data-service"
import type { User } from "@/lib/types"

interface AddOptionFormProps {
  onOptionAdded: (option: any) => void
  currentUser: User
}

export default function AddOptionForm({ onOptionAdded, currentUser }: AddOptionFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    setLoading(true)
    try {
      const newOption = await addLunchOption({
        name,
        description,
        addedBy: currentUser.id,
      })

      onOptionAdded(newOption)
      setName("")
      setDescription("")
    } catch (error) {
      console.error("Failed to add lunch option:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Lunch Option</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant/Food Name</Label>
            <Input
              id="name"
              placeholder="e.g., Pizza Place, Salad Bar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Any details about the food, location, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? "Adding..." : "Add Option"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
