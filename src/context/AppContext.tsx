import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as repo from '@/lib/repository'
import type { FocusAchievement, FocusSession, FocusSessionInput, Note, NoteInput, Project, Secret, SecretInput, Tag, Task, TaskChecklistItem, TaskChecklistItemInput, TaskInput, VariableGroup, VariableGroupInput } from '@/lib/types'

type AppContextValue = {
  ready: boolean
  error: string | null
  projects: Project[]
  selectedProject: Project | null
  secrets: Secret[]
  tags: Tag[]
  variableGroups: VariableGroup[]
  notes: Note[]
  tasks: Task[]
  focusSessions: FocusSession[]
  focusAchievements: FocusAchievement[]
  tagFilter: string | null
  search: string
  pinnedProjectIds: number[]
  recentProjectIds: number[]
  archivedProjectIds: number[]
  selectProject: (id: number | null) => void
  toggleProjectPinned: (id: number) => void
  archiveProject: (id: number) => void
  restoreProject: (id: number) => void
  markProjectRecent: (id: number) => void
  setTagFilter: (name: string | null) => void
  setSearch: (q: string) => void
  retry: () => Promise<void>
  createProject: (name: string, description: string) => Promise<Project>
  updateProject: (id: number, name: string, description: string) => Promise<void>
  deleteProject: (id: number) => Promise<void>
  createSecret: (input: SecretInput) => Promise<Secret>
  updateSecret: (id: number, input: SecretInput) => Promise<void>
  deleteSecret: (id: number) => Promise<void>
  createTag: (name: string, color: string) => Promise<Tag>
  updateTag: (id: number, name: string, color: string) => Promise<void>
  deleteTag: (id: number) => Promise<void>
  createVariableGroup: (input: VariableGroupInput) => Promise<VariableGroup>
  updateVariableGroup: (id: number, input: VariableGroupInput) => Promise<void>
  duplicateVariableGroup: (id: number) => Promise<VariableGroup>
  deleteVariableGroup: (id: number) => Promise<void>
  listNotes: (projectId: number) => Promise<Note[]>
  createNote: (input: NoteInput) => Promise<Note>
  updateNote: (id: number, input: NoteInput) => Promise<Note>
  toggleNotePin: (id: number) => Promise<Note>
  deleteNote: (id: number) => Promise<void>
  createTask: (input: TaskInput) => Promise<Task>
  updateTask: (id: number, input: TaskInput) => Promise<Task>
  deleteTask: (id: number) => Promise<void>
  listTaskChecklist: (taskId: number) => Promise<TaskChecklistItem[]>
  createTaskChecklistItem: (input: TaskChecklistItemInput) => Promise<TaskChecklistItem>
  updateTaskChecklistItem: (id: number, input: TaskChecklistItemInput) => Promise<TaskChecklistItem>
  deleteTaskChecklistItem: (id: number) => Promise<void>
  createFocusSession: (input: FocusSessionInput) => Promise<FocusSession>
}

const AppContext = createContext<AppContextValue | null>(null)

type ProjectNavigationPreferences = {
  pinnedProjectIds: number[]
  recentProjectIds: number[]
  archivedProjectIds: number[]
}

const NAVIGATION_STORAGE_KEY = 'secret-vault-project-navigation'

