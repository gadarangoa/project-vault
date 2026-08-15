import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as repo from '@/lib/repository'
import type { Project, Secret, SecretInput, Tag } from '@/lib/types'

type AppContextValue = {
  ready: boolean
  projects: Project[]
  selectedProject: Project | null
  secrets: Secret[]
  tags: Tag[]
  tagFilter: string | null
  search: string
  selectProject: (id: number | null) => void
  setTagFilter: (name: string | null) => void
  setSearch: (q: string) => void
  createProject: (name: string, description: string) => Promise<Project>
  updateProject: (id: number, name: string, description: string) => Promise<void>
  deleteProject: (id: number) => Promise<void>
  createSecret: (input: SecretInput) => Promise<Secret>
  updateSecret: (id: number, input: SecretInput) => Promise<void>
  deleteSecret: (id: number) => Promise<void>
  createTag: (name: string, color: string) => Promise<Tag>
  updateTag: (id: number, name: string, color: string) => Promise<void>
  deleteTag: (id: number) => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadProjects = useCallback(async () => {
    const list = await repo.listProjects()
    setProjects(list)
    setReady(true)
  }, [])

  useEffect(() => {
    loadProjects().catch(console.error)
  }, [loadProjects])

  const selectProject = useCallback(
    async (id: number | null) => {
      setSelectedId(id)
      setTagFilter(null)
      setSecrets([])
      setTags([])
      if (id === null) return
      const [secretList, tagList] = await Promise.all([repo.listSecrets(id), repo.listTags(id)])
      setSecrets(secretList)
      setTags(tagList)
    },
    [],
  )

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedId) ?? null,
    [projects, selectedId],
  )

  const filteredSecrets = useMemo(() => {
    let result = secrets
    if (tagFilter) {
      result = result.filter((s) => s.tags.some((t) => t.name === tagFilter))
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((s) => {
        const haystack = [s.name, s.key, s.username, s.email, s.notes, s.tags.map((t) => t.name).join(' ')]
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
    }
    return result
  }, [secrets, tagFilter, search])

  const createProject = useCallback(async (name: string, description: string) => {
    const project = await repo.createProject(name, description)
    setProjects((prev) => [project, ...prev])
    return project
  }, [])

  const updateProject = useCallback(async (id: number, name: string, description: string) => {
    await repo.updateProject(id, name, description)
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name, description, updatedAt: new Date().toISOString() } : p)))
  }, [])

  const deleteProject = useCallback(async (id: number) => {
    await repo.deleteProject(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
    if (selectedId === id) {
      setSelectedId(null)
      setSecrets([])
      setTags([])
    }
  }, [selectedId])

  const createSecret = useCallback(async (input: SecretInput) => {
    const secret = await repo.createSecret(input)
    setSecrets((prev) => [secret, ...prev])
    return secret
  }, [])

  const updateSecret = useCallback(async (id: number, input: SecretInput) => {
    await repo.updateSecret(id, input)
    const list = await repo.listSecrets(input.projectId)
    setSecrets(list)
  }, [])

  const deleteSecret = useCallback(async (id: number) => {
    await repo.deleteSecret(id)
    setSecrets((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const createTag = useCallback(async (name: string, color: string) => {
    const tag = await repo.createTag(selectedId!, name, color)
    setTags((prev) => [...prev, tag])
    return tag
  }, [selectedId])

  const updateTag = useCallback(async (id: number, name: string, color: string) => {
    await repo.updateTag(id, name, color)
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, name, color } : t)))
  }, [])

  const deleteTag = useCallback(async (id: number) => {
    await repo.deleteTag(id)
    setTags((prev) => prev.filter((t) => t.id !== id))
    if (selectedId !== null) {
      setSecrets(await repo.listSecrets(selectedId))
    }
  }, [selectedId])

  const value: AppContextValue = {
    ready,
    projects,
    selectedProject,
    secrets: filteredSecrets,
    tags,
    tagFilter,
    search,
    selectProject,
    setTagFilter,
    setSearch,
    createProject,
    updateProject,
    deleteProject,
    createSecret,
    updateSecret,
    deleteSecret,
    createTag,
    updateTag,
    deleteTag,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}