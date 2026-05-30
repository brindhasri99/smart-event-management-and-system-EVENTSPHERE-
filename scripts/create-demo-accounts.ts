/**
 * Run this once to create/reset demo accounts in Supabase Auth + Prisma.
 *
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create-demo-accounts.ts
 *
 * Safe to re-run — upserts, never duplicates.
 */
import { PrismaClient } from "@prisma/client"
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const prisma = new PrismaClient()

const demoAccounts = [
  { email: "participant@test.com", password: "Password123!", name: "Demo Participant", metaRole: "participant", prismaRole: "PARTICIPANT" as const },
  { email: "organizer@test.com",   password: "Password123!", name: "Demo Organizer",   metaRole: "organizer",   prismaRole: "ORGANIZER"   as const },
]

async function main() {
  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: userList } = await supabase.auth.admin.listUsers()

  for (const account of demoAccounts) {
    const existing = userList?.users?.find((u) => u.email === account.email)

    if (existing) {
      const { error } = await supabase.auth.admin.updateUserById(existing.id, {
        password: account.password,
        user_metadata: { name: account.name, role: account.metaRole },
        email_confirm: true,
      })
      if (error) console.error(`  ❌ Could not update ${account.email}:`, error.message)
      else        console.log(`  ✅ Updated Supabase Auth: ${account.email}`)
    } else {
      const { error } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: { name: account.name, role: account.metaRole },
      })
      if (error) console.error(`  ❌ Could not create ${account.email}:`, error.message)
      else        console.log(`  ✅ Created Supabase Auth: ${account.email}`)
    }

    await prisma.user.upsert({
      where:  { email: account.email },
      update: { name: account.name, role: account.prismaRole, status: "ACTIVE" },
      create: { email: account.email, name: account.name, role: account.prismaRole, status: "ACTIVE" },
    })
    console.log(`  ✅ Upserted Prisma user:   ${account.email}`)
  }

  console.log("\n🎉 Demo accounts ready:")
  console.log("   Participant → participant@test.com  / Password123!")
  console.log("   Organizer   → organizer@test.com   / Password123!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
