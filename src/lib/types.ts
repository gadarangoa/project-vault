import type { JSONContent } from '@tiptap/core'

export type SecretType = 'env' | 'credential'

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_test' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskType = 'task' | 'bug'

export type Project = {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export type Tag = {
  id: number
  projectId: number
  name: string
  color: string
}

export type Secret = {
  id: number
  projectId: number
  name: string
  type: SecretType
  key: string
  value: string
  username: string
  email: string
  password: string
  notes: string
  createdAt: string
  updatedAt: string
  tags: Tag[]
}

export type SecretInput = {
  projectId: number
  name: string
  type: SecretType
  key: string
  value: string
  username: string
  email: string
  password: string
  notes: string
  tagIds: number[]
}

export type VariableGroupVariable = {
  id: number
  groupId: number
  key: string
  value: string
  position: number
}

export type VariableGroup = {
  id: number
  projectId: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
  variables: VariableGroupVariable[]
}

export type VariableGroupVariableInput = {
  key: string
  value: string
}

export type VariableGroupInput = {
  projectId: number
  name: string
  description: string
  variables: VariableGroupVariableInput[]
}

export type Note = {
  id: number
  projectId: number
  title: string
  contentJson: JSONContent
  contentMarkdown: string
  pinned: boolean
  createdAt: string
  updatedAt: string
  tags: Tag[]
}

export type NoteInput = {
  projectId: number
  title: string
  contentJson: Note['contentJson']
  contentMarkdown: string
  pinned: boolean
  tagIds: number[]
}

export type Task = {
  id: number
  projectId: number
  title: string
  description: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  createdAt: string
  updatedAt: string
  completedAt: string | null
  tags: Tag[]
  checklistItems: TaskChecklistItem[]
}

export type TaskInput = {
  projectId: number
  title: string
  description: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  tagIds: number[]
}

export type TaskChecklistItem = {
  id: number
  taskId: number
  title: string
  completed: boolean
  completedAt: string | null
  position: number
  createdAt: string
  updatedAt: string
}

export type TaskChecklistItemInput = {
  taskId: number
  title: string
  completed?: boolean
  position?: number
}

export type FocusSession = {
  id: number
  projectId: number
  taskId: number
  plannedSeconds: number
  actualSeconds: number
  startedAt: string
  completedAt: string
}

export type FocusSessionInput = {
  projectId: number
  taskId: number
  plannedSeconds: number
  actualSeconds: number
  startedAt: string
  completedAt: string
}

export type FocusAchievement = {
  id: number
  projectId: number
  achievementKey: string
  unlockedAt: string
}
