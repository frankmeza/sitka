import { Action } from "redux"

export interface SitkaAction extends Action {
    _moduleId: string
    // tslint:disable-next-line:no-any
    _args: any
}