function readNavigationPreferences(): ProjectNavigationPreferences {
  const fallback = { pinnedProjectIds: [], recentProjectIds: [], archivedProjectIds: [] }
  try {
    const raw = window.localStorage.getItem(NAVIGATION_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<ProjectNavigationPreferences>
    return {
      pinnedProjectIds: Array.isArray(parsed.pinnedProjectIds) ? parsed.pinnedProjectIds.filter(Number.isInteger) : [],
      recentProjectIds: Array.isArray(parsed.recentProjectIds) ? parsed.recentProjectIds.filter(Number.isInteger).slice(0, 5) : [],
      archivedProjectIds: Array.isArray(parsed.archivedProjectIds) ? parsed.archivedProjectIds.filter(Number.isInteger) : [],
    }
  } catch {
    return fallback
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [secrets, setSecrets] = useState<Secret[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [variableGroups, setVariableGroups] = useState<VariableGroup[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([])
  const [focusAchievements, setFocusAchievements] = useState<FocusAchievement[]>([])
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [navigationPreferences, setNavigationPreferences] = useState(readNavigationPreferences)

  const updateNavigationPreferences = useCallback((update: (current: ProjectNavigationPreferences) => ProjectNavigationPreferences) => {
    setNavigationPreferences((current) => {
      const next = update(current)
      window.localStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const loadProjects = useCallback(async () => {
    setError(null)
    try {
      const list = await repo.listProjects()
      setProjects(list)
    } catch {
      setError('No se pudo abrir la bóveda local. Comprueba el almacenamiento del navegador e inténtalo de nuevo.')
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    void loadProjects()
  }, [loadProjects])

  const selectProject = useCallback(
    async (id: number | null) => {
      setSelectedId(id)
      setTagFilter(null)
      setSecrets([])
    setTags([])
      setVariableGroups([])
      setNotes([])
      setTasks([])
      setFocusSessions([])
      setFocusAchievements([])
      if (id === null) return
      const [secretList, tagList, groupList, noteList, taskList, sessionList, achievementList] = await Promise.all([repo.listSecrets(id), repo.listTags(id), repo.listVariableGroups(id), repo.listNotes(id), repo.listTasks(id), repo.listFocusSessions(id), repo.listFocusAchievements(id)])
      setSecrets(secretList)
      setTags(tagList)
      setVariableGroups(groupList)
      setNotes(noteList)
      setTasks(taskList)
      setFocusSessions(sessionList)
      setFocusAchievements(achievementList)
    },
    [],
  )

  const markProjectRecent = useCallback((id: number) => {
    updateNavigationPreferences((current) => ({
      ...current,
      recentProjectIds: [id, ...current.recentProjectIds.filter((projectId) => projectId !== id)].slice(0, 5),
    }))
  }, [updateNavigationPreferences])

  const toggleProjectPinned = useCallback((id: number) => {
    updateNavigationPreferences((current) => ({
      ...current,
      pinnedProjectIds: current.pinnedProjectIds.includes(id)
        ? current.pinnedProjectIds.filter((projectId) => projectId !== id)
        : [...current.pinnedProjectIds, id],
    }))
  }, [updateNavigationPreferences])

  const archiveProject = useCallback((id: number) => {
    updateNavigationPreferences((current) => ({
      ...current,
      archivedProjectIds: [...new Set([...current.archivedProjectIds, id])],
    }))
  }, [updateNavigationPreferences])

  const restoreProject = useCallback((id: number) => {
    updateNavigationPreferences((current) => ({
      ...current,
      archivedProjectIds: current.archivedProjectIds.filter((projectId) => projectId !== id),
    }))
  }, [updateNavigationPreferences])

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
    updateNavigationPreferences((current) => ({
      pinnedProjectIds: current.pinnedProjectIds.filter((projectId) => projectId !== id),
      recentProjectIds: current.recentProjectIds.filter((projectId) => projectId !== id),
      archivedProjectIds: current.archivedProjectIds.filter((projectId) => projectId !== id),
    }))
    if (selectedId === id) {
      setSelectedId(null)
      setSecrets([])
      setTags([])
      setVariableGroups([])
      setNotes([])
      setTasks([])
      setFocusSessions([])
      setFocusAchievements([])
    }
  }, [selectedId, updateNavigationPreferences])

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
    setTasks((prev) => prev.map((task) => ({ ...task, tags: task.tags.map((tag) => tag.id === id ? { ...tag, name, color } : tag) })))
  }, [])

  const deleteTag = useCallback(async (id: number) => {
    await repo.deleteTag(id)
    setTags((prev) => prev.filter((t) => t.id !== id))
    if (selectedId !== null) {
      setSecrets(await repo.listSecrets(selectedId))
      setTasks(await repo.listTasks(selectedId))
    }
  }, [selectedId])

  const createVariableGroup = useCallback(async (input: VariableGroupInput) => {
    const group = await repo.createVariableGroup(input)
    setVariableGroups((prev) => [group, ...prev])
    return group
  }, [])

  const updateVariableGroup = useCallback(async (id: number, input: VariableGroupInput) => {
    await repo.updateVariableGroup(id, input)
    const list = await repo.listVariableGroups(input.projectId)
    setVariableGroups(list)
  }, [])

  const duplicateVariableGroup = useCallback(async (id: number) => {
    const group = await repo.duplicateVariableGroup(id)
    setVariableGroups((prev) => [group, ...prev])
    return group
  }, [])

  const deleteVariableGroup = useCallback(async (id: number) => {
    await repo.deleteVariableGroup(id)
    setVariableGroups((prev) => prev.filter((group) => group.id !== id))
  }, [])

  const listNotes = useCallback(async (projectId: number) => {
    const list = await repo.listNotes(projectId)
    if (projectId === selectedId) setNotes(list)
    return list
  }, [selectedId])

  const createNote = useCallback(async (input: NoteInput) => {
    const note = await repo.createNote(input)
    if (input.projectId === selectedId) setNotes((prev) => [note, ...prev])
    return note
  }, [selectedId])

  const updateNote = useCallback(async (id: number, input: NoteInput) => {
    const note = await repo.updateNote(id, input)
    if (input.projectId === selectedId) setNotes((prev) => prev.map((item) => item.id === id ? note : item))
    return note
  }, [selectedId])

  const toggleNotePin = useCallback(async (id: number) => {
    const note = await repo.toggleNotePin(id)
    setNotes((prev) => prev.map((item) => item.id === id ? note : item))
    return note
  }, [])

  const deleteNote = useCallback(async (id: number) => {
    await repo.deleteNote(id)
    setNotes((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const createTask = useCallback(async (input: TaskInput) => {
    const task = await repo.createTask(input)
    if (input.projectId === selectedId) setTasks((prev) => [task, ...prev])
    return task
  }, [selectedId])

  const updateTask = useCallback(async (id: number, input: TaskInput) => {
    const task = await repo.updateTask(id, input)
    if (input.projectId === selectedId) setTasks((prev) => prev.map((item) => item.id === id ? task : item))
    return task
  }, [selectedId])

  const deleteTask = useCallback(async (id: number) => {
    await repo.deleteTask(id)
    setTasks((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const listTaskChecklist = useCallback(async (taskId: number) => {
    return repo.listTaskChecklist(taskId)
  }, [])

  const createTaskChecklistItem = useCallback(async (input: TaskChecklistItemInput) => {
    const item = await repo.createTaskChecklistItem(input)
    setTasks((prev) => prev.map((task) => task.id === input.taskId ? { ...task, checklistItems: [...task.checklistItems, item].sort((a, b) => a.position - b.position || a.id - b.id) } : task))
    return item
  }, [])

  const updateTaskChecklistItem = useCallback(async (id: number, input: TaskChecklistItemInput) => {
    const item = await repo.updateTaskChecklistItem(id, input)
    setTasks((prev) => prev.map((task) => task.id === item.taskId ? { ...task, checklistItems: task.checklistItems.map((check) => check.id === id ? item : check).sort((a, b) => a.position - b.position || a.id - b.id) } : task))
    if (selectedId !== null) setFocusAchievements(await repo.listFocusAchievements(selectedId))
    return item
  }, [selectedId])

  const deleteTaskChecklistItem = useCallback(async (id: number) => {
    await repo.deleteTaskChecklistItem(id)
    setTasks((prev) => prev.map((task) => ({ ...task, checklistItems: task.checklistItems.filter((item) => item.id !== id) })))
  }, [])

  const createFocusSession = useCallback(async (input: FocusSessionInput) => {
    const session = await repo.createFocusSession(input)
    if (input.projectId === selectedId) {
      setFocusSessions((prev) => [session, ...prev])
      setFocusAchievements(await repo.listFocusAchievements(input.projectId))
    }
    return session
  }, [selectedId])

  const value: AppContextValue = {
    ready,
    error,
    projects,
    selectedProject,
    secrets: filteredSecrets,
    tags,
    variableGroups,
    notes,
    tasks,
    focusSessions,
    focusAchievements,
    tagFilter,
    search,
    pinnedProjectIds: navigationPreferences.pinnedProjectIds,
    recentProjectIds: navigationPreferences.recentProjectIds,
    archivedProjectIds: navigationPreferences.archivedProjectIds,
    selectProject,
    toggleProjectPinned,
    archiveProject,
    restoreProject,
    markProjectRecent,
    setTagFilter,
    setSearch,
    retry: loadProjects,
    createProject,
    updateProject,
    deleteProject,
    createSecret,
    updateSecret,
    deleteSecret,
    createTag,
    updateTag,
    deleteTag,
    createVariableGroup,
    updateVariableGroup,
    duplicateVariableGroup,
    deleteVariableGroup,
    listNotes,
    createNote,
    updateNote,
    toggleNotePin,
    deleteNote,
    createTask,
    updateTask,
    deleteTask,
    listTaskChecklist,
    createTaskChecklistItem,
    updateTaskChecklistItem,
    deleteTaskChecklistItem,
    createFocusSession,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
