import { BarChart3 } from "lucide-react"
import type { CapacityForecast as Forecast } from "@/types"
import { cn } from "@/lib/utils"

const urgencyStyles = {
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
}

const dotStyles = {
  high: "bg-[#EF4444]",
  medium: "bg-[#F59E0B]",
  low: "bg-[#10B981]",
}

export function CapacityForecast({ forecast }: { forecast: Forecast }) {
  return (
    <section className="card p-5">
      <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold tracking-tight">
        <BarChart3 className="h-4 w-4 text-muted" />
        Capacity Forecast
      </h3>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted">Seats Filled</span>
            <span className="font-semibold">{forecast.filledPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700">
            <div className="h-2 rounded-full bg-[#6366F1]" style={{ width: `${Math.min(forecast.filledPct, 100)}%` }} />
          </div>
        </div>

        <div>
          <p className="text-sm text-muted">Registration Rate</p>
          {forecast.dailyRate === 0 ? (
            <p className="mt-1 text-sm text-muted">No registrations in the last 7 days</p>
          ) : (
            <p className="mt-1 text-lg font-semibold">
              {forecast.dailyRate} <span className="text-sm font-normal text-muted">registrations / day</span>
            </p>
          )}
        </div>

        {forecast.filledPct >= 100 ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm font-medium text-red-700">
            Sold Out · Join the waitlist above
          </div>
        ) : forecast.dailyRate > 0 ? (
          <div className={cn("rounded-lg border px-3 py-3 text-sm font-medium", urgencyStyles[forecast.forecastUrgency])}>
            <span className={cn("mr-2 inline-block h-2 w-2 rounded-full", dotStyles[forecast.forecastUrgency])} />
            {forecast.forecastMessage}
          </div>
        ) : null}
      </div>
    </section>
  )
}
