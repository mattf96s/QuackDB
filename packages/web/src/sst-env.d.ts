/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly STAGE: string
  readonly REGION: string
  readonly NODE_ENV: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}