import type { Note, NoteInput, Project, Secret, SecretInput, Tag, VariableGroup, VariableGroupInput } from './types'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null
    throw new Error(payload?.error || `La API respondió con ${response.status}`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function listProjects(): Promise<Project[]> { return request<Project[]>('/projects') }
export function getProject(id: number): Promise<Project | null> { return request<Project | null>(`/projects/${id}`) }
export function createProject(name: string, description: string): Promise<Project> {
  return request<Project>('/projects', { method: 'POST', body: JSON.stringify({ name, description }) })
}
export function updateProject(id: number, name: string, description: string): Promise<void> {
  return request<void>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify({ name, description }) })
}
export function deleteProject(id: number): Promise<void> { return request<void>(`/projects/${id}`, { method: 'DELETE' }) }
export function listSecrets(projectId: number): Promise<Secret[]> { return request<Secret[]>(`/projects/${projectId}/secrets`) }
export function createSecret(input: SecretInput): Promise<Secret> {
  return request<Secret>('/secrets', { method: 'POST', body: JSON.stringify(input) })
}
export function updateSecret(id: number, input: SecretInput): Promise<void> {
  return request<void>(`/secrets/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
}
export function deleteSecret(id: number): Promise<void> { return request<void>(`/secrets/${id}`, { method: 'DELETE' }) }
export function listTags(projectId: number): Promise<Tag[]> { return request<Tag[]>(`/projects/${projectId}/tags`) }
export function createTag(projectId: number, name: string, color: string): Promise<Tag> {
  return request<Tag>('/tags', { method: 'POST', body: JSON.stringify({ projectId, name, color }) })
}
export function updateTag(id: number, name: string, color: string): Promise<void> {
  return request<void>(`/tags/${id}`, { method: 'PATCH', body: JSON.stringify({ name, color }) })
}
export function deleteTag(id: number): Promise<void> { return request<void>(`/tags/${id}`, { method: 'DELETE' }) }

export function listVariableGroups(projectId: number): Promise<VariableGroup[]> {
  return request<VariableGroup[]>(`/projects/${projectId}/variable-groups`)
}
export function createVariableGroup(input: VariableGroupInput): Promise<VariableGroup> {
  return request<VariableGroup>('/variable-groups', { method: 'POST', body: JSON.stringify(input) })
}
export function updateVariableGroup(id: number, input: VariableGroupInput): Promise<void> {
  return request<void>(`/variable-groups/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
}
export function duplicateVariableGroup(id: number): Promise<VariableGroup> {
  return request<VariableGroup>(`/variable-groups/${id}/duplicate`, { method: 'POST' })
}
export function deleteVariableGroup(id: number): Promise<void> {
  return request<void>(`/variable-groups/${id}`, { method: 'DELETE' })
}

export function listNotes(projectId: number): Promise<Note[]> { return request<Note[]>(`/projects/${projectId}/notes`) }
export function createNote(input: NoteInput): Promise<Note> { return request<Note>('/notes', { method: 'POST', body: JSON.stringify(input) }) }
export function updateNote(id: number, input: NoteInput): Promise<Note> { return request<Note>(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(input) }) }
export function toggleNotePin(id: number): Promise<Note> { return request<Note>(`/notes/${id}/toggle-pin`, { method: 'POST' }) }
export function deleteNote(id: number): Promise<void> { return request<void>(`/notes/${id}`, { method: 'DELETE' }) }
