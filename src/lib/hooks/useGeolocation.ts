import { useState } from 'react'

export function useGeolocation() {
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function locate(): Promise<{ lat: number; lng: number } | null> {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setError('Browser tidak mendukung deteksi lokasi.')
      return Promise.resolve(null)
    }
    setLocating(true)
    setError(null)
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocating(false)
          resolve({ lat: position.coords.latitude, lng: position.coords.longitude })
        },
        (positionError) => {
          setLocating(false)
          setError(
            positionError.code === positionError.PERMISSION_DENIED
              ? 'Izin lokasi ditolak. Isi koordinat secara manual atau izinkan akses lokasi.'
              : 'Lokasi tidak dapat dideteksi.',
          )
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10_000 },
      )
    })
  }

  return { locate, locating, error }
}
