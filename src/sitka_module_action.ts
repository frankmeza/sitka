import { Action } from "redux"

export type SitkaModuleAction<T> = Partial<T> & { type: string } | Action