export interface User {
  id: string
  name: string
  email?: string
}

export interface LunchOption {
  id: string
  name: string
  description: string
  addedBy: string
  createdAt: string
}

export interface Vote {
  id: string
  userId: string
  optionId: string
  createdAt: string
}

export interface Volunteer {
  id: string
  userId: string
  optionId: string
  date: string
}

export interface FoodRequest {
  id: string
  userId: string
  volunteerId: string
  request: string
  status: "pending" | "fulfilled"
  createdAt: string
}

export interface Status {
  state: "planning" | "ordering" | "picked up" | "delivered"
  volunteerId: string | null
}
