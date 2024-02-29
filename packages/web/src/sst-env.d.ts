/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_STAGE: string
  readonly VITE_REGION: string
  readonly VITE_NODE_ENV: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}