import type React from "react";
import "./patient.css";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="touch-manipulation select-none"
      role="main"
      aria-label="Patient Consultation Interface"
    >
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div id="main-content">{children}</div>
    </div>
  );
}
