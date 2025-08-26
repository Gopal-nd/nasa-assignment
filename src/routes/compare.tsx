import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  BarChart,
  PieChart,
} from 'lucide-react'
import type { NeoObject } from '@/api/nasaApi'
import toast from 'react-hot-toast'
import { Spinner } from '@/components/ui/spinner'

export default function ComparePage() {
  const [selectedNeos, setSelectedNeos] = useState<NeoObject[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('selectedNeos')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSelectedNeos(parsed)
        toast.success(`Loaded ${parsed.length} asteroids for comparison`)
      } catch (error) {
        toast.error('Failed to load selected asteroids. Please try again.')
        navigate({ to: '/' })
      }
    } else {
      toast.error(
        'No asteroids selected for comparison. Please select some from the home page.',
      )
      navigate({ to: '/' })
    }
  }, [navigate])

  const clearSelection = () => {
    localStorage.removeItem('selectedNeos')
    setSelectedNeos([])
    toast.success('Selection cleared. Returning to home page.')
    navigate({ to: '/' })
  }

  if (selectedNeos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p>Loading comparison data...</p>
        </div>
      </div>
    )
  }

  const getAverageDiameter = (neo: NeoObject) => {
    const { estimated_diameter_min, estimated_diameter_max } =
      neo.estimated_diameter.kilometers
    return (estimated_diameter_min + estimated_diameter_max) / 2
  }

  const getClosestApproach = (neo: NeoObject) => {
    return neo.close_approach_data[0]
  }

  const getVelocity = (neo: NeoObject) => {
    return parseFloat(
      neo.close_approach_data[0].relative_velocity.kilometers_per_hour,
    )
  }

  const getDistance = (neo: NeoObject) => {
    return parseFloat(neo.close_approach_data[0].miss_distance.kilometers)
  }

  // Sort by various criteria for comparison
  const sortedByDistance = [...selectedNeos].sort(
    (a, b) => getDistance(a) - getDistance(b),
  )
  const sortedByVelocity = [...selectedNeos].sort(
    (a, b) => getVelocity(a) - getVelocity(b),
  )

  const chartData = {
    labels: selectedNeos.map((neo) => neo.name.substring(0, 15) + '...'),
    distances: selectedNeos.map((neo) => getDistance(neo)),
    velocities: selectedNeos.map((neo) => getVelocity(neo)),
    diameters: selectedNeos.map((neo) => getAverageDiameter(neo)),
  }

  const maxDistance = Math.max(...chartData.distances)
  const maxVelocity = Math.max(...chartData.velocities)
  const maxDiameter = Math.max(...chartData.diameters)

  const renderBarChart = (
    data: number[],
    maxValue: number,
    label: string,
    color: string,
  ) => (
    <div className="space-y-2">
      <h4 className="font-medium text-center">{label}</h4>
      <div className="flex items-end justify-center gap-2 h-32">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-8 ${color} rounded-t transition-all duration-300 hover:opacity-80`}
              style={{ height: `${(value / maxValue) * 100}%` }}
              title={`${value.toLocaleString()}`}
            />
            <span className="text-xs mt-1 opacity-70 text-center">
              {selectedNeos[index].name.substring(0, 8)}...
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPieChart = (
    data: number[],
    labels: string[],
    colors: string[],
  ) => {
    const total = data.reduce((a, b) => a + b, 0)
    if (total === 0)
      return <div className="text-center opacity-70">No data to display</div>

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-center">
          Distribution by Hazard Status
        </h4>
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 32 32">
              {data.map((value, index) => {
                const percentage = (value / total) * 100
                const circumference = 2 * Math.PI * 14
                const strokeDasharray = (percentage / 100) * circumference
                const strokeDashoffset =
                  index === 0
                    ? 0
                    : data
                        .slice(0, index)
                        .reduce(
                          (acc, val) => acc + (val / total) * circumference,
                          0,
                        )

                return (
                  <circle
                    key={index}
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke={colors[index]}
                    strokeWidth="4"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-strokeDashoffset}
                    className="transition-all duration-300"
                  />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium">{selectedNeos.length}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 text-sm">
          {labels.map((label, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colors[index]}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Asteroid Comparison</h1>
              <p className="opacity-70">
                Comparing {selectedNeos.length} selected asteroids
              </p>
            </div>
          </div>
          <Button onClick={clearSelection} variant="destructive">
            Clear Selection
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Total Selected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{selectedNeos.length}</div>
              <p className="text-sm opacity-70">asteroids for comparison</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Hazardous
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {
                  selectedNeos.filter(
                    (neo) => neo.is_potentially_hazardous_asteroid,
                  ).length
                }
              </div>
              <p className="text-sm opacity-70">potentially dangerous</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Average Diameter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(
                  selectedNeos.reduce(
                    (acc, neo) => acc + getAverageDiameter(neo),
                    0,
                  ) / selectedNeos.length
                ).toFixed(3)}
              </div>
              <p className="text-sm opacity-70">kilometers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Closest Distance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(
                  Math.min(...selectedNeos.map((neo) => getDistance(neo))) /
                  1000
                ).toFixed(2)}
              </div>
              <p className="text-sm opacity-70">thousand km</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Distance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Distance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderBarChart(
                chartData.distances,
                maxDistance,
                'Miss Distance (km)',
                'bg-blue-500',
              )}
            </CardContent>
          </Card>

          {/* Velocity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Velocity Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderBarChart(
                chartData.velocities,
                maxVelocity,
                'Relative Velocity (km/h)',
                'bg-green-500',
              )}
            </CardContent>
          </Card>

          {/* Diameter Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Diameter Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderBarChart(
                chartData.diameters,
                maxDiameter,
                'Average Diameter (km)',
                'bg-purple-500',
              )}
            </CardContent>
          </Card>

          {/* Hazard Status Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Hazard Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderPieChart(
                [
                  selectedNeos.filter(
                    (neo) => !neo.is_potentially_hazardous_asteroid,
                  ).length,
                  selectedNeos.filter(
                    (neo) => neo.is_potentially_hazardous_asteroid,
                  ).length,
                ],
                ['Safe', 'Hazardous'],
                ['bg-green-500', 'bg-red-500'],
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparison Tables */}
        <div className="space-y-8">
          {/* Distance Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Closest Approach Distance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Rank</th>
                      <th className="text-left p-2">Asteroid</th>
                      <th className="text-left p-2">Distance (km)</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedByDistance.map((neo, index) => (
                      <tr key={neo.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">#{index + 1}</td>
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{neo.name}</div>
                            <div className="text-sm opacity-70">
                              ID: {neo.id}
                            </div>
                          </div>
                        </td>
                        <td className="p-2 font-mono">
                          {parseFloat(
                            getDistance(neo).toFixed(2),
                          ).toLocaleString()}
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={
                              neo.is_potentially_hazardous_asteroid
                                ? 'destructive'
                                : 'default'
                            }
                          >
                            {neo.is_potentially_hazardous_asteroid
                              ? 'Hazardous'
                              : 'Safe'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Velocity Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Velocity Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Rank</th>
                      <th className="text-left p-2">Asteroid</th>
                      <th className="text-left p-2">Velocity (km/h)</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedByVelocity.map((neo, index) => (
                      <tr key={neo.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">#{index + 1}</td>
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{neo.name}</div>
                            <div className="text-sm opacity-70">
                              ID: {neo.id}
                            </div>
                          </div>
                        </td>
                        <td className="p-2 font-mono">
                          {parseFloat(
                            getVelocity(neo).toFixed(2),
                          ).toLocaleString()}
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={
                              neo.is_potentially_hazardous_asteroid
                                ? 'destructive'
                                : 'default'
                            }
                          >
                            {neo.is_potentially_hazardous_asteroid
                              ? 'Hazardous'
                              : 'Safe'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {selectedNeos.map((neo) => (
                  <Card
                    key={neo.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{neo.name}</CardTitle>
                        <Badge
                          variant={
                            neo.is_potentially_hazardous_asteroid
                              ? 'destructive'
                              : 'default'
                          }
                        >
                          {neo.is_potentially_hazardous_asteroid
                            ? 'Hazardous'
                            : 'Safe'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Diameter:</span>
                          <br />
                          <span className="opacity-70">
                            {getAverageDiameter(neo).toFixed(3)} km
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Distance:</span>
                          <br />
                          <span className="opacity-70">
                            {parseFloat(
                              getDistance(neo).toFixed(2),
                            ).toLocaleString()}{' '}
                            km
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Velocity:</span>
                          <br />
                          <span className="opacity-70">
                            {parseFloat(
                              getVelocity(neo).toFixed(2),
                            ).toLocaleString()}{' '}
                            km/h
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Approach:</span>
                          <br />
                          <span className="opacity-70">
                            {getClosestApproach(neo).close_approach_date}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <a
                          href={neo.nasa_jpl_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline hover:no-underline"
                        >
                          View NASA Details →
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/compare')({
  component: ComparePage,
})
