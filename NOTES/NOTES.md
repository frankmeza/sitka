# What are our pieces?

```typescript
// used to print out the changing module state name in the redux-logger
const createStateChangeKey = (module: string) => string
// similar to above function, this is used to print out the method call as a redux action
const createHandlerKey = (module: string, handler: string) => string
```

```typescript
export type SitkaModuleAction<T> = Partial<T> & { type: string } | Action

type ModuleState = {} | undefined | null

/*
	a sitka module is an abstract class, which takes two parameters:
	MODULE_STATE extends ModuleState, defined above as one of {}, undefined, null,
	MODULES // TODO
*/
export abstract class SitkaModule<MODULE_STATE extends ModuleState, MODULES> {
	public modules: MODULES
	public abstract moduleName: string
	public abstract defaultState: MODULE_STATE

	// by default, the redux key is same as the moduleName
	// and rtn this.moduleName
	public reduxKey(): string

	// rcv generic partial of class MODULE_STATE,
    // rtn generic SitkaModuleAction<MODULE_STATE>
    // => is only called within this class by this.setState()
    protected createAction(
        Partial<MODULE_STATE>,
    ): SitkaModuleAction<MODULE_STATE> => {}

    // rcv current module state
    // is called within instance of Sitka module,
    // when functions affect state directly
    protected setState(state: MODULE_STATE): Action => {}

    // rcv action and handler function
    // rtn a saga meta object
    protected createSubscription(
		actionType: string,
		handler: Function,
    ): SagaMeta => {}

    provideMiddleware(): Middleware[] {

export interface SagaMeta {
	// tslint:disable-next-line:no-any
	readonly handler: any
	readonly name: string
	readonly direct?: boolean
}

interface SitkaAction extends Action {
	readonly _moduleId: string
	// tslint:disable-next-line:no-any
	readonly _args: any
}


export class SitkaMeta { }

export type AppStoreCreator = (sitaMeta: SitkaMeta) => Store

// interesting, sitka is the universe
// that the sitka modules sit in.
// it makes sense to start here.
// this is what is actually reshaping the use of redux.
export class Sitka<MODULES = {}> {
	// tslint:disable-next-line:no-any
	private sagas: SagaMeta[] = []
	// tslint:disable-next-line:no-any
	private reducersToCombine: ReducersMapObject = {}
	private middlewareToAdd: Middleware[] = []
	protected registeredModules: MODULES
	private dispatch?: Dispatch

    // rcv dispatch (redux type) and sets it as this.dispatch
    public setDispatch(dispatch: Dispatch): void {}

}
```