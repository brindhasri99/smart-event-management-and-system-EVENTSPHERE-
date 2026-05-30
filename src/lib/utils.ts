import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
    .format(new Date(date))
    .replace(",", "")
    .replace(" at ", " · ")
}

export function formatSeatsLeft(registered: number, total: number) {
  const seatsLeft = Math.max(total - registered, 0)

  if (seatsLeft === 0) {
    return "Sold out"
  }

  if (seatsLeft === 1) {
    return "1 seat left"
  }

  return `${seatsLeft} seats left`
}

export function generateTicketCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""

  for (let index = 0; index < 6; index++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)]
  }

  return `EVT-${code}`
}

type CsvValue = string | number | boolean | Date | null | undefined

export function exportToCSV(data: Record<string, CsvValue>[], filename: string) {
  if (typeof window === "undefined" || data.length === 0) {
    return
  }

  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header]
        const printableValue = value instanceof Date ? value.toISOString() : String(value ?? "")

        // CSV is fussy around commas and quotes. Escaping every cell keeps the
        // export dependable when attendee names or locations include punctuation.
        return `"${printableValue.replaceAll('"', '""')}"`
      })
      .join(","),
  )

  const csv = [headers.join(","), ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
