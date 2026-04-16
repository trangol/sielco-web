'use client';
import { useState, useRef } from 'react';

const CLOUD_NAME = 'di8ywogrf';
const UPLOAD_PRESET = 'reparahub_preset';

export default function ImageUpload({ value, onChange, label = 'Logo', height = 60 }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar 5 MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'sielco-logos');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        onChange(data.secure_url);
      } else {
        alert('Error al subir: ' + (data.error?.message || 'Intenta de nuevo'));
      }
    } catch (err) {
      alert('Error de conexión: ' + err.message);
    }
    setUploading(false);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onFileSelect(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
  }

  function remove() {
    onChange('');
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.3rem' }}>{label}</label>

      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem', border: '1px solid var(--gray-200)', borderRadius: 6, background: 'var(--gray-50)' }}>
          <img src={value} alt="Logo" style={{ maxHeight: height, maxWidth: 180, objectFit: 'contain' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 600 }}>Subido correctamente</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--gray-500)', wordBreak: 'break-all', marginTop: '0.2rem' }}>{value.substring(0, 60)}...</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', border: '1px solid var(--gray-200)', borderRadius: 4, background: 'var(--white)', cursor: 'pointer', color: 'var(--gray-700)' }}
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={remove}
              style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', border: '1px solid var(--gray-200)', borderRadius: 4, background: 'var(--white)', cursor: 'pointer', color: 'var(--danger)' }}
            >
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--tech)' : 'var(--gray-300)'}`,
            borderRadius: 6,
            padding: '1.2rem',
            textAlign: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            background: dragOver ? 'var(--tech-bg)' : 'var(--gray-50)',
            transition: 'all 0.2s',
          }}
        >
          {uploading ? (
            <div style={{ fontSize: '0.82rem', color: 'var(--tech)' }}>Subiendo imagen...</div>
          ) : (
            <>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>+</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                Arrastra una imagen o haz clic para seleccionar
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--gray-300)', marginTop: '0.3rem' }}>
                PNG, JPG o SVG · Máximo 5 MB
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
}
