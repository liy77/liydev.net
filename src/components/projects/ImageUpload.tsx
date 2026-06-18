'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'

const MAX_FILE_SIZE = 2 * 1024 * 1024

interface ImageUploadProps {
  defaultImage?: string
  onUpload: (path: string) => void
  onError?: (message: string) => void
}

export default function ImageUpload({ defaultImage, onUpload, onError }: ImageUploadProps) {
  const [preview, setPreview] = useState(defaultImage)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      const message = 'A imagem deve ter no máximo 2MB'
      onError?.(message)
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (data.success) {
        setPreview(data.path)
        onUpload(data.path)
      } else {
        onError?.(data.error || 'Falha ao enviar imagem')
      }
    } catch {
      onError?.('Erro de rede ao enviar imagem')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <label htmlFor="image-upload" className="text-sm text-white/70">
        Imagem do projeto
      </label>
      <input
        id="image-upload"
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
        aria-label="Selecionar imagem do projeto"
      >
        {uploading ? 'Enviando...' : preview ? 'Trocar imagem' : 'Enviar imagem'}
      </Button>
    </div>
  )
}
