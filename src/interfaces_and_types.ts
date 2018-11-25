import { Action, Middleware, ReducersMapObject, Store } from "redux"

export type AppStoreCreator = (sitaMeta: SitkaMeta) => Store

export type ModuleState = {} | undefined | null

export interface SagaMeta {
    // tslint:disable-next-line:no-any
    readonly handler: any
    readonly name: string
    readonly direct?: boolean
}

export interface SitkaAction extends Action {
    _moduleId: string
    // tslint:disable-next-line:no-any
    _args: any
}

export class SitkaMeta {
    public readonly defaultState: {}
    public readonly middleware: Middleware[]
    public readonly reducersToCombine: ReducersMapObject
    public readonly sagaRoot: (() => IterableIterator<{}>)
}

export type SitkaModuleAction<T> = Partial<T> & { type: string } | Action