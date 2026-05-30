import { PrismaClient } from "@prisma/client"
import { createClient } from "@supabase/supabase-js"

const prisma = new PrismaClient()

const accounts = [
  { email: "participant@test.com", password: "Password123!", name: "Demo Participant", prismaRole: "PARTICIPANT", metaRole: "participant" },
  { email: "organizer@test.com",   password: "Password123!", name: "Demo Organizer",   prismaRole: "ORGANIZER",   metaRole: "organizer"   },
  { email: "user1@test.com",       password: "password123",  name: "Rohan Sharma",     prismaRole: "PARTICIPANT", metaRole: "participant" },
  { email: "user2@test.com",       password: "password123",  name: "Priya Nair",       prismaRole: "PARTICIPANT", metaRole: "participant" },
  { email: "user3@test.com",       password: "password123",  name: "Kabir Khan",       prismaRole: "PARTICIPANT", metaRole: "participant" },
]

const categories = [
  { name: "Technology", slug: "technology" },
  { name: "Business",   slug: "business"   },
  { name: "Arts",       slug: "arts"       },
  { name: "Sports",     slug: "sports"     },
  { name: "Education",  slug: "education"  },
]

function daysFromNow(days: number, hour = 18) {
  const d = new Date(); d.setDate(d.getDate() + days); d.setHours(hour, 0, 0, 0); return d
}
function daysAgo(days: number) {
  const d = new Date(); d.setDate(d.getDate() - days); d.setHours(10 + (days % 8), 15, 0, 0); return d
}
function ticketCode(i: number) { return `EVT-${i.toString(36).toUpperCase().padStart(6, "0")}` }

async function seedSupabaseAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.log("Skipping Supabase auth seed — SUPABASE_SERVICE_ROLE_KEY not set"); return }

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data: existing } = await supabase.auth.admin.listUsers()

  for (const account of accounts) {
    const found = existing?.users?.find((u) => u.email === account.email)
    if (found) {
      const { error } = await supabase.auth.admin.updateUserById(found.id, {
        password: account.password,
        user_metadata: { name: account.name, role: account.metaRole },
        email_confirm: true,
      })
      if (error) console.warn(`  Could not update ${account.email}: ${error.message}`)
      else console.log(`  Updated: ${account.email}`)
    } else {
      const { error } = await supabase.auth.admin.createUser({
        email: account.email, password: account.password, email_confirm: true,
        user_metadata: { name: account.name, role: account.metaRole },
      })
      if (error) console.warn(`  Could not create ${account.email}: ${error.message}`)
      else console.log(`  Created: ${account.email}`)
    }
  }
}

