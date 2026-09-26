import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SlideShell } from '../../kit/SlideShell'
import styles from './demo.module.css'
import detail from './assets/screen-detail.svg'
import list from './assets/screen-list.svg'
import steps from './assets/screen-steps.svg'

const screens = [
  { value: 'overview', src: list },
  { value: 'detail', src: detail },
  { value: 'progress', src: steps },
]

export function InteractiveDemo() {
  const [saved, setSaved] = useState(false)
  return (
    <SlideShell kicker="react + shadcn/ui">
      <div className={styles.interactive}>
        <div className={styles.copy}>
          <Badge variant="outline">live components</Badge>
          <h2>real controls.<br />inside a slide.</h2>
          <p>shadcn/ui tabs, buttons and badges, themed with the deck’s fonts and colours.</p>
          <p>try the tabs or save this example. keyboard focus stays with the control.</p>
          <Button size="lg" onClick={() => setSaved(!saved)} aria-pressed={saved}>
            {saved ? 'saved ✓' : 'save example'}
          </Button>
        </div>
        <Tabs defaultValue="overview" className={styles.tabs} data-slide-interactive>
          <TabsList>
            {screens.map(screen => (
              <TabsTrigger key={screen.value} value={screen.value}>{screen.value}</TabsTrigger>
            ))}
          </TabsList>
          {screens.map(screen => (
            <TabsContent key={screen.value} value={screen.value} className={styles.panel}>
              <img src={screen.src} alt={`Sample ${screen.value} screen`} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </SlideShell>
  )
}
