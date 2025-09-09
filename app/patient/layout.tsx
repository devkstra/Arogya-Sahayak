import type React from "react"
export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="touch-manipulation select-none">{children}</div>
}
