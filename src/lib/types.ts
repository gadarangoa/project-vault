export type SecretType = 'env' | 'credential'

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
