"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Languages, Volume2 } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

interface TranslationPanelProps {
  inputText: string
  onTranslatedTextChange: (text: string) => void
  defaultFromLang?: string
  defaultToLang?: string
}

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
]

export function TranslationPanel({
  inputText,
  onTranslatedTextChange,
  defaultFromLang = "mr",
  defaultToLang = "en",
}: TranslationPanelProps) {
  const [fromLang, setFromLang] = useState(defaultFromLang)
  const [toLang, setToLang] = useState(defaultToLang)
  const [translatedText, setTranslatedText] = useState("")
  const [manualText, setManualText] = useState("")
  const { translate, isTranslating, error } = useTranslation()

  // Auto-translate when input text changes
  useEffect(() => {
    if (inputText.trim()) {
      handleTranslate(inputText)
    }
  }, [inputText, fromLang, toLang])

  const handleTranslate = async (text: string) => {
    if (!text.trim()) return

    const result = await translate(text, fromLang, toLang)
    setTranslatedText(result)
    onTranslatedTextChange(result)
  }

  const handleSwapLanguages = () => {
    const newFromLang = toLang
    const newToLang = fromLang
    setFromLang(newFromLang)
    setToLang(newToLang)

    if (inputText.trim()) {
      handleTranslate(inputText)
    }
  }

  const handleManualTranslate = () => {
    if (manualText.trim()) {
      handleTranslate(manualText)
    }
  }

  const getLanguageName = (code: string) => {
    return languages.find((lang) => lang.code === code)?.nativeName || code
  }

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
      {/* Language Selection */}
      <div className="flex items-center justify-center gap-2">
        <Select value={fromLang} onValueChange={setFromLang}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.nativeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="sm" onClick={handleSwapLanguages} className="p-2 hover:bg-gray-100">
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </Button>

        <Select value={toLang} onValueChange={setToLang}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.nativeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Translation Display */}
      {inputText && (
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
              {getLanguageName(fromLang)}
            </Badge>
            <Languages className="w-3 h-3 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600">{inputText}</p>
        </div>
      )}

      {/* Translated Output */}
      {translatedText && (
        <div className="bg-blue-50 p-3 rounded border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {getLanguageName(toLang)}
              </Badge>
              {isTranslating && <RefreshCw className="w-3 h-3 animate-spin text-teal-600" />}
            </div>
            <Button variant="ghost" size="sm" className="p-1">
              <Volume2 className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-sm font-medium">{translatedText}</p>
        </div>
      )}

      {/* Manual Input */}
      <div className="space-y-2 pt-2">
        <Textarea
          placeholder={`Type in ${getLanguageName(fromLang)} to translate...`}
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          className="min-h-20 bg-white border-gray-200 focus-visible:ring-blue-500"
        />
        <Button
          onClick={handleManualTranslate}
          disabled={!manualText.trim() || isTranslating}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isTranslating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Translating...
            </>
          ) : (
            <>
              <Languages className="w-4 h-4 mr-2" />
              Translate
            </>
          )}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          Translation error: {error}
        </div>
      )}
    </div>
  )
}
