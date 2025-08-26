
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { useInitAuth } from '@/hook/useSession'
import { useUserStore } from '@/store/UserStore'
import EventList from '@/components/EventList'
import InitalPqge from '@/components/InitalPqge'


const IndexPage = () => {
  useInitAuth()

  const { user } = useUserStore((state) => state)

  return (
  <>
   <p>
    {user ? <EventList /> : <InitalPqge />}
   </p>
 
   </>
  )
}

export const Route = createFileRoute('/')({
  component: IndexPage,
})
