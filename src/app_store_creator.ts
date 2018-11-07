import { Store } from "redux"
import { SitkaMeta } from "./sitka_meta"

export type AppStoreCreator = (sitaMeta: SitkaMeta) => Store