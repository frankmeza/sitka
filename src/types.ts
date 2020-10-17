import {
    Action,
    Middleware,
    ReducersMapObject,
    Store,
    StoreEnhancer,
} from "redux";
import { SagaMiddleware } from "redux-saga";
import { CallEffectFn } from "redux-saga/effects";

export type PayloadAction = Action & {
    readonly payload?: {};
}

export type SitkaModuleAction<T> =
    | Partial<T> & { type: string; payload?: {} }
    | Action;

export type ModuleState = {} | undefined | null;

export type GeneratorContext = {
    readonly handlerKey: string;
    readonly fn: CallEffectFn<any>;
    readonly context: {};
}

export type SitkaSagaMiddlewareProvider = {
    middleware: SagaMiddleware<{}>;
    activate: () => void;
}

export type SagaMeta = {
    // tslint:disable-next-line:no-any
    readonly handler: any;
    readonly name: string;
    readonly direct?: boolean;
}

export type SitkaAction = Action & {
    _moduleId: string;
    // tslint:disable-next-line:no-any
    _args: any;
}

// tslint:disable-next-line:max-classes-per-file
export class SitkaMeta {
    public readonly defaultState: {};
    public readonly middleware: Middleware[];
    public readonly reducersToCombine: ReducersMapObject;
    public readonly sagaRoot: (() => IterableIterator<{}>);
    public readonly sagaProvider: () => SitkaSagaMiddlewareProvider;
}

export type AppStoreCreator = (sitaMeta: SitkaMeta) => Store;

export type SitkaOptions = {
    readonly log?: boolean;
    readonly sitkaInState?: boolean;
}

export type StoreOptions = {
    readonly initialState?: {};
    readonly reducersToCombine?: ReducersMapObject[];
    readonly storeEnhancers?: StoreEnhancer[];
    readonly middleware?: Middleware[];
    readonly sagaRoot?: () => IterableIterator<{}>;
    readonly log?: boolean;
}
