"use client"

import { useState, useCallback } from "react"

interface MedicalQuery {
  symptoms: string[]
  patientAge?: number
  patientGender?: string
  medicalHistory?: string[]
}

interface MedicalCondition {
  condition: string
  probability: number
  symptoms: string[]
  recommendations: string[]
  urgency: "low" | "medium" | "high"
  followUp: string
}

interface MedicalDatabaseResult {
  patientProfile: MedicalQuery
  possibleConditions: MedicalCondition[]
  recommendedTests: string[]
  redFlags: string[]
  timestamp: string
}

interface UseMedicalDatabaseReturn {
  queryDatabase: (query: MedicalQuery) => Promise<MedicalDatabaseResult | null>
  isLoading: boolean
  error: string | null
  lastResult: MedicalDatabaseResult | null
}

export function useMedicalDatabase(): UseMedicalDatabaseReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<MedicalDatabaseResult | null>(null)

  const queryDatabase = useCallback(async (query: MedicalQuery): Promise<MedicalDatabaseResult | null> => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await fetch("/api/medical-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      })

      if (!response.ok) {
        throw new Error("Medical database query failed")
      }

      const result = await response.json()
      setLastResult(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Database query failed"
      setError(errorMessage)
      console.error("Medical database error:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    queryDatabase,
    isLoading,
    error,
    lastResult,
  }
}
