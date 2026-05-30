"use client"

import { Area, AreaChart, Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type EventData = { name: string; registrations: number }
type CategoryData = { name: string; value: number }
type DayData = { date: string; registrations: number }

const colors = ["#6366F1", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6"]

export function AnalyticsCharts({
  eventData,
  categoryData,
  dayData,
}: {
  eventData: EventData[]
  categoryData: CategoryData[]
  dayData: DayData[]
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartCard title="Registrations per event">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={eventData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 12 }} />
            <Bar dataKey="registrations" fill="#6366F1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="By category">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3}>
              {categoryData.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 12 }} />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <div className="xl:col-span-2">
        <ChartCard title="Registrations last 30 days">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dayData}>
              <defs>
                <linearGradient id="registrations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 12 }} />
              <Area type="monotone" dataKey="registrations" stroke="#6366F1" fill="url(#registrations)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="mb-4 font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  )
}
