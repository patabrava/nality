'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface MediaUploadProps {
  eventId: string;
  onUploadComplete?: (mediaId: string) => void;
  onClose?: () => void;
}

export function MediaUpload({ eventId, onUploadComplete, onClose }: MediaUploadProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Please select an image file (JPEG, PNG, GIF, or WebP)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) return

    setUploading(true)
    setError(null)

    try {
      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}/${eventId}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError(`Upload failed: ${uploadError.message}`)
        setUploading(false)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName)

      // Create media_object record
      const { data: mediaData, error: mediaError } = await supabase
        .from('media_object')
        .insert([{
          user_id: user.id,
          life_event_id: eventId,
          storage_path: fileName,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          media_type: 'image',
        }])
        .select('id')
        .single()

      if (mediaError) {
        console.error('Media record error:', mediaError)
        setError(`Failed to save media record: ${mediaError.message}`)
        setUploading(false)
        return
      }

      console.log('✅ Media uploaded:', mediaData.id)
      onUploadComplete?.(mediaData.id)
      
    } catch (err) {
      console.error('Unexpected upload error:', err)
      setError('Unexpected error during upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div 
      style={{
        padding: '20px',
        background: 'var(--md-sys-color-surface-container)',
        borderRadius: '16px',
        border: '1px solid var(--md-sys-color-outline-variant)',
      }}
    >
      <h3 style={{ 
        margin: '0 0 16px', 
        fontSize: '1rem', 
        fontWeight: 600,
        color: 'var(--md-sys-color-on-surface)'
      }}>
        Add Photo
      </h3>

      {/* File Input Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed var(--md-sys-color-outline)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: preview ? 'transparent' : 'var(--md-sys-color-surface-container-low)',
          transition: 'all 0.2s',
        }}
      >
        {preview ? (
          <img 
            src={preview} 
            alt="Preview" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '200px', 
              borderRadius: '8px' 
            }} 
          />
        ) : (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📷</div>
            <p style={{ 
              margin: 0, 
              color: 'var(--md-sys-color-on-surface-variant)',
              fontSize: '0.875rem'
            }}>
              Click to select an image
            </p>
            <p style={{ 
              margin: '4px 0 0', 
              color: 'var(--md-sys-color-on-surface-variant)',
              fontSize: '0.75rem',
              opacity: 0.7
            }}>
              JPEG, PNG, GIF, WebP • Max 5MB
            </p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Error Message */}
      {error && (
        <p style={{ 
          color: 'var(--md-sys-color-error)', 
          fontSize: '0.875rem',
          margin: '12px 0 0'
        }}>
          {error}
        </p>
      )}

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginTop: '16px',
        justifyContent: 'flex-end'
      }}>
        {onClose && (
          <button
            onClick={onClose}
            disabled={uploading}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: '1px solid var(--md-sys-color-outline)',
              background: 'transparent',
              color: 'var(--md-sys-color-on-surface)',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          style={{
            padding: '10px 24px',
            borderRadius: '20px',
            border: 'none',
            background: 'var(--md-sys-color-primary)',
            color: 'var(--md-sys-color-on-primary)',
            cursor: !selectedFile || uploading ? 'not-allowed' : 'pointer',
            opacity: !selectedFile || uploading ? 0.5 : 1,
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  )
}
