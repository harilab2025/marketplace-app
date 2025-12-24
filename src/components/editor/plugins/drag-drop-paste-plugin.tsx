"use client"

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useEffect } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { DRAG_DROP_PASTE } from "@lexical/rich-text"
import { isMimeType } from "@lexical/utils"
import { COMMAND_PRIORITY_LOW } from "lexical"

import { INSERT_IMAGE_COMMAND } from "@/components/editor/plugins/images-plugin"

const ACCEPTABLE_IMAGE_TYPES = [
  "image/",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/webp",
]

async function uploadImageToServer(file: File): Promise<string> {
  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB')
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed')
  }

  // Upload the image
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to upload image')
  }

  const data = await response.json()

  // Get the image URL
  if (data.url) {
    return data.url
  } else if (data.publicId) {
    return `/api/files/${data.publicId}`
  } else {
    throw new Error('No URL or publicId returned from server')
  }
}

export function DragDropPastePlugin(): null {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    return editor.registerCommand(
      DRAG_DROP_PASTE,
      (files) => {
        ;(async () => {
          for (const file of files) {
            if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
              try {
                // Upload to server instead of using data URL
                const imageUrl = await uploadImageToServer(file)

                editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                  altText: file.name,
                  src: imageUrl,
                })

                console.log('✅ Image uploaded via drag & drop:', imageUrl)
              } catch (error) {
                console.error('❌ Error uploading image:', error)
              }
            }
          }
        })()
        return true
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])
  return null
}
