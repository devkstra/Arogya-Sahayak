"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Phone, PhoneOff, Settings, Info, User } from "lucide-react";

interface MobileNavProps {
  isConnected: boolean;
  patientName: string;
  patientId: string;
  language: string;
  age: number;
  startTime: string;
  onSessionToggle: () => void;
  sessionActive: boolean;
}

export function MobileNav({
  isConnected,
  patientName,
  patientId,
  language,
  age,
  startTime,
  onSessionToggle,
  sessionActive,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Arogya Sahayak
              </h1>
              <p className="text-xs text-gray-500">{patientName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className={`${
                isConnected ? "bg-green-500" : "bg-yellow-500"
              } text-white text-xs`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  isConnected ? "bg-white" : "bg-white/70"
                }`}
              />
              {isConnected ? "Live" : "Offline"}
            </Badge>

            <Button
              onClick={onSessionToggle}
              size="sm"
              variant={sessionActive ? "destructive" : "default"}
              className="px-3 py-1"
            >
              {sessionActive ? (
                <PhoneOff className="h-4 w-4" />
              ) : (
                <Phone className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/20"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Navigation
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Patient Info Card */}
              <div className="p-4 border-b border-gray-100">
                <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {patientName}
                      </h3>
                      <p className="text-sm text-gray-600">{patientId}</p>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        <span>{language}</span>
                        <span>•</span>
                        <span>Age: {age}</span>
                        <span>•</span>
                        <span>{startTime}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Session Controls */}
              <div className="p-4 border-b border-gray-100">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Session Status
                    </span>
                    <Badge
                      variant={isConnected ? "default" : "secondary"}
                      className={`${
                        isConnected ? "bg-green-500" : "bg-yellow-500"
                      } text-white`}
                    >
                      {isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>

                  <Button
                    onClick={() => {
                      onSessionToggle();
                      setIsOpen(false);
                    }}
                    className={`w-full ${
                      sessionActive
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {sessionActive ? (
                      <>
                        <PhoneOff className="h-4 w-4 mr-2" />
                        End Session
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4 mr-2" />
                        Start Session
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 p-4">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsOpen(false)}
                  >
                    <Info className="h-4 w-4 mr-3" />
                    Help & Support
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Arogya Sahayak v1.0
                  <br />
                  Healthcare AI Assistant
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
