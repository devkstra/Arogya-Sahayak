// components/appointment-booking.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  Heart,
  Stethoscope,
  Video,
  Phone,
  MessageCircle,
  MapPin,
  Star,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const doctors = [
  {
    id: "DOC-001",
    name: "Dr. Priya Sharma",
    specialization: "Cardiologist",
    experience: "15 years",
    rating: 4.9,
    reviews: 1250,
    language: ["Hindi", "English", "Punjabi"],
    consultationFee: 800,
    location: "AIIMS Delhi",
    avatar: "👩‍⚕️",
    nextAvailable: "Today 2:30 PM",
    consultationTypes: ["Video Call", "Audio Call", "Chat"],
    description:
      "Specialist in heart diseases, hypertension, and cardiovascular surgery with extensive experience in interventional cardiology.",
  },
  {
    id: "DOC-002",
    name: "Dr. Rajesh Kumar",
    specialization: "General Physician",
    experience: "12 years",
    rating: 4.7,
    reviews: 890,
    language: ["Hindi", "English", "Bengali"],
    consultationFee: 500,
    location: "Fortis Hospital",
    avatar: "👨‍⚕️",
    nextAvailable: "Today 4:00 PM",
    consultationTypes: ["Video Call", "Audio Call", "Chat"],
    description:
      "Experienced general practitioner specializing in family medicine, preventive care, and chronic disease management.",
  },
  {
    id: "DOC-003",
    name: "Dr. Anita Patel",
    specialization: "Pediatrician",
    experience: "10 years",
    rating: 4.8,
    reviews: 675,
    language: ["Gujarati", "Hindi", "English"],
    consultationFee: 600,
    location: "Apollo Hospital",
    avatar: "👩‍⚕️",
    nextAvailable: "Tomorrow 10:00 AM",
    consultationTypes: ["Video Call", "Audio Call"],
    description:
      "Child health specialist with expertise in pediatric care, vaccinations, and developmental disorders.",
  },
];

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
];

const dates = [
  { date: "15", day: "Today", available: true },
  { date: "16", day: "Tomorrow", available: true },
  { date: "17", day: "Thu", available: true },
  { date: "18", day: "Fri", available: false },
  { date: "19", day: "Sat", available: true },
  { date: "20", day: "Sun", available: true },
  { date: "21", day: "Mon", available: true },
];

