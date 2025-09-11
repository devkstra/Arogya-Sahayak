// app/api/gemini-medical/route.ts
import { NextRequest, NextResponse } from "next/server";
import { geminiAssistant, MedicalContext } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      patientMessage,
      conversationHistory,
      medicalContext,
      topic,
      language = "English",
      symptoms,
    } = body;

    switch (action) {
      case "generateSummary":
        const summary = await geminiAssistant.generateMedicalSummary(
          patientMessage,
          conversationHistory,
          medicalContext as MedicalContext
        );
        return NextResponse.json(summary);

      case "generateResponse":
        const response = await geminiAssistant.generateDoctorResponse(
          patientMessage,
          conversationHistory,
          medicalContext as MedicalContext
        );
        return NextResponse.json({ response });

      case "generateEducation":
        const educationContent =
          await geminiAssistant.generatePatientEducationContent(
            topic,
            language
          );
        return NextResponse.json({ content: educationContent });

      case "assessUrgency":
        const urgencyAssessment = await geminiAssistant.assessSymptomUrgency(
          symptoms
        );
        return NextResponse.json(urgencyAssessment);

      default:
        return NextResponse.json(
          { error: "Invalid action specified" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Gemini Medical API is running",
    availableActions: [
      "generateSummary",
      "generateResponse",
      "generateEducation",
      "assessUrgency",
    ],
  });
}
