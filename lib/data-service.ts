"use server"

import { promises as fs } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { redirect } from "next/navigation"
import type { LunchOption, Vote, User, Volunteer, FoodRequest, Status, PlanningSession } from "./types"

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

// Ensure planning session directory exists
async function ensurePlanningDir(planningId: string) {
  try {
    const planningDir = path.join(dataDir, "planning", planningId)
    await fs.mkdir(planningDir, { recursive: true })
    return planningDir
  } catch (error) {
    console.error(`Failed to create planning directory for ${planningId}:`, error)
    throw error
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

// Helper to read a planning session JSON file
async function readPlanningFile<T>(planningId: string, filename: string, defaultData: T): Promise<T> {
  const planningDir = await ensurePlanningDir(planningId)
  const filePath = path.join(planningDir, filename)

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

// Helper to write to a planning session JSON file
async function writePlanningFile<T>(planningId: string, filename: string, data: T): Promise<void> {
  const planningDir = await ensurePlanningDir(planningId)
  const filePath = path.join(planningDir, filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

// Check if it's a new day and reset data if needed
async function checkAndResetDailyData(planningId: string) {
  const statusPath = path.join(dataDir, "planning", planningId, "status.json")

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
      await writePlanningFile(planningId, "options.json", [])
      await writePlanningFile(planningId, "votes.json", [])
      await writePlanningFile(planningId, "volunteers.json", [])
      await writePlanningFile(planningId, "requests.json", [])
      await writePlanningFile(planningId, "status.json", {
        state: "planning",
        volunteerId: null,
        lastReset: today.toISOString(),
      })
    }
  } catch (error) {
    // If status file doesn't exist, create it
    const today = new Date()
    await writePlanningFile(planningId, "status.json", {
      state: "planning",
      volunteerId: null,
      lastReset: today.toISOString(),
    })
  }
}

// Create a new planning session
export async function createPlanningSession(): Promise<string> {
  const sessions = await readJsonFile<PlanningSession[]>("planning-sessions.json", [])

  const sessionId = uuidv4().substring(0, 8) // Shorter ID for easier sharing

  const newSession: PlanningSession = {
    id: sessionId,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  }

  sessions.push(newSession)
  await writeJsonFile("planning-sessions.json", sessions)

  // Create initial files for the planning session
  await ensurePlanningDir(sessionId)
  await writePlanningFile(sessionId, "options.json", [])
  await writePlanningFile(sessionId, "votes.json", [])
  await writePlanningFile(sessionId, "volunteers.json", [])
  await writePlanningFile(sessionId, "requests.json", [])
  await writePlanningFile(sessionId, "status.json", {
    state: "planning",
    volunteerId: null,
    lastReset: new Date().toISOString(),
  })

  redirect(`/planning/${sessionId}`)
}

// Get a planning session by ID
export async function getPlanningSession(sessionId: string): Promise<PlanningSession | null> {
  const sessions = await readJsonFile<PlanningSession[]>("planning-sessions.json", [])
  return sessions.find((session) => session.id === sessionId) || null
}

// Update planning session last activity
async function updateSessionActivity(sessionId: string) {
  const sessions = await readJsonFile<PlanningSession[]>("planning-sessions.json", [])
  const sessionIndex = sessions.findIndex((session) => session.id === sessionId)

  if (sessionIndex >= 0) {
    sessions[sessionIndex].lastActivity = new Date().toISOString()
    await writeJsonFile("planning-sessions.json", sessions)
  }
}

// Get all lunch data
export async function getLunchData(planningId: string) {
  await updateSessionActivity(planningId)

  // Default data
  const defaultUsers: User[] = []
  const defaultOptions: LunchOption[] = []
  const defaultVotes: Vote[] = []

  // Read data from files
  const users = await readJsonFile<User[]>("users.json", defaultUsers)
  const options = await readPlanningFile<LunchOption[]>(planningId, "options.json", defaultOptions)
  const votes = await readPlanningFile<Vote[]>(planningId, "votes.json", defaultVotes)

  return { users, options, votes }
}

// Add a new lunch option
export async function addLunchOption(
  planningId: string,
  optionData: { name: string; description: string; addedBy: string },
) {
  await updateSessionActivity(planningId)

  const options = await readPlanningFile<LunchOption[]>(planningId, "options.json", [])

  const newOption: LunchOption = {
    id: uuidv4(),
    name: optionData.name,
    description: optionData.description,
    addedBy: optionData.addedBy,
    createdAt: new Date().toISOString(),
  }

  options.push(newOption)
  await writePlanningFile(planningId, "options.json", options)

  // Add user to global users list if not already there
  const users = await readJsonFile<User[]>("users.json", [])
  if (!users.some((user) => user.id === optionData.addedBy)) {
    // This is a placeholder - in a real app, we'd have more user data
    users.push({ id: optionData.addedBy, name: "Unknown User" })
    await writeJsonFile("users.json", users)
  }

  return newOption
}

// Add a vote for an option
export async function addVote(planningId: string, optionId: string, userId: string) {
  await updateSessionActivity(planningId)

  const votes = await readPlanningFile<Vote[]>(planningId, "votes.json", [])

  // Check if user already voted for this option
  const existingVote = votes.find((v) => v.userId === userId && v.optionId === optionId)

  if (existingVote) {
    // Remove the vote if it exists (toggle behavior)
    const updatedVotes = votes.filter((v) => !(v.userId === userId && v.optionId === optionId))
    await writePlanningFile(planningId, "votes.json", updatedVotes)
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
    await writePlanningFile(planningId, "votes.json", votes)
    return votes
  }
}

// Get current status
export async function getStatus(planningId: string): Promise<Status> {
  await updateSessionActivity(planningId)

  return readPlanningFile<Status>(planningId, "status.json", {
    state: "planning",
    volunteerId: null,
  })
}

// Update status
export async function updateStatus(planningId: string, state: string, volunteerId?: string): Promise<Status> {
  await updateSessionActivity(planningId)

  const status = await getStatus(planningId)

  const updatedStatus: Status = {
    state: state as Status["state"],
    volunteerId: volunteerId || status.volunteerId,
  }

  await writePlanningFile(planningId, "status.json", updatedStatus)

  // If someone volunteers, record it
  if (state === "ordering" && volunteerId) {
    const volunteers = await readPlanningFile<Volunteer[]>(planningId, "volunteers.json", [])

    // Get the winning option
    const { options, votes } = await getLunchData(planningId)

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
      await writePlanningFile(planningId, "volunteers.json", volunteers)
    }
  }

  return updatedStatus
}

// Add a food request
export async function addFoodRequest(
  planningId: string,
  requestData: {
    userId: string
    volunteerId: string
    request: string
    status: string
  },
): Promise<FoodRequest> {
  await updateSessionActivity(planningId)

  const requests = await readPlanningFile<FoodRequest[]>(planningId, "requests.json", [])

  const newRequest: FoodRequest = {
    id: uuidv4(),
    userId: requestData.userId,
    volunteerId: requestData.volunteerId,
    request: requestData.request,
    status: requestData.status as "pending" | "fulfilled",
    createdAt: new Date().toISOString(),
  }

  requests.push(newRequest)
  await writePlanningFile(planningId, "requests.json", requests)

  return newRequest
}

// Get all food requests
export async function getFoodRequests(planningId: string): Promise<FoodRequest[]> {
  await updateSessionActivity(planningId)
  return readPlanningFile<FoodRequest[]>(planningId, "requests.json", [])
}