export function AppointmentBooking() {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("15");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("Video Call");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bookingComplete, setBookingComplete] = useState(false);

  const doctor = doctors.find((d) => d.id === selectedDoctor);

  const handleBooking = () => {
    // Simulate booking process
    setBookingComplete(true);
    setTimeout(() => {
      setBookingComplete(false);
      setStep(1);
      setSelectedDoctor(null);
      setSelectedTime(null);
    }, 3000);
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center p-6">
        <Card className="p-12 text-center max-w-md mx-auto bg-white/95 backdrop-blur-sm border-slate-200/50 shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Booking Confirmed!
          </h2>
          <p className="text-slate-600 mb-6">
            Your appointment with {doctor?.name} has been successfully booked
            for {selectedDate} Jan at {selectedTime}.
          </p>
          <div className="space-y-3">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Video className="w-4 h-4 mr-2" />
              Join Video Call
            </Button>
            <Button
              variant="outline"
              className="w-full border-slate-300 hover:bg-slate-50"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Book an Appointment
          </h1>
          <p className="text-xl text-slate-600">
            Connect with certified medical professionals
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              1
            </div>
            <div
              className={`h-1 w-12 ${
                step >= 2 ? "bg-blue-600" : "bg-slate-200"
              }`}
            ></div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              2
            </div>
            <div
              className={`h-1 w-12 ${
                step >= 3 ? "bg-blue-600" : "bg-slate-200"
              }`}
            ></div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 3
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              3
            </div>
          </div>
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-900 text-center mb-6">
              Choose Your Doctor
            </h2>
            <div className="grid gap-6">
              {doctors.map((doc) => (
                <Card
                  key={doc.id}
                  className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    selectedDoctor === doc.id
                      ? "border-2 border-blue-500 bg-blue-50/50"
                      : "bg-white/80 backdrop-blur-sm border-slate-200/50 hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedDoctor(doc.id)}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                    <div className="text-6xl">{doc.avatar}</div>
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {doc.name}
                          </h3>
                          <p className="text-blue-600 font-medium">
                            {doc.specialization}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 lg:mt-0">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="font-semibold">{doc.rating}</span>
                            <span className="text-slate-500 ml-1">
                              ({doc.reviews})
                            </span>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {doc.nextAvailable}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-slate-600">
                          <Heart className="w-4 h-4 mr-2" />
                          {doc.experience} experience
                        </div>
                        <div className="flex items-center text-slate-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {doc.location}
                        </div>
                        <div className="flex items-center text-slate-600">
                          <span className="text-lg font-semibold text-green-600">
                            ₹{doc.consultationFee}
                          </span>
                          <span className="ml-1">consultation</span>
                        </div>
                      </div>

                      <p className="text-slate-600 mb-4">{doc.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {doc.language.map((lang, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {lang}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {doc.consultationTypes.map((type, index) => (
                          <Badge
                            key={index}
                            className="bg-blue-100 text-blue-800 border-blue-200 text-xs"
                          >
                            {type === "Video Call" && (
                              <Video className="w-3 h-3 mr-1" />
                            )}
                            {type === "Audio Call" && (
                              <Phone className="w-3 h-3 mr-1" />
                            )}
                            {type === "Chat" && (
                              <MessageCircle className="w-3 h-3 mr-1" />
                            )}
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedDoctor}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
              >
                Continue to Date & Time
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && doctor && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="border-slate-300"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h2 className="text-2xl font-semibold text-slate-900">
                Select Date & Time
              </h2>
              <div></div>
            </div>

            <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">{doctor.avatar}</div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {doctor.name}
                  </h3>
                  <p className="text-blue-600">{doctor.specialization}</p>
                  <p className="text-slate-600">
                    ₹{doctor.consultationFee} consultation
                  </p>
                </div>
              </div>

              {/* Consultation Type */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-3">
                  Consultation Type
                </h4>
                <div className="flex flex-wrap gap-3">
                  {doctor.consultationTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`flex items-center px-4 py-2 rounded-lg border transition-all ${
                        selectedType === type
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-300 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      {type === "Video Call" && (
                        <Video className="w-4 h-4 mr-2" />
                      )}
                      {type === "Audio Call" && (
                        <Phone className="w-4 h-4 mr-2" />
                      )}
                      {type === "Chat" && (
                        <MessageCircle className="w-4 h-4 mr-2" />
                      )}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-3">
                  Select Date
                </h4>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {dates.map((date) => (
                    <button
                      key={date.date}
                      disabled={!date.available}
                      onClick={() => setSelectedDate(date.date)}
                      className={`flex flex-col items-center p-3 rounded-lg border min-w-[80px] transition-all ${
                        selectedDate === date.date
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : date.available
                          ? "border-slate-300 hover:border-blue-300 hover:bg-blue-50"
                          : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <span className="text-sm font-medium">{date.day}</span>
                      <span className="text-lg font-semibold">{date.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-3">
                  Available Times
                </h4>
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        selectedTime === time
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-300 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <div className="text-center">
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedTime}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
              >
                Continue to Confirmation
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && doctor && selectedTime && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="border-slate-300"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h2 className="text-2xl font-semibold text-slate-900">
                Confirm Appointment
              </h2>
              <div></div>
            </div>

            <Card className="p-8 bg-white/80 backdrop-blur-sm border-slate-200/50">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">{doctor.avatar}</div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                  {doctor.name}
                </h3>
                <p className="text-blue-600 text-lg">{doctor.specialization}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Date</span>
                    <span className="font-semibold">
                      {selectedDate} January 2024
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Time</span>
                    <span className="font-semibold">{selectedTime}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Type</span>
                    <span className="font-semibold flex items-center">
                      {selectedType === "Video Call" && (
                        <Video className="w-4 h-4 mr-2" />
                      )}
                      {selectedType === "Audio Call" && (
                        <Phone className="w-4 h-4 mr-2" />
                      )}
                      {selectedType === "Chat" && (
                        <MessageCircle className="w-4 h-4 mr-2" />
                      )}
                      {selectedType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Fee</span>
                    <span className="font-semibold text-green-600">
                      ₹{doctor.consultationFee}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200 mb-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Before your appointment:
                    </h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Ensure you have a stable internet connection</li>
                      <li>
                        • Prepare your medical history and current medications
                        list
                      </li>
                      <li>• Test your camera and microphone beforehand</li>
                      <li>• Have your ID and insurance details ready</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={handleBooking}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-12 py-4 text-lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirm Booking
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
