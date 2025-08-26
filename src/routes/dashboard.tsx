import { createFileRoute } from '@tanstack/react-router'

import { useState, useEffect } from 'react'
import { fetchNeoData, type NeoObject } from '@/api/nasaApi'
import EventCard from '../components/EventCard'

export default function EventList() {
  const [neos, setNeos] = useState<Record<string, NeoObject[]>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const today = new Date()
    const startDate = today.toISOString().split('T')[0]

    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7)
    const endDate = nextWeek.toISOString().split('T')[0]

    const loadNeos = async () => {
      try {
        setLoading(true)
        const data = await fetchNeoData(startDate, endDate)
        setNeos(data.near_earth_objects)
      } catch (err: any) {
        setError(err.message || 'Failed to load NEO data.')
      } finally {
        setLoading(false)
      }
    }

    loadNeos()
  }, [])

  if (loading) return <div className="text-center p-4">Loading...</div>
  if (error) return <div className="text-center text-red-500">{error}</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Upcoming Near-Earth Objects</h1>
      {Object.keys(neos).map((date) => (
        <div key={date} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{date}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {neos[date].map((neo) => (
              <EventCard key={neo.id} neo={neo} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export const Route = createFileRoute('/dashboard')({
  component: EventList,
})
