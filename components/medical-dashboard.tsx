// components/medical-dashboard.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Users,
  Heart,
  Activity,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  User,
  Stethoscope,
  FileText,
  Video,
  MessageCircle,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Download,
  Share2,
  Globe2 as Globe,
} from "lucide-react";

// Dummy data for medical dashboard
const appointmentsData = [
  {
    id: "APT-001",
    patientName: "राज पटेल",
    patientId: "P-2024-001",
    time: "10:30 AM",
    date: "Today",
    type: "Video Consultation",
    status: "ongoing",
    language: "Marathi",
    symptoms: ["Fever", "Headache"],
    priority: "medium",
    avatar: "👨",
  },
  {
    id: "APT-002",
    patientName: "Priya Sharma",
    patientId: "P-2024-002",
    time: "11:15 AM",
    date: "Today",
    type: "Follow-up",
    status: "scheduled",
    language: "Hindi",
    symptoms: ["Follow-up for diabetes"],
    priority: "low",
    avatar: "👩",
  },
  {
    id: "APT-003",
    patientName: "তন্ময় রায়",
    patientId: "P-2024-003",
    time: "02:00 PM",
    date: "Today",
    type: "Emergency Consultation",
    status: "scheduled",
    language: "Bengali",
    symptoms: ["Chest pain", "Shortness of breath"],
    priority: "high",
    avatar: "👨",
  },
  {
    id: "APT-004",
    patientName: "Maria D'Souza",
    patientId: "P-2024-004",
    time: "03:30 PM",
    date: "Today",
    type: "General Checkup",
    status: "scheduled",
    language: "English",
    symptoms: ["Routine checkup"],
    priority: "low",
    avatar: "👩",
  },
];

const patientsData = [
  {
    id: "P-2024-001",
    name: "राज पटेल",
    age: 45,
    gender: "Male",
    language: "Marathi",
    location: "Mumbai, Maharashtra",
    phone: "+91 98765 43210",
    email: "raj.patel@email.com",
    lastConsultation: "2024-01-15",
    medicalHistory: ["Hypertension", "Diabetes Type 2"],
    currentMedications: ["Metformin 500mg", "Lisinopril 10mg"],
    vitals: {
      bloodPressure: "140/90",
      heartRate: 78,
      temperature: 98.6,
      weight: 75,
      height: 170,
    },
    status: "active",
    urgency: "medium",
  },
  {
    id: "P-2024-002",
    name: "Priya Sharma",
    age: 32,
    gender: "Female",
    language: "Hindi",
    location: "Delhi, India",
    phone: "+91 98765 43211",
    email: "priya.sharma@email.com",
    lastConsultation: "2024-01-10",
    medicalHistory: ["Migraine", "Anxiety"],
    currentMedications: ["Sumatriptan 50mg", "Alprazolam 0.25mg"],
    vitals: {
      bloodPressure: "120/80",
      heartRate: 72,
      temperature: 98.4,
      weight: 58,
      height: 165,
    },
    status: "active",
    urgency: "low",
  },
  {
    id: "P-2024-003",
    name: "তন্ময় রায়",
    age: 58,
    gender: "Male",
    language: "Bengali",
    location: "Kolkata, West Bengal",
    phone: "+91 98765 43212",
    email: "tanmay.roy@email.com",
    lastConsultation: "2024-01-12",
    medicalHistory: ["Coronary Artery Disease", "High Cholesterol"],
    currentMedications: ["Atorvastatin 20mg", "Aspirin 75mg"],
    vitals: {
      bloodPressure: "150/95",
      heartRate: 85,
      temperature: 98.8,
      weight: 82,
      height: 175,
    },
    status: "active",
    urgency: "high",
  },
];

const statsData = [
  {
    title: "Today's Appointments",
    value: "12",
    change: "+2 from yesterday",
    trend: "up",
    icon: Calendar,
    color: "blue",
  },
  {
    title: "Active Patients",
    value: "324",
    change: "+15 this week",
    trend: "up",
    icon: Users,
    color: "green",
  },
  {
    title: "Completed Consultations",
    value: "8",
    change: "67% completion rate",
    trend: "up",
    icon: CheckCircle,
    color: "purple",
  },
  {
    title: "Emergency Cases",
    value: "3",
    change: "2 resolved today",
    trend: "down",
    icon: AlertCircle,
    color: "red",
  },
];

