"use client"

import { Html5Qrcode } from "html5-qrcode"
import { useEffect, useRef, useState, useTransition } from "react"
import { AlertOctagon, CheckCircle2 } from "lucide-react"
import { scanTicket } from "@/actions/attendance"
import type { ScanResult } from "@/types"
import { cn } from "@/lib/utils"

type FeedItem = ScanResult & { id: string; receivedAt: Date }

export function QRScanner({
  eventId,
  eventName,
  adminId,
  checkedIn,
  totalRegistrations,
}: {
  eventId: string
  eventName: string
  adminId: string
  checkedIn: number
  totalRegistrations: number
}) {
  const [running, setRunning] = useState(false)
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [currentCheckedIn, setCurrentCheckedIn] = useState(checkedIn)
  const [pending, startTransition] = useTransition()
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastScanRef = useRef<{ code: string; at: number } | null>(null)

  useEffect(() => {
    scannerRef.current = new Html5Qrcode("reader")

    return () => {
      const scanner = scannerRef.current
      if (scanner?.isScanning) {
        scanner.stop().catch(() => undefined)
      }
      scanner?.clear()
    }
  }, [])

  async function startScanner() {
    if (!scannerRef.current || scannerRef.current.isScanning) return

    await scannerRef.current.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      (decodedText) => {
        const now = Date.now()
        if (lastScanRef.current?.code === decodedText && now - lastScanRef.current.at < 3000) {
          return
        }

        lastScanRef.current = { code: decodedText, at: now }
        if (scannerRef.current?.isScanning) {
          scannerRef.current.pause(true)
        }

        startTransition(async () => {
          const result = await scanTicket(decodedText, eventId, adminId)
          playBeep(result.status === "success")
          if (result.status === "success") {
            setCurrentCheckedIn((value) => value + 1)
          }
          setFeed((items) => [{ ...result, id: crypto.randomUUID(), receivedAt: new Date() }, ...items].slice(0, 10))
          window.setTimeout(() => scannerRef.current?.resume(), 2500)
        })
      },
      () => undefined,
    )
    setRunning(true)
  }

  async function stopScanner() {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop()
    }
    setRunning(false)
  }

  const percent = totalRegistrations ? Math.round((currentCheckedIn / totalRegistrations) * 100) : 0

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <section className="rounded-2xl border border-[#334155] bg-[#1E293B] p-5">
        <div className="mb-5">
          <p className="label text-[#94A3B8]">QR Scanner</p>
          <h1 className="mt-1 text-xl font-semibold text-[#F1F5F9]">{eventName}</h1>
        </div>
        <div className="relative mx-auto aspect-square max-w-sm overflow-hidden rounded-2xl bg-black">
          <div id="reader" className="h-full w-full" />
          <ScannerCorners />
          <div className="absolute left-0 h-0.5 w-full animate-scanline bg-gradient-to-r from-transparent via-[#6366F1] to-transparent" />
        </div>
        <p className="mt-5 text-center text-sm text-[#94A3B8]">Point camera at attendee&apos;s ticket QR code</p>
        <button className="btn-primary mt-5 w-full" disabled={pending} onClick={running ? stopScanner : startScanner}>
          {running ? "Stop scanner" : "Start scanner"}
        </button>
      </section>

      <section className="rounded-2xl border border-[#334155] bg-[#1E293B] p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="label text-[#94A3B8]">Check-ins</p>
            <h2 className="mt-1 text-xl font-semibold text-[#F1F5F9]">{currentCheckedIn} / {totalRegistrations}</h2>
          </div>
          <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-medium text-[#6366F1]">{percent}%</span>
        </div>
        <div className="mb-5 h-2 rounded-full bg-[#334155]">
          <div className="h-2 rounded-full bg-[#6366F1]" style={{ width: `${percent}%` }} />
        </div>
        <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
          {feed.length ? feed.map((item) => <ScanFeedCard key={item.id} item={item} />) : (
            <div className="rounded-xl border border-[#334155] p-8 text-center text-sm text-[#94A3B8]">
              Scans will appear here as attendees arrive.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function ScannerCorners() {
  const base = "absolute h-6 w-6 border-[#6366F1]"
  return (
    <>
      <div className={`${base} left-5 top-5 rounded-tl-lg border-l-[3px] border-t-[3px]`} />
      <div className={`${base} right-5 top-5 rounded-tr-lg border-r-[3px] border-t-[3px]`} />
      <div className={`${base} bottom-5 left-5 rounded-bl-lg border-b-[3px] border-l-[3px]`} />
      <div className={`${base} bottom-5 right-5 rounded-br-lg border-b-[3px] border-r-[3px]`} />
    </>
  )
}

function ScanFeedCard({ item }: { item: FeedItem }) {
  const success = item.status === "success"
  const already = item.status === "alreadyScanned"
  const color = success ? "border-l-[#10B981]" : already ? "border-l-[#F59E0B]" : "border-l-[#EF4444]"
  const badge = success ? "Checked In" : already ? "Already Checked In" : "Invalid Ticket"

  return (
    <div className={cn("translate-y-0 rounded-xl border border-[#334155] border-l-4 bg-[#0F172A] p-4 opacity-100 transition-all duration-200", color)}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#1E293B] px-3 py-1 text-xs font-medium text-[#F1F5F9]">
          {item.status === "invalid" ? <AlertOctagon className="h-3 w-3 text-[#EF4444]" /> : <CheckCircle2 className="h-3 w-3 text-[#10B981]" />}
          {badge}
        </span>
        <time className="text-xs text-[#94A3B8]">{item.receivedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</time>
      </div>
      {item.status === "invalid" ? (
        <p className="font-mono text-sm text-[#F1F5F9]">{item.scannedCode}</p>
      ) : (
        <>
          <p className="font-semibold text-[#F1F5F9]">{item.attendeeName}</p>
          <p className="text-sm text-[#94A3B8]">{item.eventName}</p>
        </>
      )}
    </div>
  )
}

function playBeep(success: boolean) {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext
  const ctx = new AudioContextCtor()
  const osc = ctx.createOscillator()
  osc.frequency.value = success ? 880 : 220
  osc.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.15)
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}
