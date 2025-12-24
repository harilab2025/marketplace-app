"use client"

import { useState, useEffect, useRef } from "react"
import { SerializedEditorState } from "lexical"

import { Editor } from "@/components/blocks/editor-x/editor"

export const initialValue = {
    root: {
        children: [
            {
                children: [
                    {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "",
                        type: "text",
                        version: 1,
                    },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
            },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
    },
} as unknown as SerializedEditorState

export default function EditorPage({ value, onChange, limitChars }: { value?: SerializedEditorState | undefined, onChange?: (value: SerializedEditorState) => void, limitChars?: number }) {
    const [editorState, setEditorState] =
        useState<SerializedEditorState | undefined>(value)
    const isInternalChangeRef = useRef(false)
    const prevValueRef = useRef(value)

    // Sync editorState with value prop only when changed externally
    useEffect(() => {
        // Only update if value changed AND it wasn't an internal change
        if (value !== prevValueRef.current) {
            if (!isInternalChangeRef.current) {
                setEditorState(value)
            }
            prevValueRef.current = value
            isInternalChangeRef.current = false
        }
    }, [value])

    return (
        <Editor
            limitChars={limitChars}
            editorSerializedState={editorState}
            onSerializedChange={(values) => {
                isInternalChangeRef.current = true
                setEditorState(values)
                onChange?.(values)
            }}
        />
    )
}
