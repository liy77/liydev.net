'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'

interface ImageUploadProps {
  defaultImage?: string
  onUpload: (path: string) => void
}

export default function ImageUpload({ defaultImage, onUpload }: ImageUploadProps) {
  const [preview, setPreview] = useState(defaultImage)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    setUploading(false)

    if (data.success) {
      setPreview(data.path)
      onUpload(data.path)
    } else {
      alert(data.error)
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      {preview && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-white/5">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
      <Button
        type="button"
        variant="secondary"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Enviando...' : preview ? 'Trocar imagem' : 'Enviar imagem'}
      </Button>
    </div>
  )
}
