const now = new Date()

function futureDate(days: number, hour: number) {
  const date = new Date(now)
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date
}

export const demoCategories = [
  { id: "demo-technology", name: "Technology", slug: "technology", _count: { events: 2 } },
  { id: "demo-business", name: "Business", slug: "business", _count: { events: 2 } },
  { id: "demo-arts", name: "Arts", slug: "arts", _count: { events: 1 } },
  { id: "demo-sports", name: "Sports", slug: "sports", _count: { events: 1 } },
  { id: "demo-education", name: "Education", slug: "education", _count: { events: 1 } },
]

export const demoEvents = [
  {
    id: "demo-ai-summit",
    title: "AI Product Summit Mumbai",
    description:
      "A practical evening for product teams building AI workflows, with founder panels and live demos.",
    categoryId: "demo-technology",
    date: futureDate(18, 17),
    location: "Bandra Kurla Complex, Mumbai",
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80",
    totalSeats: 120,
    registeredCount: 114,
    createdBy: "demo-admin",
    createdAt: now,
    category: { id: "demo-technology", name: "Technology", slug: "technology" },
  },
  {
    id: "demo-cloud-builders",
    title: "Bangalore Cloud Builders Meetup",
    description:
      "Infra engineers and startup CTOs swap notes on scaling modern product infrastructure.",
    categoryId: "demo-technology",
    date: futureDate(26, 18),
    location: "Indiranagar, Bangalore",
    imageUrl:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80",
    totalSeats: 180,
    registeredCount: 72,
    createdBy: "demo-admin",
    createdAt: now,
    category: { id: "demo-technology", name: "Technology", slug: "technology" },
  },
  {
    id: "demo-design-night",
    title: "Chennai Design & Motion Night",
    description:
      "An intimate arts gathering for designers, illustrators, and motion artists.",
    categoryId: "demo-arts",
    date: futureDate(21, 19),
    location: "Nungambakkam, Chennai",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    totalSeats: 50,
    registeredCount: 48,
    createdBy: "demo-admin",
    createdAt: now,
    category: { id: "demo-arts", name: "Arts", slug: "arts" },
  },
]
