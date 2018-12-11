import { Dispatch, Store } from "redux";
import { AppStoreCreator, ModuleState, SitkaMeta, SitkaOptions } from "./interfaces_and_types";
import { SitkaModule } from "./sitka_module";
export declare class Sitka<MODULES = {}> {
    private sagas;
    private forks;
    private reducersToCombine;
    private middlewareToAdd;
    protected registeredModules: MODULES;
    private dispatch?;
    private sitkaOptions;
    constructor(sitkaOptions?: SitkaOptions);
    setDispatch(dispatch: Dispatch): void;
    getModules(): MODULES;
    createSitkaMeta(): SitkaMeta;
    createStore(appstoreCreator?: AppStoreCreator): Store<{}> | null;
    register<SITKA_MODULE extends SitkaModule<ModuleState, MODULES>>(instances: SITKA_MODULE[]): void;
    private getDefaultState;
    private createRoot;
    private doDispatch;
}
//# sourceMappingURL=sitka.d.ts.map