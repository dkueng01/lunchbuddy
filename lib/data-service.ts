"use server"

import { promises as fs } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import type { LunchOption, Vote, User, Volunteer, FoodRequest, Status } from "./types"

// Path to data files
const dataDir = path.join(process.cwd(), "data")

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (error) {
    console.error("Failed to create data directory:", error)
  }
}

// Helper to read a JSON file, creating it if it doesn't exist
async function readJsonFile<T>(filename: string, defaultData: T): Promise<T> {
  await ensureDataDir()
  const filePath = path.join(dataDir, filename)

  try {
    const fileData = await fs.readFile(filePath, "utf8")
    return JSON.parse(fileData) as T
  } catch (error) {
    // If file doesn't exist, create it with default data
    await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2))
    return defaultData
  }
}

// Helper to write to a JSON file
async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir()
  const filePath = path.join(dataDir, filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

// Check if it's a new day and reset data if needed
async function checkAndResetDailyData() {
  const statusPath = path.join(dataDir, "status.json")

  try {
    // Try to read the last reset date
    const statusData = await fs.readFile(statusPath, "utf8")
    const status = JSON.parse(statusData)

    const lastReset = new Date(status.lastReset || 0)
    const today = new Date()

    // Check if it's a new day
    if (
      lastReset.getDate() !== today.getDate() ||
      lastReset.getMonth() !== today.getMonth() ||
      lastReset.getFullYear() !== today.getFullYear()
    ) {
      // Reset daily data
      await writeJsonFile("options.json", [])
      await writeJsonFile("votes.json", [])
      await writeJsonFile("volunteers.json", [])
      await writeJsonFile("requests.json", [])
      await writeJsonFile("status.json", {
        state: "planning",
        volunteerId: null,
        lastReset: today.toISOString(),
      })
    }
  } catch (error) {
    // If status file doesn't exist, create it
    const today = new Date()
    await writeJsonFile("status.json", {
      state: "planning",
      volunteerId: null,
      lastReset: today.toISOString(),
    })
  }
}

// Get all lunch data
export async function getLunchData() {
  await checkAndResetDailyData()

  // Default data
  const defaultUsers: User[] = [
    { id: "user1", name: "Alex Johnson", email: "alex@example.com" },
    { id: "user2", name: "Sam Smith", email: "sam@example.com" },
    { id: "user3", name: "Jordan Lee", email: "jordan@example.com" },
    { id: "user4", name: "Taylor Wong", email: "taylor@example.com" },
  ]

  const defaultOptions: LunchOption[] = []
  const defaultVotes: Vote[] = []

  // Read data from files
  const users = await readJsonFile<User[]>("users.json", defaultUsers)
  const options = await readJsonFile<LunchOption[]>("options.json", defaultOptions)
  const votes = await readJsonFile<Vote[]>("votes.json", defaultVotes)

  return { users, options, votes }
}

// Add a new lunch option
export async function addLunchOption(optionData: { name: string; description: string; addedBy: string }) {
  const options = await readJsonFile<LunchOption[]>("options.json", [])

  const newOption: LunchOption = {
    id: uuidv4(),
    name: optionData.name,
    description: optionData.description,
    addedBy: optionData.addedBy,
    createdAt: new Date().toISOString(),
  }

  options.push(newOption)
  await writeJsonFile("options.json", options)

  return newOption
}

// Add a vote for an option
export async function addVote(optionId: string, userId: string) {
  const votes = await readJsonFile<Vote[]>("votes.json", [])

  // Check if user already voted for this option
  const existingVote = votes.find((v) => v.userId === userId && v.optionId === optionId)

  if (existingVote) {
    // Remove the vote if it exists (toggle behavior)
    const updatedVotes = votes.filter((v) => !(v.userId === userId && v.optionId === optionId))
    await writeJsonFile("votes.json", updatedVotes)
    return updatedVotes
  } else {
    // Add new vote
    const newVote: Vote = {
      id: uuidv4(),
      userId,
      optionId,
      createdAt: new Date().toISOString(),
    }

    votes.push(newVote)
    await writeJsonFile("votes.json", votes)
    return votes
  }
}

// Get current status
export async function getStatus(): Promise<Status> {
  await checkAndResetDailyData()
  return readJsonFile<Status>("status.json", {
    state: "planning",
    volunteerId: null,
  })
}

// Update status
export async function updateStatus(state: string, volunteerId?: string): Promise<Status> {
  const status = await getStatus()

  const updatedStatus: Status = {
    state: state as Status["state"],
    volunteerId: volunteerId || status.volunteerId,
  }

  await writeJsonFile("status.json", updatedStatus)

  // If someone volunteers, record it
  if (state === "ordering" && volunteerId) {
    const volunteers = await readJsonFile<Volunteer[]>("volunteers.json", [])

    // Get the winning option
    const { options, votes } = await getLunchData()

    if (options.length > 0 && votes.length > 0) {
      // Count votes for each option
      const optionCounts = options.map((option) => ({
        optionId: option.id,
        count: votes.filter((vote) => vote.optionId === option.id).length,
      }))

      // Find winning option
      const winningOption = optionCounts.sort((a, b) => b.count - a.count)[0]

      // Record volunteer
      const newVolunteer: Volunteer = {
        id: uuidv4(),
        userId: volunteerId,
        optionId: winningOption.optionId,
        date: new Date().toISOString(),
      }

      volunteers.push(newVolunteer)
      await writeJsonFile("volunteers.json", volunteers)
    }
  }

  return updatedStatus
}

// Add a food request
export async function addFoodRequest(requestData: {
  userId: string
  volunteerId: string
  request: string
  status: string
}): Promise<FoodRequest> {
  const requests = await readJsonFile<FoodRequest[]>("requests.json", [])

  const newRequest: FoodRequest = {
    id: uuidv4(),
    userId: requestData.userId,
    volunteerId: requestData.volunteerId,
    request: requestData.request,
    status: requestData.status as "pending" | "fulfilled",
    createdAt: new Date().toISOString(),
  }

  requests.push(newRequest)
  await writeJsonFile("requests.json", requests)

  return newRequest
}

// Get all food requests
export async function getFoodRequests(): Promise<FoodRequest[]> {
  return readJsonFile<FoodRequest[]>("requests.json", [])
}
