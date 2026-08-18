import { FileText, Layers3 } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function ProjectPlaceholderPage({ kind }: { kind: 'groups' | 'notes' }) {
  const groups = kind === 'groups'
  return <Empty className="min-h-[28rem]">
    <EmptyHeader>
      <EmptyMedia variant="icon">{groups ? <Layers3 /> : <FileText />}</EmptyMedia>
      <EmptyTitle>{groups ? 'Grupos de variables' : 'Notas'}</EmptyTitle>
      <EmptyDescription>Esta funcionalidad estará disponible próximamente.</EmptyDescription>
    </EmptyHeader>
  </Empty>
}
