import { Link } from 'react-router-dom'
import { Hourglass } from 'lucide-react'
import { Card, Empty, PageHeader } from '../components/ui'

export default function ComingSoon({ title, subtitle }) {
  return (
    <div className="stack-lg">
      <PageHeader title={title} subtitle={subtitle} />
      <Card>
        <Empty
          icon={Hourglass}
          title="Bu bo'lim tez orada ochiladi"
          text="Hozircha custom matchlarda o'ynab, reytingda o'rningizni egallang."
          action={<Link to="/play" className="btn btn-primary btn-md">Custom match</Link>}
        />
      </Card>
    </div>
  )
}
