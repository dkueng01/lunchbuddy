"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface NameEntryModalProps {
  onNameSubmit: (name: string) => void
}

export default function NameEntryModal({ onNameSubmit }: NameEntryModalProps) {
  const [name, setName] = useState("")
  const [open, setOpen] = useState(true)
  const [error, setError] = useState("")

  // Check if user already has a name in localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("lunchbuddy-username")
    if (savedName) {
      onNameSubmit(savedName)
      setOpen(false)
    }
  }, [onNameSubmit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    // Save name to localStorage
    localStorage.setItem("lunchbuddy-username", name.trim())
    onNameSubmit(name.trim())
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to LunchBuddy</DialogTitle>
          <DialogDescription>
            Please enter your name to continue. This helps your team identify you when planning lunch.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-2 py-4">
            <Label htmlFor="name" className="text-right">
              Your Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError("")
              }}
              placeholder="Enter your name"
              className={error ? "border-red-500" : ""}
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">Continue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