async function main() {
  console.log("Seeding Supabase Auth…")
  await seedSupabaseAuth()

  console.log("Seeding Prisma…")
  await prisma.attendance.deleteMany()
  await prisma.waitlist.deleteMany()
  await prisma.registration.deleteMany()
  await prisma.event.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  const users = await Promise.all(
    accounts.map((a) =>
      prisma.user.create({ data: { email: a.email, name: a.name, role: a.prismaRole as any, status: "ACTIVE" } })
    )
  )

  await prisma.user.createMany({
    data: Array.from({ length: 1000 }, (_, i) => ({
      email: `attendee${i}@test.com`, name: `Attendee ${i + 1}`, role: "PARTICIPANT", status: "ACTIVE",
    })),
  })

  const attendees = await prisma.user.findMany({ where: { email: { startsWith: "attendee" } } })
  const cats = await Promise.all(categories.map((c) => prisma.category.create({ data: c })))
  const catMap = new Map(cats.map((c) => [c.slug, c]))
  const organizer = users[1]

  // Real Unsplash images matched to each event topic
  const events = [
    {
      title: "AI & Machine Learning Summit Mumbai",
      desc: "A full-day summit for developers, data scientists, and product teams exploring practical AI applications, LLM integrations, and real-world machine learning deployments.",
      slug: "technology",
      date: daysFromNow(18, 17),
      location: "Bandra Kurla Complex, Mumbai",
      // Real photo: conference hall with big screen presentation
      img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80",
      seats: 120, regs: 114, wl: 6,
    },
    {
      title: "Cloud & DevOps Builders Meetup Bangalore",
      desc: "Engineers and platform teams meet to discuss Kubernetes, CI/CD pipelines, observability, and scaling production systems without the complexity.",
      slug: "technology",
      date: daysFromNow(26, 18),
      location: "Indiranagar, Bangalore",
      // Real photo: developers working on laptops at a meetup
      img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1400&q=80",
      seats: 180, regs: 72, wl: 0,
    },
    {
      title: "Startup Fundraising Masterclass Delhi",
      desc: "Founders and finance leads get a practical breakdown of fundraising rounds, investor pitch strategy, cap tables, and cash flow management.",
      slug: "business",
      date: daysFromNow(12, 16),
      location: "Connaught Place, Delhi",
      // Real photo: business presentation with audience
      img: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80",
      seats: 90, regs: 42, wl: 0,
    },
    {
      title: "Enterprise SaaS Growth Summit Hyderabad",
      desc: "Sales leaders, customer success teams, and SaaS founders share playbooks for winning enterprise accounts and reducing churn at scale.",
      slug: "business",
      date: daysFromNow(35, 10),
      location: "HITEC City, Hyderabad",
      // Real photo: corporate conference room networking
      img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80",
      seats: 250, regs: 131, wl: 0,
    },
    {
      title: "Design & Motion Arts Night Chennai",
      desc: "UI/UX designers, illustrators, and motion artists gather for portfolio reviews, live critiques, and short talks on creative process and career growth.",
      slug: "arts",
      date: daysFromNow(21, 19),
      location: "Nungambakkam, Chennai",
      // Real photo: artist working on creative design
      img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1400&q=80",
      seats: 50, regs: 48, wl: 3,
    },
    {
      title: "Independent Music & Production Workshop Mumbai",
      desc: "Independent musicians and producers explore live sound engineering, audience growth strategies, booking tactics, and small-venue performance techniques.",
      slug: "arts",
      date: daysFromNow(44, 18),
      location: "Lower Parel, Mumbai",
      // Real photo: live music concert with stage lighting
      img: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=80",
      seats: 160, regs: 64, wl: 0,
    },
    {
      title: "Urban Sports & Fitness Expo Delhi",
      desc: "Athletes, coaches, sports tech founders, and fitness enthusiasts explore new training formats, city leagues, wearable tech, and youth sports programs.",
      slug: "sports",
      date: daysFromNow(30, 9),
      location: "Jawaharlal Nehru Stadium, Delhi",
      // Real photo: sports stadium with crowd
      img: "https://images.unsplash.com/photo-1540747913346-19212a4b423e?auto=format&fit=crop&w=1400&q=80",
      seats: 500, regs: 208, wl: 0,
    },
    {
      title: "Future of Learning Conference Bangalore",
      desc: "Educators, edtech founders, and corporate trainers compare results from hybrid classrooms, microlearning programs, and AI-assisted skill development.",
      slug: "education",
      date: daysFromNow(39, 11),
      location: "Whitefield, Bangalore",
      // Real photo: classroom / lecture hall setting
      img: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1400&q=80",
      seats: 220, regs: 88, wl: 0,
    },
    {
      title: "Web3 & Blockchain Developer Day Pune",
      desc: "Blockchain engineers and Web3 product teams dive into smart contract security, DeFi protocols, NFT infrastructure, and decentralised application architecture.",
      slug: "technology",
      date: daysFromNow(22, 17),
      location: "Koregaon Park, Pune",
      // Real photo: tech coding / blockchain visual
      img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1400&q=80",
      seats: 140, regs: 60, wl: 0,
    },
    {
      title: "Women in Leadership Forum Bangalore",
      desc: "Senior women leaders across tech, finance, and operations share experiences on building inclusive teams, navigating career transitions, and driving organisational change.",
      slug: "business",
      date: daysFromNow(15, 16),
      location: "MG Road, Bangalore",
      // Real photo: professional women at conference
      img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1400&q=80",
      seats: 100, regs: 78, wl: 4,
    },
  ]

  let ti = 1, ac = 0
  for (const ev of events) {
    const cat = catMap.get(ev.slug)!
    const event = await prisma.event.create({
      data: {
        title: ev.title, description: ev.desc, categoryId: cat.id,
        date: ev.date, location: ev.location, imageUrl: ev.img,
        totalSeats: ev.seats, registeredCount: ev.regs, createdBy: organizer.id,
      },
    })
    const registrants = [...users.slice(2), ...attendees.slice(ac, ac + ev.regs)].slice(0, ev.regs)
    ac += Math.max(0, ev.regs - 3)
    for (const [i, u] of registrants.entries()) {
      await prisma.registration.create({
        data: { userId: u.id, eventId: event.id, ticketCode: ticketCode(ti++), registeredAt: daysAgo((i % 14) + 1) },
      })
    }
    for (let p = 1; p <= ev.wl; p++) {
      await prisma.waitlist.create({
        data: { userId: attendees[ac++].id, eventId: event.id, position: p, joinedAt: daysAgo(p) },
      })
    }
  }

  console.log("\n✅ Seed complete.")
  console.log("   Participant → participant@test.com / Password123!")
  console.log("   Organizer   → organizer@test.com  / Password123!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
