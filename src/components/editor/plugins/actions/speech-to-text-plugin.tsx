"use client"

import { useEffect, useRef, useState } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import type { LexicalCommand, LexicalEditor, RangeSelection } from "lexical"

import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical"
import { MicIcon } from "lucide-react"

import { useReport } from "@/components/editor/editor-hooks/use-report"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// deklarasi global
// Tambahkan ini di file .d.ts global atau di atas file plugin
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }

  interface SpeechRecognition extends EventTarget {
    lang: string
    continuous: boolean
    interimResults: boolean
    start(): void
    stop(): void
    abort(): void
    onaudiostart?: (ev: Event) => void
    onaudioend?: (ev: Event) => void
    onend?: (ev: Event) => void
    onerror?: (ev: SpeechRecognitionErrorEvent) => void
    onnomatch?: (ev: SpeechRecognitionEvent) => void
    onresult?: (ev: SpeechRecognitionEvent) => void
    onsoundstart?: (ev: Event) => void
    onsoundend?: (ev: Event) => void
    onspeechstart?: (ev: Event) => void
    onspeechend?: (ev: Event) => void
    onstart?: (ev: Event) => void
  }

  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList
    readonly resultIndex: number
  }

  interface SpeechRecognitionResultList {
    readonly length: number
    item(index: number): SpeechRecognitionResult
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean
    readonly length: number
    item(index: number): SpeechRecognitionAlternative
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string
    readonly confidence: number
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string
    readonly message: string
  }
}



export const SPEECH_TO_TEXT_COMMAND: LexicalCommand<boolean> = createCommand(
  "SPEECH_TO_TEXT_COMMAND"
)

const VOICE_COMMANDS: Record<
  string,
  (args: { editor: LexicalEditor; selection: RangeSelection }) => void
> = {
  "\n": ({ selection }) => selection.insertParagraph(),
  redo: ({ editor }) => editor.dispatchCommand(REDO_COMMAND, undefined),
  undo: ({ editor }) => editor.dispatchCommand(UNDO_COMMAND, undefined),
}

function SpeechToTextPluginImpl() {
  const [editor] = useLexicalComposerContext()
  const [isEnabled, setIsEnabled] = useState(false)
  const [isSpeechToText, setIsSpeechToText] = useState(false)
  const [supportSpeech, setSupportSpeech] = useState(false)
  const recognition = useRef<SpeechRecognition | null>(null)

  const report = useReport()

  // ✅ Cek dukungan speech recognition hanya setelah komponen mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSupportSpeech("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    }
  }, [])

  useEffect(() => {
    if (!supportSpeech) return



    if (isEnabled && recognition.current === null) {
      recognition.current = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)() as SpeechRecognition
      recognition.current.continuous = true
      recognition.current.interimResults = true

      recognition.current.addEventListener("result", (e: Event) => {
        const event = e as SpeechRecognitionEvent
        const resultItem = event.results.item(event.resultIndex)
        const { transcript } = resultItem.item(0)
        report(transcript)

        if (!resultItem.isFinal) return

        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const command = VOICE_COMMANDS[transcript.toLowerCase().trim()]
            if (command) {
              command({ editor, selection })
            } else if (transcript.match(/\s*\n\s*/)) {
              selection.insertParagraph()
            } else {
              selection.insertText(transcript)
            }
          }
        })
      })
    }

    if (recognition.current) {
      if (isEnabled) recognition.current.start()
      else recognition.current.stop()
    }

    return () => {
      recognition.current?.stop()
    }
  }, [supportSpeech, editor, isEnabled, report])

  useEffect(() => {
    return editor.registerCommand(
      SPEECH_TO_TEXT_COMMAND,
      (_isEnabled: boolean) => {
        setIsEnabled(_isEnabled)
        return true
      },
      COMMAND_PRIORITY_EDITOR
    )
  }, [editor])

  // 🚀 Jika belum dicek (SSR / sebelum mount), jangan render apa-apa
  if (!supportSpeech) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={() => {
            editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText)
            setIsSpeechToText((prev) => !prev)
          }}
          variant={isSpeechToText ? "secondary" : "ghost"}
          title="Speech To Text"
          aria-label={`${isSpeechToText ? "Disable" : "Enable"} speech to text`}
          className="p-2"
          size="sm"
        >
          <MicIcon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Speech To Text</TooltipContent>
    </Tooltip>
  )
}

export function SpeechToTextPlugin() {
  return <SpeechToTextPluginImpl />
}
