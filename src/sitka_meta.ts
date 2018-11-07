import { Middleware, ReducersMapObject } from "redux"

export class SitkaMeta {
    public readonly defaultState: {}
    public readonly middleware: Middleware[]
    public readonly reducersToCombine: ReducersMapObject
    public readonly sagaRoot: (() => IterableIterator<{}>)
}
