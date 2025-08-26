import axios from 'axios'

export interface CloseApproachData {
  close_approach_date: string
  close_approach_date_full: string
  relative_velocity: {
    kilometers_per_hour: string
  }
  miss_distance: {
    kilometers: string
  }
}

export interface NeoObject {
  id: string
  name: string
  nasa_jpl_url: string
  is_potentially_hazardous_asteroid: boolean
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number
      estimated_diameter_max: number
    }
  }
  close_approach_data: CloseApproachData[]
}

export interface NeoResponse {
  near_earth_objects: Record<string, NeoObject[]>
}

export const fetchNeoData = async (
  startDate: string,
  endDate: string,
): Promise<NeoResponse> => {
  const apiKey = import.meta.env.VITE_NASA_API_KEY // CRA: process.env.REACT_APP_NASA_API_KEY
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`

  try {
    const response = await axios.get<NeoResponse>(url)
    return response.data
  } catch (error: any) {
    console.error('Error fetching NEO data:', error)
    throw new Error(
      error.response?.data?.error?.message || 'Failed to fetch NEO data',
    )
  }
}
