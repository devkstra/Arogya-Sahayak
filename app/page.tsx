// app/page.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Stethoscope,
  Shield,
  Users,
  MessageSquare,
  Video,
  Star,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Award,
  Globe,
  Zap,
  Menu,
  X,
  ChevronRight,
  Play,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const stats = [
    { number: "50,000+", label: "Patients Served", icon: Users },
    { number: "1,200+", label: "Medical Consultations", icon: Stethoscope },
    { number: "15+", label: "Languages Supported", icon: Globe },
    { number: "99.9%", label: "Uptime Reliability", icon: Shield },
  ];

  const features = [
    {
      icon: Video,
      title: "HD Video Consultations",
      description:
        "Crystal clear video calls with medical professionals using advanced LiveKit technology.",
      color: "blue",
    },
    {
      icon: MessageSquare,
      title: "AI-Powered Chat",
      description:
        "Intelligent chat assistance powered by Google Gemini for instant medical guidance.",
      color: "purple",
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description:
        "Break language barriers with real-time translation in 15+ regional languages.",
      color: "green",
    },
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description:
        "Enterprise-grade security ensuring your medical data is always protected.",
      color: "red",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description:
        "AI-assisted appointment scheduling that adapts to your preferences and availability.",
      color: "orange",
    },
    {
      icon: Zap,
      title: "Instant Diagnosis",
      description:
        "Quick symptom assessment and preliminary diagnosis using advanced AI algorithms.",
      color: "cyan",
    },
  ];

  const testimonials = [
    {
      name: "Dr. Priya Sharma",
      role: "Cardiologist, AIIMS Delhi",
      content:
        "Arogya Sahayak has revolutionized how I connect with patients. The multi-language support breaks down barriers.",
      rating: 5,
      avatar: "👩‍⚕️",
    },
    {
      name: "राजेश पटेल",
      role: "Patient, Mumbai",
      content:
        "मुझे अपनी भाषा में डॉक्टर से बात करने में बहुत आसानी हुई। बहुत अच्छी सेवा है।",
      rating: 5,
      avatar: "👨",
    },
    {
      name: "Dr. Tamil Selvan",
      role: "General Physician, Chennai",
      content:
        "The AI assistance helps me provide better diagnosis. It's like having a medical assistant 24/7.",
      rating: 5,
      avatar: "👨‍⚕️",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                  Arogya Sahayak
                </h1>
                <p className="text-xs text-slate-500 -mt-1">
                  Your Health Companion
                </p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                Features
              </Link>
              <Link
                href="#services"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                Services
              </Link>
              <Link
                href="#testimonials"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                Testimonials
              </Link>
              <Link
                href="#contact"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/dashboard"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link href="/patient">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Start Consultation
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-200/50 bg-white/95 backdrop-blur-md">
              <div className="flex flex-col space-y-4">
                <Link
                  href="#features"
                  className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#services"
                  className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Services
                </Link>
                <Link
                  href="#testimonials"
                  className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Testimonials
                </Link>
                <Link
                  href="#contact"
                  className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Contact
                </Link>
                <Link
                  href="/dashboard"
                  className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link href="/patient" className="w-full">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-lg">
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Start Consultation
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <Award className="w-4 h-4 mr-2" />
              India's Most Trusted Telemedicine Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Healthcare{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Without Barriers
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect with certified medical professionals through AI-powered
              video consultations. Experience healthcare in your native language
              with real-time translation and intelligent assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/patient">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Free Consultation
                </Button>
              </Link>
              <Link href="/book-appointment">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Appointment
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 rounded-xl border-2 border-slate-300 hover:border-blue-300 hover:bg-blue-50 text-lg transition-all duration-200"
                onClick={() =>
                  document
                    .getElementById("demo-video")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Video className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="p-6 text-center bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Powerful Features for{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Better Healthcare
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Experience the future of healthcare with our cutting-edge
              technology and AI-powered solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-8 bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                    feature.color === "blue"
                      ? "from-blue-500 to-blue-600"
                      : feature.color === "purple"
                      ? "from-purple-500 to-purple-600"
                      : feature.color === "green"
                      ? "from-green-500 to-green-600"
                      : feature.color === "red"
                      ? "from-red-500 to-red-600"
                      : feature.color === "orange"
                      ? "from-orange-500 to-orange-600"
                      : "from-cyan-500 to-cyan-600"
                  } flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo-video" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            See Arogya Sahayak in{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Action
            </span>
          </h2>
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto">
            Watch how our platform connects patients with doctors seamlessly,
            breaking language barriers and providing instant medical assistance.
          </p>

          {/* Video Placeholder */}
          <div className="relative rounded-2xl overflow-hidden shadow-3xl bg-gradient-to-br from-slate-900 to-slate-800 aspect-video">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 hover:bg-white/30 transition-colors cursor-pointer">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
                <p className="text-white/80 text-lg">Demo Video Coming Soon</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50/50 to-purple-50/30"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Healthcare Heroes
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Hear from doctors and patients who are transforming healthcare
              with Arogya Sahayak.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-8 bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="text-3xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-slate-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of patients and doctors who are already experiencing
            the future of healthcare.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/patient">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg font-semibold"
              >
                <Stethoscope className="w-5 h-5 mr-2" />
                Start Free Consultation
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg transition-all duration-200"
              >
                <Users className="w-5 h-5 mr-2" />
                Doctor Dashboard
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg transition-all duration-200"
            >
              <Phone className="w-5 h-5 mr-2" />
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Arogya Sahayak</h3>
                  <p className="text-slate-400 text-sm">
                    Your Health Companion
                  </p>
                </div>
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Bridging the gap between patients and healthcare providers
                through innovative technology, multilingual support, and
                AI-powered medical assistance.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center text-slate-300 mb-2">
                  <Mail className="w-4 h-4 mr-2" />
                  support@arogyasahayak.com
                </div>
              </div>
              <div className="flex items-center text-slate-300 mb-2">
                <Phone className="w-4 h-4 mr-2" />
                +91 1800-AROGYA (276492)
              </div>
              <div className="flex items-center text-slate-300">
                <MapPin className="w-4 h-4 mr-2" />
                Mumbai, Maharashtra, India
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-300">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#services"
                    className="hover:text-white transition-colors"
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/patient"
                    className="hover:text-white transition-colors"
                  >
                    Patient Portal
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Doctor Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-300">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Medical Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2025 Arogya Sahayak. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
