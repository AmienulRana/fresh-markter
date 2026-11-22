import { LocateFixed, MapPin } from 'lucide-react'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { buildMapsLink } from '@/lib/utils'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { FormField } from './FormField'

type LocationValues = { lat: string; lng: string }

export function LocationFields<T extends LocationValues>({
  register,
  setValue,
  watch,
  errors,
}: {
  register: UseFormRegister<T>
  setValue: UseFormSetValue<T>
  watch: UseFormWatch<T>
  errors: FieldErrors<T>
}) {
  const { locate, locating, error } = useGeolocation()
  const reg = register as unknown as UseFormRegister<LocationValues>
  const set = setValue as unknown as UseFormSetValue<LocationValues>
  const look = watch as unknown as UseFormWatch<LocationValues>
  const errs = errors as FieldErrors<LocationValues>
  const mapsLink = buildMapsLink(look('lat'), look('lng'))

  async function handleLocate() {
    const position = await locate()
    if (!position) return
    set('lat', String(position.lat), { shouldDirty: true, shouldValidate: true })
    set('lng', String(position.lng), { shouldDirty: true, shouldValidate: true })
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-cream-200 bg-cream-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-700">
          <MapPin className="h-4 w-4 text-leaf-700" /> Titik lokasi pengiriman
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleLocate} loading={locating}>
          <LocateFixed className="h-4 w-4" /> Gunakan lokasi saat ini
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Latitude" htmlFor="loc-lat" error={errs.lat?.message}>
          <Input id="loc-lat" inputMode="decimal" placeholder="-6.2000" invalid={Boolean(errs.lat)} {...reg('lat')} />
        </FormField>
        <FormField label="Longitude" htmlFor="loc-lng" error={errs.lng?.message}>
          <Input id="loc-lng" inputMode="decimal" placeholder="106.8166" invalid={Boolean(errs.lng)} {...reg('lng')} />
        </FormField>
      </div>
      {error ? <p className="text-xs font-medium text-danger-600">{error}</p> : null}
      {mapsLink ? (
        <a href={mapsLink} target="_blank" rel="noreferrer" className="text-sm font-semibold text-leaf-700 hover:underline">
          Cek titik di Google Maps
        </a>
      ) : null}
    </div>
  )
}
