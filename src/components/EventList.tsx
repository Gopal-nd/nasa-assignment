import { useState, useEffect } from 'react'
import { fetchNeoData, type NeoObject } from '@/api/nasaApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import {
  Filter,
  Calendar,
  AlertTriangle,
  Globe,
  Zap,
  ArrowRight,
  CalendarDays,
  Info,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from '@tanstack/react-router'

export default function EventList() {
  const [neos, setNeos] = useState<Record<string, NeoObject[]>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [selectedNeos, setSelectedNeos] = useState<NeoObject[]>([])
  const [showHazardousOnly, setShowHazardousOnly] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<string>('date')
  const [customDateRange, setCustomDateRange] = useState<{
    start: string
    end: string
  }>({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  })
  const [currentDateRange, setCurrentDateRange] = useState<{
    start: string
    end: string
  }>({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  })
  const [useCustomRange, setUseCustomRange] = useState<boolean>(false)

  const navigate = useNavigate()

  useEffect(() => {
    loadInitialNeos()
  }, [])

  const loadInitialNeos = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchNeoData(
        currentDateRange.start,
        currentDateRange.end,
      )
      setNeos(data.near_earth_objects)
      const totalCount = Object.values(data.near_earth_objects).flat().length
      toast.success(
        `Loaded ${totalCount} asteroids for the selected date range`,
      )
    } catch (err: any) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomDateRange = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await fetchNeoData(
        customDateRange.start,
        customDateRange.end,
      )
      setNeos(data.near_earth_objects)
      setCurrentDateRange(customDateRange)
      const totalCount = Object.values(data.near_earth_objects).flat().length
      toast.success(
        `Loaded ${totalCount} asteroids for ${customDateRange.start} to ${customDateRange.end}`,
      )
    } catch (err: any) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    const newStartDate = new Date(currentDateRange.end)
    newStartDate.setDate(newStartDate.getDate() + 1)
    const newEndDate = new Date(newStartDate)
    newEndDate.setDate(newEndDate.getDate() + 1) // Load 2 more days

    const newStartDateStr = newStartDate.toISOString().split('T')[0]
    const newEndDateStr = newEndDate.toISOString().split('T')[0]

    try {
      setLoadingMore(true)
      const data = await fetchNeoData(newStartDateStr, newEndDateStr)
      const newNeos = { ...neos, ...data.near_earth_objects }
      setNeos(newNeos)
      setCurrentDateRange((prev) => ({ ...prev, end: newEndDateStr }))
      const newCount = Object.values(data.near_earth_objects).flat().length
      toast.success(
        `Loaded ${newCount} asteroids for ${newStartDateStr} to ${newEndDateStr}`,
      )
    } catch (err: any) {
      const errorMessage = getErrorMessage(err)
      toast.error(errorMessage)
    } finally {
      setLoadingMore(false)
    }
  }

  const getErrorMessage = (err: any): string => {
    if (err.response?.status === 403) {
      return 'Invalid NASA API key. Please check your configuration.'
    } else if (err.response?.status === 429) {
      return 'API rate limit exceeded. Please wait a moment and try again.'
    } else if (err.response?.status >= 500) {
      return 'NASA API server error. Please try again later.'
    } else if (err.code === 'NETWORK_ERROR') {
      return 'Network error. Please check your internet connection.'
    } else if (err.message) {
      return `Error: ${err.message}`
    } else {
      return 'An unexpected error occurred. Please try again.'
    }
  }

  const handleNeoSelection = (neo: NeoObject, checked: boolean) => {
    if (checked) {
      setSelectedNeos((prev) => [...prev, neo])
      toast.success(`"${neo.name}" added to comparison list`)
    } else {
      setSelectedNeos((prev) => prev.filter((n) => n.id !== neo.id))
      toast.success(`"${neo.name}" removed from comparison list`)
    }
  }

  const handleAsteroidClick = (neo: NeoObject) => {
    // Store asteroid data in localStorage for the detail page
    localStorage.setItem(`asteroid_${neo.id}`, JSON.stringify(neo))
    // Navigate to the detail route
    navigate({ to: `/event/${neo.id}` })
  }

  const handleCompare = () => {
    if (selectedNeos.length < 2) {
      toast.error('Please select at least 2 asteroids to compare')
      return
    }
    localStorage.setItem('selectedNeos', JSON.stringify(selectedNeos))
    toast.success(`Preparing comparison for ${selectedNeos.length} asteroids...`)
    navigate({ to: '/compare' as string})
  }

  const getDateLabel = (dateStr: string) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

    const date = new Date(dateStr)
    const todayStr = today.toISOString().split('T')[0]
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    if (dateStr === todayStr) return 'Today'
    if (dateStr === tomorrowStr) return 'Tomorrow'

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredAndSortedNeos = () => {
    let allNeos: NeoObject[] = []

    // Flatten all NEOs from all dates
    Object.values(neos).forEach((dateNeos) => {
      allNeos.push(...dateNeos)
    })

    // Filter by hazardous status
    if (showHazardousOnly) {
      allNeos = allNeos.filter((neo) => neo.is_potentially_hazardous_asteroid)
    }

    // Sort by criteria
    switch (sortBy) {
      case 'name':
        return allNeos.sort((a, b) => a.name.localeCompare(b.name))
      case 'distance':
        return allNeos.sort(
          (a, b) =>
            parseFloat(a.close_approach_data[0].miss_distance.kilometers) -
            parseFloat(b.close_approach_data[0].miss_distance.kilometers),
        )
      case 'velocity':
        return allNeos.sort(
          (a, b) =>
            parseFloat(
              a.close_approach_data[0].relative_velocity.kilometers_per_hour,
            ) -
            parseFloat(
              b.close_approach_data[0].relative_velocity.kilometers_per_hour,
            ),
        )
      case 'diameter':
        return allNeos.sort((a, b) => {
          const avgA =
            (a.estimated_diameter.kilometers.estimated_diameter_min +
              a.estimated_diameter.kilometers.estimated_diameter_max) /
            2
          const avgB =
            (b.estimated_diameter.kilometers.estimated_diameter_min +
              b.estimated_diameter.kilometers.estimated_diameter_max) /
            2
          return avgA - avgB
        })
      default:
        return allNeos.sort(
          (a, b) =>
            new Date(a.close_approach_data[0].close_approach_date).getTime() -
            new Date(b.close_approach_data[0].close_approach_date).getTime(),
        )
    }
  }

  const getAverageDiameter = (neo: NeoObject) => {
    const { estimated_diameter_min, estimated_diameter_max } =
      neo.estimated_diameter.kilometers
    return ((estimated_diameter_min + estimated_diameter_max) / 2).toFixed(3)
  }

  if (loading && Object.keys(neos).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="opacity-70">Loading cosmic events...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 opacity-70">{error}</p>
            <div className="space-y-2">
              <Button onClick={loadInitialNeos} className="w-full">
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => setError('')}
                className="w-full"
              >
                Clear Error
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sortedNeos = filteredAndSortedNeos()
  const sortedDates = Object.keys(neos).sort()

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Compare Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold mb-2">Cosmic Event Tracker</h1>
          </div>
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <div className="space-y-4">
              {/* Date Range Selector */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 opacity-70" />
                  <span className="font-medium">Date Range:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="customRange"
                    checked={useCustomRange}
                    onCheckedChange={(checked) =>
                      setUseCustomRange(checked as boolean)
                    }
                  />
                  <label htmlFor="customRange" className="text-sm font-medium">
                    Custom Date Range
                  </label>
                </div>
              </div>

              {useCustomRange && (
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">From:</label>
                    <Input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) =>
                        setCustomDateRange((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }))
                      }
                      className="w-40"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">To:</label>
                    <Input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) =>
                        setCustomDateRange((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }))
                      }
                      className="w-40"
                    />
                  </div>
                  <Button
                    onClick={loadCustomDateRange}
                    disabled={loading}
                    size="sm"
                  >
                    Load Range
                  </Button>
                </div>
              )}

              {/* Filters and Sorting */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 opacity-70" />
                    <span className="font-medium">Filters:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hazardous"
                      checked={showHazardousOnly}
                      onCheckedChange={(checked) =>
                        setShowHazardousOnly(checked as boolean)
                      }
                    />
                    <label htmlFor="hazardous" className="text-sm font-medium">
                      Show Hazardous Only
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Sort by:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="distance">Distance</SelectItem>
                        <SelectItem value="velocity">Velocity</SelectItem>
                        <SelectItem value="diameter">Diameter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                  onClick={handleCompare}
                  disabled={selectedNeos.length < 2}
                  className="flex items-center gap-2"
                >
                  Compare ({selectedNeos.length})
                </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Total Asteroids
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{sortedNeos.length}</div>
              <p className="text-sm opacity-70">in current range</p>
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
                  sortedNeos.filter(
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
                <Calendar className="h-5 w-5" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {currentDateRange.start} to {currentDateRange.end}
              </div>
              <p className="text-sm opacity-70">2 day increments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Selected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{selectedNeos.length}</div>
              <p className="text-sm opacity-70">for comparison</p>
            </CardContent>
          </Card>
        </div>

        {/* Asteroids Organized by Date */}
        <div className="space-y-8 mb-8">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold">{getDateLabel(date)}</h2>
                <Badge variant="outline" className="text-sm">
                  {neos[date]?.length || 0} asteroids
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {neos[date]?.map((neo) => (
                  <Card
                    key={neo.id}
                    className={`hover:shadow-lg transition-all duration-200 ${
                      selectedNeos.find((n) => n.id === neo.id)
                        ? 'ring-2 ring-primary bg-muted/50'
                        : ''
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">
                          {neo.name}
                        </CardTitle>
                        <Checkbox
                          checked={!!selectedNeos.find((n) => n.id === neo.id)}
                          onCheckedChange={(checked) =>
                            handleNeoSelection(neo, checked as boolean)
                          }
                        />
                      </div>
                      <Badge
                        className={`${neo.is_potentially_hazardous_asteroid ? 'bg-red-500' : 'bg-green-500'}`}
                      >
                        {neo.is_potentially_hazardous_asteroid
                          ? 'Hazardous'
                          : 'Safe'}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Diameter:</span>
                          <br />
                          <span className="opacity-70">
                            {getAverageDiameter(neo)} km
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Distance:</span>
                          <br />
                          <span className="opacity-70">
                            {parseFloat(
                              neo.close_approach_data[0].miss_distance
                                .kilometers,
                            ).toLocaleString()}{' '}
                            km
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Velocity:</span>
                          <br />
                          <span className="opacity-70">
                            {parseFloat(
                              neo.close_approach_data[0].relative_velocity
                                .kilometers_per_hour,
                            ).toLocaleString()}{' '}
                            km/h
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Approach:</span>
                          <br />
                          <span className="opacity-70">
                            {neo.close_approach_data[0].close_approach_date}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center gap-2"
                          onClick={() => handleAsteroidClick(neo)}
                        >
                          <Info className="h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-8 py-3 text-lg"
            variant="outline"
          >
            {loadingMore ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Loading More...
              </>
            ) : (
              <>
                Load Next 2 Days
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}