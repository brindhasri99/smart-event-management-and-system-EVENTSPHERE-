export type CapacityForecast = {
  filledPct: number
  seatsLeft: number
  dailyRate: number
  forecastMessage: string
  forecastUrgency: "low" | "medium" | "high"
  daysUntilEvent: number
}

export function computeCapacityForecast(
  totalSeats: number,
  registeredCount: number,
  registrations: { registeredAt: Date }[],
  eventDate: Date,
): CapacityForecast {
  const seatsLeft = totalSeats - registeredCount
  const filledPct = Math.round((registeredCount / totalSeats) * 100)

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recentRegs = registrations.filter((registration) => registration.registeredAt >= sevenDaysAgo)

  const dailyRate = recentRegs.length > 0 ? Math.round((recentRegs.length / 7) * 10) / 10 : 0
  const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  let forecastMessage: string
  let forecastUrgency: "low" | "medium" | "high"

  if (registeredCount >= totalSeats) {
    forecastMessage = "Event is sold out"
    forecastUrgency = "high"
  } else if (dailyRate <= 0) {
    forecastMessage = "No recent registrations"
    forecastUrgency = "low"
  } else {
    const daysToSellOut = Math.ceil(seatsLeft / dailyRate)

    if (daysToSellOut <= daysUntilEvent) {
      if (daysToSellOut <= 1) {
        forecastMessage = "Likely to sell out today"
        forecastUrgency = "high"
      } else if (daysToSellOut <= 3) {
        forecastMessage = `Likely to sell out in ${daysToSellOut} days`
        forecastUrgency = "high"
      } else if (daysToSellOut <= 7) {
        forecastMessage = `Likely to sell out in ${daysToSellOut} days`
        forecastUrgency = "medium"
      } else {
        forecastMessage = `At this pace, sells out ${daysToSellOut} days before event`
        forecastUrgency = "low"
      }
    } else {
      forecastMessage = "Unlikely to sell out at current pace"
      forecastUrgency = "low"
    }
  }

  return {
    filledPct,
    seatsLeft,
    dailyRate,
    forecastMessage,
    forecastUrgency,
    daysUntilEvent,
  }
}
