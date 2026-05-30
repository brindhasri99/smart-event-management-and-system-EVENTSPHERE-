export type User = {
  id: string
  email: string
  name: string
  role: string
  createdAt: Date
}

export type Category = {
  id: string
  name: string
  slug: string
}

export type Event = {
  id: string
  title: string
  description: string
  categoryId: string
  date: Date
  location: string
  imageUrl: string
  totalSeats: number
  registeredCount: number
  createdBy: string
  createdAt: Date
}

export type Registration = {
  id: string
  userId: string
  eventId: string
  ticketCode: string
  registeredAt: Date
}

export type Waitlist = {
  id: string
  userId: string
  eventId: string
  position: number
  status: string
  joinedAt: Date
  promotedAt: Date | null
}

export type Attendance = {
  id: string
  userId: string
  eventId: string
  registrationId: string
  markedAt: Date
  markedBy: string
}

export type EventWithDetails = Event & {
  category: Category
  registrations: RegistrationWithDetails[]
  waitlists: WaitlistWithDetails[]
  attendance: AttendanceWithDetails[]
}

export type RegistrationWithDetails = Registration & {
  user: User
  event: Event & {
    category: Category
  }
  attendance?: Attendance | null
}

export type WaitlistWithDetails = Waitlist & {
  user: User
  event: Event & {
    category: Category
  }
}

export type AttendanceWithDetails = Attendance & {
  user: User
  event: Event
  registration: Registration
}

export type ScanResult =
  | {
      status: "success"
      message: string
      attendeeName: string
      eventName: string
      checkedInAt: Date
    }
  | {
      status: "alreadyScanned"
      message: string
      attendeeName: string
      eventName: string
      checkedInAt: Date
    }
  | {
      status: "invalid"
      message: string
      scannedCode: string
    }

export type CapacityForecast = {
  filledPct: number
  seatsLeft: number
  dailyRate: number
  forecastMessage: string
  forecastUrgency: "low" | "medium" | "high"
  daysUntilEvent: number
}

export type ActionResult<T> =
  | {
      success: true
      message?: string
      data: T
    }
  | {
      success: false
      message: string
      data?: T
    }
