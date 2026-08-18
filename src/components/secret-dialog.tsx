import { useEffect, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TagPicker } from '@/components/tags'
import type { Secret, SecretInput, SecretType } from '@/lib/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  secret?: Secret | null
  secretType?: SecretType
}

function emptyInput(projectId: number, type: SecretType): SecretInput {
  return {
    projectId,
    name: '',
    type,
    key: '',
    value: '',
    username: '',
    email: '',
    password: '',
    notes: '',
    tagIds: [],
  }
}

function inputFromSecret(projectId: number, secret?: Secret | null): SecretInput {
  if (!secret) return emptyInput(projectId, 'env')
  return {
    projectId,
    name: secret.name,
    type: secret.type,
    key: secret.key,
    value: secret.value,
    username: secret.username,
    email: secret.email,
    password: secret.password,
    notes: secret.notes,
    tagIds: secret.tags.map((t) => t.id),
  }
}

export function SecretDialog({ open, onOpenChange, secret, secretType = 'env' }: Props) {
  const { selectedProject, createSecret, updateSecret } = useApp()
  const editing = Boolean(secret)
  const [input, setInput] = useState<SecretInput>(() =>
    secret ? inputFromSecret(selectedProject?.id ?? 0, secret) : emptyInput(selectedProject?.id ?? 0, secretType),
  )
  const [credKind, setCredKind] = useState<'username' | 'email'>(secret?.email ? 'email' : 'username')

  useEffect(() => {
    if (!open) return
    setInput(secret ? inputFromSecret(selectedProject?.id ?? 0, secret) : emptyInput(selectedProject?.id ?? 0, secretType))
    setCredKind(secret?.email ? 'email' : 'username')
  }, [open, secret, selectedProject, secretType])

  const set = <K extends keyof SecretInput>(key: K, value: SecretInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }))

  const submit = async () => {
    if (!selectedProject) return
    const payload: SecretInput = { ...input, projectId: selectedProject.id }
    if (payload.type === 'env') {
      payload.username = ''
      payload.email = ''
      payload.password = ''
    } else {
      payload.key = ''
      payload.value = ''
      if (credKind === 'username') payload.email = ''
      else payload.username = ''
    }
    if (secret) await updateSecret(secret.id, payload)
    else await createSecret(payload)
    onOpenChange(false)
  }

  const isValid = input.name.trim() && (input.type === 'env' ? input.key.trim() : input.password)

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onOpenChange(false)
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? (secretType === 'credential' ? 'Editar credencial' : 'Editar secreto') : (secretType === 'credential' ? 'Nueva credencial' : 'Nuevo secreto')}</DialogTitle>
          <DialogDescription>
            {secretType === 'credential' ? 'Guarda una credencial con etiquetas.' : 'Guarda una variable de entorno con etiquetas.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="secret-name">Nombre</Label>
            <Input
              id="secret-name"
              placeholder="Ej: API Key QA, Usuario staging, Correo soporte"
              value={input.name}
              onChange={(e) => set('name', e.target.value)}
              autoFocus
            />
          </div>

          <Tabs value={input.type} className="w-full">

            <TabsContent value="env" className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="env-key">Clave</Label>
                  <Input
                    id="env-key"
                    placeholder="Ej: API_KEY"
                    value={input.key}
                    onChange={(e) => set('key', e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="env-value">Valor</Label>
                  <Input
                    id="env-value"
                    placeholder="Ej: sk-123abc"
                    value={input.value}
                    onChange={(e) => set('value', e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="credential" className="grid gap-3">
              <Select value={credKind} onValueChange={(v) => setCredKind(v as 'username' | 'email')}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="username">Usuario + contraseña</SelectItem>
                  <SelectItem value="email">Email + contraseña</SelectItem>
                </SelectContent>
              </Select>
              {credKind === 'username' ? (
                <div className="grid gap-2">
                  <Label htmlFor="cred-user">Usuario</Label>
                  <Input
                    id="cred-user"
                    placeholder="Ej: admin"
                    value={input.username}
                    onChange={(e) => set('username', e.target.value)}
                    autoComplete="off"
                  />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="cred-email">Email</Label>
                  <Input
                    id="cred-email"
                    type="email"
                    placeholder="Ej: user@domain.com"
                    value={input.email}
                    onChange={(e) => set('email', e.target.value)}
                    autoComplete="off"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="cred-pass">Contraseña</Label>
                <Input
                  id="cred-pass"
                  type="password"
                  placeholder="••••••••"
                  value={input.password}
                  onChange={(e) => set('password', e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid gap-2">
            <Label>Tags</Label>
            <TagPicker selected={input.tagIds} onChange={(ids) => set('tagIds', ids)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="secret-notes">Notas (opcional)</Label>
            <Textarea
              id="secret-notes"
              placeholder="Comentarios, contexto, URL..."
              value={input.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={!isValid}>
            {editing ? 'Guardar cambios' : secretType === 'credential' ? 'Guardar credencial' : 'Guardar secreto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
