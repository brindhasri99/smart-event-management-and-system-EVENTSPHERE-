import { z } from "zod"

const phone = z.string().min(7, "Enter a valid phone number.").max(20)
const password = z.string().min(8, "Password must be at least 8 characters.")

export const participantRegistrationSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name."),
    email: z.string().email("Enter a valid email address."),
    phone,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export const organizerRegistrationSchema = z
  .object({
    organizationName: z.string().min(2, "Enter your organization name."),
    organizerName: z.string().min(2, "Enter the organizer name."),
    email: z.string().email("Enter a valid email address."),
    phone,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
})

export const eventSchema = z.object({
  title: z.string().min(3, "Enter an event name."),
  description: z.string().min(20, "Add a useful event description."),
  categoryId: z.string().min(1, "Choose a category."),
  date: z.string().min(1, "Choose a date."),
  time: z.string().min(1, "Choose a time."),
  location: z.string().min(3, "Enter the venue."),
  imageUrl: z.string().url("Enter a valid banner image URL."),
  totalSeats: z.coerce.number().int().min(1, "Seats must be at least 1."),
  registrationDeadline: z.string().optional(),
  contactEmail: z.string().email("Enter a valid contact email.").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
})

export type ParticipantRegistrationInput = z.infer<typeof participantRegistrationSchema>
export type OrganizerRegistrationInput = z.infer<typeof organizerRegistrationSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type EventFormInput = z.infer<typeof eventSchema>
