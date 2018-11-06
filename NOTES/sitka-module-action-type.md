# `export type SitkaModuleAction<T> = Partial<T> & { type: string } | Action`

- is the returned shape from `export abstract class SitkaModule<MODULE_STATE extends ModuleState, MODULES>`

protected createAction(
		v: Partial<MODULE_STATE>
	): SitkaModuleAction<MODULE_STATE> {
