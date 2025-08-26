import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { fetchNeoData, type NeoObject } from '@/api/nasaApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { BarChart3, Filter, Calendar, AlertTriangle, Globe, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EventList() {
  const [neos, setNeos] = useState<Record<string, NeoObject[]>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [selectedNeos, setSelectedNeos] = useState<NeoObject[]>([])
  const [showHazardousOnly, setShowHazardousOnly] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<string>('date')
  const [currentDateRange, setCurrentDateRange] = useState<{ start: string; end: string }>({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })
  
  const navigate = useNavigate()

  useEffect(() => {
    loadNeos()
  }, [currentDateRange])

  const loadNeos = async () => {
    try {
      setLoading(true)
      const data = await fetchNeoData(currentDateRange.start, currentDateRange.end)
      setNeos(data.near_earth_objects)
      toast.success(`Loaded ${Object.values(data.near_earth_objects).flat().length} asteroids for the selected date range`)
    } catch (err: any) {
      setError(err.message || 'Failed to load NEO data.')
      toast.error('Failed to load asteroid data. Please check your NASA API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    const newEndDate = new Date(currentDateRange.end)
    newEndDate.setDate(newEndDate.getDate() + 7)
    const newEndDateStr = newEndDate.toISOString().split('T')[0]
    
    try {
      setLoading(true)
      const data = await fetchNeoData(currentDateRange.end, newEndDateStr)
      const newNeos = { ...neos, ...data.near_earth_objects }
      setNeos(newNeos)
      setCurrentDateRange(prev => ({ ...prev, end: newEndDateStr }))
      const newCount = Object.values(data.near_earth_objects).flat().length
      toast.success(`Successfully loaded ${newCount} more asteroids!`)
    } catch (err: any) {
      toast.error('Failed to load more asteroids. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleNeoSelection = (neo: NeoObject, checked: boolean) => {
    if (checked) {
      setSelectedNeos(prev => [...prev, neo])
      toast.success(`"${neo.name}" added to comparison list`)
    } else {
      setSelectedNeos(prev => prev.filter(n => n.id !== neo.id))
      toast.success(`"${neo.name}" removed from comparison list`)
    }
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

  const filteredAndSortedNeos = () => {
    let allNeos: NeoObject[] = []
    
    // Flatten all NEOs from all dates
    Object.values(neos).forEach(dateNeos => {
      allNeos.push(...dateNeos)
    })

    // Filter by hazardous status
    if (showHazardousOnly) {
      allNeos = allNeos.filter(neo => neo.is_potentially_hazardous_asteroid)
    }

    // Sort by criteria
    switch (sortBy) {
      case 'name':
        return allNeos.sort((a, b) => a.name.localeCompare(b.name))
      case 'distance':
        return allNeos.sort((a, b) => 
          parseFloat(a.close_approach_data[0].miss_distance.kilometers) - 
          parseFloat(b.close_approach_data[0].miss_distance.kilometers)
        )
      case 'velocity':
        return allNeos.sort((a, b) => 
          parseFloat(a.close_approach_data[0].relative_velocity.kilometers_per_hour) - 
          parseFloat(b.close_approach_data[0].relative_velocity.kilometers_per_hour)
        )
      case 'diameter':
        return allNeos.sort((a, b) => {
          const avgA = (a.estimated_diameter.kilometers.estimated_diameter_min + a.estimated_diameter.kilometers.estimated_diameter_max) / 2
          const avgB = (b.estimated_diameter.kilometers.estimated_diameter_min + b.estimated_diameter.kilometers.estimated_diameter_max) / 2
          return avgA - avgB
        })
      default:
        return allNeos.sort((a, b) => 
          new Date(a.close_approach_data[0].close_approach_date).getTime() - 
          new Date(b.close_approach_data[0].close_approach_date).getTime()
        )
    }
  }

  const getAverageDiameter = (neo: NeoObject) => {
    const { estimated_diameter_min, estimated_diameter_max } = neo.estimated_diameter.kilometers
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
            <Button onClick={loadNeos} className="w-full">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sortedNeos = filteredAndSortedNeos()

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Cosmic Event Tracker</h1>
          <p className="text-xl opacity-70">Monitor Near-Earth Objects and cosmic events</p>
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
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
                    onCheckedChange={(checked) => setShowHazardousOnly(checked as boolean)}
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
                  <BarChart3 className="h-4 w-4" />
                  Compare ({selectedNeos.length})
                </Button>
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
                {sortedNeos.filter(neo => neo.is_potentially_hazardous_asteroid).length}
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
              <p className="text-sm opacity-70">7 day intervals</p>
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

        {/* Asteroid Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {sortedNeos.map((neo) => (
            <Card 
              key={neo.id} 
              className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
                selectedNeos.find(n => n.id === neo.id) ? 'ring-2 ring-primary bg-muted/50' : ''
              }`}
              onClick={() => handleNeoSelection(neo, !selectedNeos.find(n => n.id === neo.id))}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{neo.name}</CardTitle>
                  <Checkbox
                    checked={!!selectedNeos.find(n => n.id === neo.id)}
                    onCheckedChange={(checked) => handleNeoSelection(neo, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <Badge variant={neo.is_potentially_hazardous_asteroid ? "destructive" : "default"}>
                  {neo.is_potentially_hazardous_asteroid ? "Hazardous" : "Safe"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Diameter:</span>
                    <br />
                    <span className="opacity-70">{getAverageDiameter(neo)} km</span>
                  </div>
                  <div>
                    <span className="font-medium">Distance:</span>
                    <br />
                    <span className="opacity-70">
                      {parseFloat(neo.close_approach_data[0].miss_distance.kilometers).toLocaleString()} km
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Velocity:</span>
                    <br />
                    <span className="opacity-70">
                      {parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_hour).toLocaleString()} km/h
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
                <div className="pt-2">
                  <a
                    href={neo.nasa_jpl_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm underline hover:no-underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View NASA Details →
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center">
          <Button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 text-lg"
            variant="outline"
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Loading...
              </>
            ) : (
              'Load More Asteroids'
            )}
          </Button>
        </div>
      </div>
      <div className="text-sm opacity-60">
          <p>Developed by @Gopal N D</p>
          <p className="mt-1">Powered by NASA Open APIs and Supabase</p>
        </div>
    </div>
  )
}

