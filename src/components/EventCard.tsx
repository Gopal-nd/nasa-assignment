import type { NeoObject } from '@/api/nasaApi'

interface EventCardProps {
  neo: NeoObject
}

export default function EventCard({ neo }: EventCardProps) {
  const diameterMin = neo.estimated_diameter.kilometers.estimated_diameter_min
  const diameterMax = neo.estimated_diameter.kilometers.estimated_diameter_max
  const avgDiameter = ((diameterMin + diameterMax) / 2).toFixed(3)

  const closestApproach = neo.close_approach_data[0]

  return (
    <div className="p-4 border rounded-xl shadow hover:shadow-lg transition">
      <h3 className="text-lg font-bold">{neo.name}</h3>
      <p
        className={`text-sm ${
          neo.is_potentially_hazardous_asteroid
            ? 'text-red-500 font-semibold'
            : 'text-green-600'
        }`}
      >
        {neo.is_potentially_hazardous_asteroid ? 'Hazardous' : 'Safe'}
      </p>
      <p className="text-sm">Diameter: {avgDiameter} km</p>
      <p className="text-sm">
        Approach Date: {closestApproach.close_approach_date_full}
      </p>
      <a
        href={neo.nasa_jpl_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 text-sm underline"
      >
        View Details
      </a>
    </div>
  )
}
