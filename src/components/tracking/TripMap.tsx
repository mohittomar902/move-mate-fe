'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Crosshair } from 'lucide-react'
import type { LocationUpdate } from '@/hooks/useTracking'

interface Props {
  driverLocation: LocationUpdate | null
  passengerLocation?: LocationUpdate | null
  myLocation?: { lat: number; lng: number } | null
  sourceLat?: number
  sourceLng?: number
  sourceName?: string
  destLat?: number
  destLng?: number
  destName?: string
  tripStatus?: 'idle' | 'started' | 'completed'
}

async function fetchRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<[number, number][] | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    const data = await res.json()
    const coords = data.routes?.[0]?.geometry?.coordinates
    if (!coords?.length) return null
    return coords.map(([lng, lat]: [number, number]) => [lat, lng] as [number, number])
  } catch {
    return null
  }
}

export default function TripMap({
  driverLocation,
  passengerLocation,
  myLocation,
  sourceLat,
  sourceLng,
  sourceName,
  destLat,
  destLng,
  destName,
  tripStatus = 'idle',
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)
  const driverMarkerRef = useRef<any>(null)
  const passengerMarkerRef = useRef<any>(null)
  const routeLayerRef = useRef<any>(null)
  const sourceMarkerRef = useRef<any>(null)
  const destMarkerRef = useRef<any>(null)
  const routeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tripStatusRef = useRef(tripStatus)
  tripStatusRef.current = tripStatus

  const drawRouteOnMap = useCallback(
    async (fromLat: number, fromLng: number) => {
      const L = leafletRef.current
      const map = mapInstanceRef.current
      if (!L || !map) return

      const status = tripStatusRef.current
      const toLat = status === 'started' ? destLat : sourceLat
      const toLng = status === 'started' ? destLng : sourceLng
      if (!toLat || !toLng) return

      const coords = await fetchRoute(fromLat, fromLng, toLat, toLng)

      // Remove old route
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current)
        routeLayerRef.current = null
      }

      if (coords) {
        routeLayerRef.current = L.polyline(coords, {
          color: '#3b82f6',
          weight: 5,
          opacity: 0.85,
        }).addTo(map)
      } else {
        // Straight-line fallback
        routeLayerRef.current = L.polyline(
          [[fromLat, fromLng], [toLat, toLng]],
          { color: '#3b82f6', weight: 3, opacity: 0.6, dashArray: '8 8' },
        ).addTo(map)
      }
    },
    [sourceLat, sourceLng, destLat, destLng],
  )

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import('leaflet').then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return

      leafletRef.current = L

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [22.9734, 78.6569],
        zoom: 5,
        zoomControl: false,
      })

      // Move zoom controls to bottom-left so recenter button doesn't clash
      L.control.zoom({ position: 'bottomleft' }).addTo(map)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Source marker (green A)
      const srcIcon = L.divIcon({
        className: '',
        html: `<div style="background:#16a34a;color:white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.35);border:2px solid white"><span style="transform:rotate(45deg);font-size:13px;font-weight:bold">A</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      // Destination marker (red B)
      const dstIcon = L.divIcon({
        className: '',
        html: `<div style="background:#dc2626;color:white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.35);border:2px solid white"><span style="transform:rotate(45deg);font-size:13px;font-weight:bold">B</span></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      // Driver marker (green car)
      const driverIcon = L.divIcon({
        className: '',
        html: `<div style="background:#22c55e;color:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 8px rgba(0,0,0,.35);border:2px solid white">🚗</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })

      // Passenger marker (blue person)
      const passengerIcon = L.divIcon({
        className: '',
        html: `<div style="background:#3b82f6;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,.35);border:2px solid white">🧍</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      if (sourceLat && sourceLng) {
        sourceMarkerRef.current = L.marker([sourceLat, sourceLng], { icon: srcIcon })
          .addTo(map)
          .bindPopup(sourceName ?? 'Pickup')
      }

      if (destLat && destLng) {
        destMarkerRef.current = L.marker([destLat, destLng], { icon: dstIcon })
          .addTo(map)
          .bindPopup(destName ?? 'Drop-off')
      }

      driverMarkerRef.current = L.marker([22.9734, 78.6569], { icon: driverIcon })
      passengerMarkerRef.current = L.marker([22.9734, 78.6569], { icon: passengerIcon })

      mapInstanceRef.current = map

      // Draw initial static route (source → dest) to give context before driver moves
      if (sourceLat && sourceLng && destLat && destLng) {
        fetchRoute(sourceLat, sourceLng, destLat, destLng).then((coords) => {
          if (!map) return
          if (coords) {
            routeLayerRef.current = L.polyline(coords, {
              color: '#3b82f6',
              weight: 5,
              opacity: 0.85,
            }).addTo(map)
            map.fitBounds(routeLayerRef.current.getBounds(), { padding: [60, 60] })
          } else if (sourceLat && sourceLng && destLat && destLng) {
            routeLayerRef.current = L.polyline(
              [[sourceLat, sourceLng], [destLat, destLng]],
              { color: '#3b82f6', weight: 3, opacity: 0.6, dashArray: '8 8' },
            ).addTo(map)
            map.fitBounds(routeLayerRef.current.getBounds(), { padding: [60, 60] })
          }
        })
      }
    })

    return () => {
      if (routeDebounceRef.current) clearTimeout(routeDebounceRef.current)
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
      leafletRef.current = null
      driverMarkerRef.current = null
      passengerMarkerRef.current = null
      routeLayerRef.current = null
      sourceMarkerRef.current = null
      destMarkerRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update driver marker and reroute from driver's position
  useEffect(() => {
    if (!driverLocation || !mapInstanceRef.current || !driverMarkerRef.current) return
    const { lat, lng } = driverLocation
    driverMarkerRef.current.setLatLng([lat, lng]).addTo(mapInstanceRef.current)

    // Debounce route refetch — only recalculate every 5s to avoid hammering OSRM
    if (routeDebounceRef.current) clearTimeout(routeDebounceRef.current)
    routeDebounceRef.current = setTimeout(() => {
      drawRouteOnMap(lat, lng)
    }, 5000)
  }, [driverLocation, drawRouteOnMap])

  // Immediately reroute when trip status flips (idle→started)
  useEffect(() => {
    if (!driverLocation || !mapInstanceRef.current) return
    drawRouteOnMap(driverLocation.lat, driverLocation.lng)
  }, [tripStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update passenger marker
  useEffect(() => {
    if (!passengerLocation || !mapInstanceRef.current || !passengerMarkerRef.current) return
    const { lat, lng } = passengerLocation
    passengerMarkerRef.current.setLatLng([lat, lng]).addTo(mapInstanceRef.current)
  }, [passengerLocation])

  const handleRecenter = useCallback(() => {
    if (!mapInstanceRef.current) return
    const target = myLocation ?? (driverLocation ? { lat: driverLocation.lat, lng: driverLocation.lng } : null)
    if (target) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], 16, { duration: 1 })
    }
  }, [myLocation, driverLocation])

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div className="relative h-full w-full">
        <div ref={mapRef} className="h-full w-full" />

        {/* Recenter button */}
        <button
          onClick={handleRecenter}
          title="Go to my location"
          className="absolute bottom-20 right-3 z-[1000] flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md hover:bg-slate-50 active:scale-95 transition"
        >
          <Crosshair size={18} className="text-slate-700" />
        </button>
      </div>
    </>
  )
}
