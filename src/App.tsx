import { AppShell } from '@/components/layout/AppShell'
import { PlanView } from '@/components/plan/PlanView'
import { ExecuteView } from '@/components/execute/ExecuteView'
import { BreakView } from '@/components/break/BreakView'
import { ReviewView } from '@/components/review/ReviewView'
import { HeatmapView } from '@/components/heatmap/HeatmapView'
import { useAppStore } from '@/store/useAppStore'

function App() {
  const { mode } = useAppStore()

  return (
    <AppShell>
      {mode === 'plan' && <PlanView />}
      {mode === 'execute' && <ExecuteView />}
      {mode === 'break' && <BreakView />}
      {mode === 'review' && <ReviewView />}
      {mode === 'heatmap' && <HeatmapView />}
    </AppShell>
  )
}

export default App