export function MedicalDashboard() {
  const [selectedTab, setSelectedTab] = useState<
    "appointments" | "patients" | "reports"
  >("appointments");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-green-100 text-green-800 border-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-slate-500";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-slate-500 bg-slate-50";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Medical Dashboard
            </h1>
            <p className="text-slate-600">
              Manage your patients and appointments efficiently
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
              <Video className="w-4 h-4 mr-2" />
              Start Video Call
            </Button>
            <Button
              variant="outline"
              className="border-slate-300 hover:bg-slate-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <Card
              key={index}
              className="p-6 bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm mt-2 flex items-center ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    <TrendingUp
                      className={`w-4 h-4 mr-1 ${
                        stat.trend === "down" ? "rotate-180" : ""
                      }`}
                    />
                    {stat.change}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                    stat.color === "blue"
                      ? "from-blue-500 to-blue-600"
                      : stat.color === "green"
                      ? "from-green-500 to-green-600"
                      : stat.color === "purple"
                      ? "from-purple-500 to-purple-600"
                      : "from-red-500 to-red-600"
                  } flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Navigation Tabs */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 justify-between items-start lg:items-center mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTab("appointments")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedTab === "appointments"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Calendar className="w-4 h-4 mr-2 inline" />
                Appointments
              </button>
              <button
                onClick={() => setSelectedTab("patients")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedTab === "patients"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Users className="w-4 h-4 mr-2 inline" />
                Patients
              </button>
              <button
                onClick={() => setSelectedTab("reports")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  selectedTab === "reports"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <FileText className="w-4 h-4 mr-2 inline" />
                Reports
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 lg:w-64"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 hover:bg-slate-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Content based on selected tab */}
          {selectedTab === "appointments" && (
            <div className="space-y-4">
              {appointmentsData.map((appointment) => (
                <Card
                  key={appointment.id}
                  className="p-6 bg-white/60 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-3xl">{appointment.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900">
                            {appointment.patientName}
                          </h3>
                          <Badge variant="outline" className="text-xs w-fit">
                            {appointment.patientId}
                          </Badge>
                          <Badge
                            className={`text-xs w-fit ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {appointment.time} • {appointment.date}
                          </span>
                          <span className="flex items-center">
                            <Video className="w-4 h-4 mr-1" />
                            {appointment.type}
                          </span>
                          <span className="flex items-center">
                            <Globe className="w-4 h-4 mr-1" />
                            {appointment.language}
                          </span>
                          <div className="flex items-center">
                            <div
                              className={`w-3 h-3 rounded-full mr-2 ${getPriorityColor(
                                appointment.priority
                              )}`}
                            ></div>
                            <span className="capitalize">
                              {appointment.priority} Priority
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {appointment.symptoms.map((symptom, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full lg:w-auto justify-end">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Call
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-300 hover:bg-slate-50"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-300 hover:bg-slate-50"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {selectedTab === "patients" && (
            <div className="space-y-4">
              {patientsData.map((patient) => (
                <Card
                  key={patient.id}
                  className={`p-6 bg-white/60 backdrop-blur-sm border-l-4 ${getUrgencyColor(
                    patient.urgency
                  )} hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900">
                            {patient.name}
                          </h3>
                          <Badge variant="outline" className="text-xs w-fit">
                            {patient.id}
                          </Badge>
                          <Badge
                            className={`text-xs w-fit ${
                              patient.urgency === "high"
                                ? "bg-red-100 text-red-800"
                                : patient.urgency === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {patient.urgency} urgency
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm text-slate-600 mb-3">
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {patient.age}yo, {patient.gender}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {patient.location}
                          </span>
                          <span className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {patient.vitals.bloodPressure} BP
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs font-medium text-slate-600">
                              Medical History:
                            </span>
                            {patient.medicalHistory.map((condition, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs bg-red-50 text-red-700 border-red-200"
                              >
                                {condition}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs font-medium text-slate-600">
                              Current Medications:
                            </span>
                            {patient.currentMedications.map(
                              (medication, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700 border-green-200"
                                >
                                  {medication}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full lg:w-auto justify-end">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-300 hover:bg-slate-50"
                      >
                        <Stethoscope className="w-4 h-4 mr-2" />
                        Consult
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-300 hover:bg-slate-50"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {selectedTab === "reports" && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Reports Coming Soon
              </h3>
              <p className="text-slate-600 mb-6">
                Comprehensive medical reports and analytics will be available
                here.
              </p>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Request Report
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
