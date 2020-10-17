import {
    Action,
    Middleware,
    ReducersMapObject,
    Store,
    StoreEnhancer,
} from "redux";
import { SagaMiddleware } from "redux-saga";
import { CallEffectFn } from "redux-saga/effects";

export class SitkaMeta {
    public readonly defaultState: {};
    public readonly middleware: Middleware[];
    public readonly reducersToCombine: ReducersMapObject;
    public readonly sagaRoot: (() => IterableIterator<{}>);
    public readonly sagaProvider: () => SitkaSagaMiddlewareProvider;
}

export type AppStoreCreator = (sitaMeta: SitkaMeta) => Store;

export type GeneratorContext = {
    readonly handlerKey: string;
    readonly fn: CallEffectFn<any>;
    readonly context: {};
};

export type ModuleState = {} | undefined | null;

export type PayloadAction = Action & {
    readonly payload?: {};
};

export type SagaMeta = {
    // tslint:disable-next-line:no-any
    readonly handler: any;
    readonly name: string;
    readonly direct?: boolean;
};

export type SitkaAction = Action & {
    _moduleId: string;
    // tslint:disable-next-line:no-any
    _args: any;
};

export type SitkaModuleAction<T> =
    | Partial<T> & { type: string; payload?: {} }
    | Action;

export type SitkaOptions = {
    readonly log?: boolean;
    readonly sitkaInState?: boolean;
};

export type SitkaSagaMiddlewareProvider = {
    middleware: SagaMiddleware<{}>;
    activate: () => void;
};

export type StoreOptions = {
    readonly initialState?: {};
    readonly reducersToCombine?: ReducersMapObject[];
    readonly storeEnhancers?: StoreEnhancer[];
    readonly middleware?: Middleware[];
    readonly sagaRoot?: () => IterableIterator<{}>;
    readonly log?: boolean;
};
