import { useState } from 'react'
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Braces,
  User,
  Mail,
  Lock,
  Pencil,
  Trash2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { TagBadge } from '@/components/tags'
import type { Secret } from '@/lib/types'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard not available
    }
  }
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={copy}
      title="Copiar"
      className="text-muted-foreground"
    >
      {copied ? <Check className="text-emerald-500" /> : <Copy />}
    </Button>
  )
}

function ValueRow({ icon, label, value, masked = false }: { icon: React.ReactNode; label: string; value: string; masked?: boolean }) {
  const [show, setShow] = useState(!masked)
  const hidden = masked && !show
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </span>
      <code className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
        {hidden ? '••••••••••' : value}
      </code>
      {masked && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setShow(!show)}
          title={show ? 'Ocultar' : 'Mostrar'}
          className="text-muted-foreground"
        >
          {show ? <EyeOff /> : <Eye />}
        </Button>
      )}
      <CopyButton text={value} />
    </div>
  )
}

export function SecretCard({ secret, onEdit, onDelete }: { secret: Secret; onEdit: (s: Secret) => void; onDelete: (s: Secret) => void }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border bg-card p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            {secret.type === 'env' ? (
              <Braces className="size-4 text-muted-foreground" />
            ) : (
              <KeyRound className="size-4 text-muted-foreground" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-tight">{secret.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {secret.type === 'env' ? 'Variable de entorno' : 'Credencial'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" title="Acciones">
                <span className="sr-only">Acciones</span>
                <span className="flex flex-col items-center gap-0.5 px-1">
                  <span className="size-1 rounded-full bg-current" />
                  <span className="size-1 rounded-full bg-current" />
                  <span className="size-1 rounded-full bg-current" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(secret)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(secret)}>
                <Trash2 /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {secret.type === 'env' ? (
        <div className="flex flex-col gap-1.5">
          <ValueRow icon={<Braces className="size-3.5" />} label="Clave" value={secret.key} />
          <ValueRow icon={<Lock className="size-3.5" />} label="Valor" value={secret.value} masked />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {secret.username && <ValueRow icon={<User className="size-3.5" />} label="Usuario" value={secret.username} />}
          {secret.email && <ValueRow icon={<Mail className="size-3.5" />} label="Email" value={secret.email} />}
          <ValueRow icon={<Lock className="size-3.5" />} label="Contraseña" value={secret.password} masked />
        </div>
      )}

      {secret.notes && <p className="line-clamp-2 text-xs text-muted-foreground">{secret.notes}</p>}

      {secret.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {secret.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}
    </div>
  )
}