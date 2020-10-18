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
    readonly context: {};
    readonly fn: CallEffectFn<any>;
    readonly handlerKey: string;
};

export type ModuleState = {} | undefined | null;

export type PayloadAction = Action & {
    readonly payload?: {};
};

export type SagaMeta = {
    readonly direct?: boolean;
    // tslint:disable-next-line:no-any
    readonly handler: any;
    readonly name: string;
};

export type SitkaAction = Action & {
    // tslint:disable-next-line:no-any
    _args: any;
    _moduleId: string;
};

export type SitkaModuleAction<T> =
    | Partial<T> & { type: string; payload?: {} }
    | Action;

export type SitkaOptions = {
    readonly log?: boolean;
    readonly sitkaInState?: boolean;
};

export type SitkaSagaMiddlewareProvider = {
    activate: () => void;
    middleware: SagaMiddleware<{}>;
};

export type StoreOptions = {
    readonly initialState?: {};
    readonly log?: boolean;
    readonly middleware?: Middleware[];
    readonly reducersToCombine?: ReducersMapObject[];
    readonly sagaRoot?: () => IterableIterator<{}>;
    readonly storeEnhancers?: StoreEnhancer[];
};
