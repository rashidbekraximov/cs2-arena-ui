import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Card, Empty } from '../components/ui'

export default function NotFound() {
  return (
    <Card>
      <Empty
        icon={Compass}
        title="Sahifa topilmadi"
        action={<Link to="/" className="btn btn-primary btn-md">Bosh sahifa</Link>}
      />
    </Card>
  )
}
