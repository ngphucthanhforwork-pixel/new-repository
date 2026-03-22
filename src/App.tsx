import { AppShell } from '@/components/layout/AppShell'
import { PlanView } from '@/components/plan/PlanView'
import { ExecuteView } from '@/components/execute/ExecuteView'
import { BreakView } from '@/components/break/BreakView'
import { ReviewView } from '@/components/review/ReviewView'
import { HeatmapView } from '@/components/heatmap/HeatmapView'
import { TaskCardOverlay } from '@/components/task/TaskCard'
import { BetCardOverlay } from '@/components/card/BetCard'
import { HabitCardOverlay } from '@/components/card/HabitCard'
import { useAppStore } from '@/store/useAppStore'

function App() {
  const { mode } = useAppStore()

  return (
    <AppShell>
      {mode === 'plan'    && <PlanView />}
      {mode === 'execute' && <ExecuteView />}
      {mode === 'break'   && <BreakView />}
      {mode === 'review'  && <ReviewView />}
      {mode === 'heatmap' && <HeatmapView />}

      {/* Global item card overlays — rendered above all modes */}
      <TaskCardOverlay />
      <BetCardOverlay />
      <HabitCardOverlay />
    </AppShell>
  )
}

export default App
