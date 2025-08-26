import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ExternalLink,
  AlertTriangle,
  Globe,
  Zap,
  Calendar,
  Ruler,
} from 'lucide-react'
import type { NeoObject } from '@/api/nasaApi'
import { Spinner } from '@/components/ui/spinner'
import toast from 'react-hot-toast'

export default function EventDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [asteroid, setAsteroid] = useState<NeoObject | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get asteroid data from localStorage (stored when navigating from EventList)
    const storedAsteroid = localStorage.getItem(`asteroid_${id}`)
    if (storedAsteroid) {
      try {
        const parsed = JSON.parse(storedAsteroid)
        setAsteroid(parsed)
        setLoading(false)
      } catch (error) {
        toast.error('Failed to load asteroid details')
        navigate({ to: '/' })
      }
    } else {
      // Fallback: try to find in selected asteroids
      const selectedNeos = localStorage.getItem('selectedNeos')
      if (selectedNeos) {
        try {
          const parsed = JSON.parse(selectedNeos)
          const found = parsed.find((neo: NeoObject) => neo.id === id)
          if (found) {
            setAsteroid(found)
            setLoading(false)
          } else {
            toast.error('Asteroid not found')
            navigate({ to: '/' })
          }
        } catch (error) {
          toast.error('Failed to load asteroid details')
          navigate({ to: '/' })
        }
      } else {
        toast.error('Asteroid not found')
        navigate({ to: '/' })
      }
    }
  }, [id, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="opacity-70">Loading asteroid details...</p>
        </div>
      </div>
    )
  }

  if (!asteroid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Asteroid Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 opacity-70">
              The requested asteroid could not be found.
            </p>
            <Button onClick={() => navigate({ to: '/' })} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getAverageDiameter = (neo: NeoObject) => {
    const { estimated_diameter_min, estimated_diameter_max } =
      neo.estimated_diameter.kilometers
    return ((estimated_diameter_min + estimated_diameter_max) / 2).toFixed(3)
  }

  const getDiameterRange = (neo: NeoObject) => {
    const { estimated_diameter_min, estimated_diameter_max } =
      neo.estimated_diameter.kilometers
    return `${estimated_diameter_min.toFixed(3)} - ${estimated_diameter_max.toFixed(3)} km`
  }

  const formatVelocity = (velocity: string) => {
    return parseFloat(velocity).toLocaleString() + ' km/h'
  }

  const formatDistance = (distance: string) => {
    return parseFloat(distance).toLocaleString() + ' km'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const closeApproach = asteroid.close_approach_data[0]

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{asteroid.name}</h1>
              <p className="opacity-70">Asteroid ID: {asteroid.id}</p>
            </div>
          </div>
          <Badge
            className={`${asteroid.is_potentially_hazardous_asteroid ? 'bg-red-500' : 'bg-green-500'}`}
          >
            {asteroid.is_potentially_hazardous_asteroid ? 'Hazardous' : 'Safe'}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Name:</span>
                  <p className="opacity-70">{asteroid.name}</p>
                </div>
                <div>
                  <span className="font-medium">Neo Reference ID:</span>
                  <p className="opacity-70">{asteroid.id}</p>
                </div>
                <div>
                  <span className="font-medium">NASA JPL URL:</span>
                  <a
                    href={asteroid.nasa_jpl_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    View on NASA JPL
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div>
                  <span className="font-medium">Hazard Status:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      className={`${asteroid.is_potentially_hazardous_asteroid ? 'bg-red-500' : 'bg-green-500'}`}
                    >
                      {asteroid.is_potentially_hazardous_asteroid
                        ? 'Hazardous'
                        : 'Safe'}
                    </Badge>
                    {asteroid.is_potentially_hazardous_asteroid && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Characteristics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Physical Characteristics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Estimated Diameter Range:</span>
                  <p className="opacity-70">{getDiameterRange(asteroid)}</p>
                </div>
                <div>
                  <span className="font-medium">Average Diameter:</span>
                  <p className="opacity-70">
                    {getAverageDiameter(asteroid)} km
                  </p>
                </div>
                <div>
                  <span className="font-medium">Diameter Min:</span>
                  <p className="opacity-70">
                    {asteroid.estimated_diameter.kilometers.estimated_diameter_min.toFixed(
                      3,
                    )}{' '}
                    km
                  </p>
                </div>
                <div>
                  <span className="font-medium">Diameter Max:</span>
                  <p className="opacity-70">
                    {asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(
                      3,
                    )}{' '}
                    km
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Close Approach Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Close Approach Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Approach Date:</span>
                    <p className="opacity-70">
                      {formatDate(closeApproach.close_approach_date_full)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Relative Velocity:</span>
                    <p className="opacity-70">
                      {formatVelocity(
                        closeApproach.relative_velocity.kilometers_per_hour,
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Miss Distance:</span>
                    <p className="opacity-70">
                      {formatDistance(closeApproach.miss_distance.kilometers)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <span className="font-medium">
                    Close Approach Data Count:
                  </span>
                  <p className="opacity-70">
                    {asteroid.close_approach_data.length} approach(es) recorded
                  </p>
                </div>

                {asteroid.close_approach_data.length > 1 && (
                  <div>
                    <span className="font-medium">All Close Approaches:</span>
                    <div className="mt-2 space-y-2">
                      {asteroid.close_approach_data.map((approach, index) => (
                        <div
                          key={index}
                          className="p-3 border rounded-lg bg-muted/30"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="font-medium">Date:</span>
                              <p className="opacity-70">
                                {approach.close_approach_date}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Velocity:</span>
                              <p className="opacity-70">
                                {formatVelocity(
                                  approach.relative_velocity
                                    .kilometers_per_hour,
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Distance:</span>
                              <p className="opacity-70">
                                {formatDistance(
                                  approach.miss_distance.kilometers,
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate({ to: '/' })}>
              Back to Home
            </Button>
            <Button
              onClick={() => {
                window.open(asteroid.nasa_jpl_url, '_blank')
              }}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View on NASA JPL
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/event/$id')({
  component: EventDetailPage,
})
