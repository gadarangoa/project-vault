import { useState } from 'react'
import { Braces, KeyRound, Plus, Search, X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { SecretCard } from '@/components/secret-card'
import { SecretDialog } from '@/components/secret-dialog'
import { TagBadge, TagManager } from '@/components/tags'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Secret, SecretType } from '@/lib/types'

export function ProjectSecretsPage({ secretType }: { secretType: SecretType }) {
  const { secrets, tags, tagFilter, setTagFilter, search, setSearch, deleteSecret } = useApp()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Secret | null>(null)
  const [deleting, setDeleting] = useState<Secret | null>(null)
  const [manageTagsOpen, setManageTagsOpen] = useState(false)
  const visibleSecrets = secrets.filter((secret) => secret.type === secretType)
  const isFiltered = Boolean(search.trim() || tagFilter)
  const title = secretType === 'env' ? 'Secretos' : 'Credenciales'
  const description = secretType === 'env' ? 'Variables de entorno y valores sensibles del proyecto.' : 'Usuarios, emails y contraseñas del proyecto.'
  const Icon = secretType === 'env' ? Braces : KeyRound

  const openNew = () => { setEditing(null); setDialogOpen(true) }
  const openEdit = (secret: Secret) => { setEditing(secret); setDialogOpen(true) }

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" aria-label={`Buscar ${title.toLowerCase()}`} placeholder={`Buscar ${title.toLowerCase()}...`} value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && <button type="button" aria-label="Limpiar búsqueda" onClick={() => setSearch('')} className="absolute top-1/2 right-2.5 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"><X /></button>}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button onClick={() => setTagFilter(null)} aria-pressed={tagFilter === null} className={cn('rounded-4xl border px-2 py-0.5 text-xs font-medium', tagFilter === null ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>Todos</button>
              {tags.map((tag) => <button key={tag.id} onClick={() => setTagFilter(tagFilter === tag.name ? null : tag.name)} aria-pressed={tagFilter === tag.name}><TagBadge tag={tag} className={tagFilter === tag.name ? 'ring-2 ring-ring' : undefined} /></button>)}
              <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={() => setManageTagsOpen(true)}>Gestionar tags</Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Badge variant="secondary">{visibleSecrets.length}</Badge><span className="text-xs font-medium text-muted-foreground">{title.toLowerCase()}</span></div>
          <Button size="sm" onClick={openNew}><Plus data-icon="inline-start" /> Nuevo {secretType === 'env' ? 'secreto' : 'credencial'}</Button>
        </div>

        {visibleSecrets.length === 0 ? (
          <Empty className="min-h-64 animate-rise-in">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Icon /></EmptyMedia>
              <EmptyTitle>{isFiltered ? 'Sin resultados' : `No hay ${title.toLowerCase()} aún`}</EmptyTitle>
              <EmptyDescription>{isFiltered ? 'Ningún elemento coincide con la búsqueda o el filtro.' : `Agrega el primer elemento de tipo ${title.toLowerCase()} a este proyecto.`}</EmptyDescription>
            </EmptyHeader>
            {!isFiltered && <Button onClick={openNew}><Plus data-icon="inline-start" /> Crear {secretType === 'env' ? 'secreto' : 'credencial'}</Button>}
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleSecrets.map((secret, index) => <div key={secret.id} className="animate-rise-in" style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}><SecretCard secret={secret} onEdit={openEdit} onDelete={setDeleting} /></div>)}
          </div>
        )}
      </div>

      <SecretDialog open={dialogOpen} onOpenChange={setDialogOpen} secret={editing} secretType={secretType} />
      <Dialog open={manageTagsOpen} onOpenChange={setManageTagsOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Gestionar tags</DialogTitle><DialogDescription>Los tags se comparten entre los elementos del proyecto.</DialogDescription></DialogHeader><TagManager /></DialogContent></Dialog>
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar {secretType === 'env' ? 'secreto' : 'credencial'}?</AlertDialogTitle><AlertDialogDescription>Se eliminará «{deleting?.name}» de forma permanente.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction variant="destructive" onClick={async () => { if (deleting) await deleteSecret(deleting.id); setDeleting(null) }}>Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </>
  )
}
