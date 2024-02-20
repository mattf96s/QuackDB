export interface Preset {
    id: string
    name: string
}

export const types = ["GPT-3", "Codex"] as const

export type ModelType = (typeof types)[number]

export interface Model<Type = string> {
    id: string
    name: string
    description: string
    strengths?: string
    type: Type
}