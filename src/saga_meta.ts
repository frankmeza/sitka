export interface SagaMeta {
    // tslint:disable-next-line:no-any
    readonly handler: any
    readonly name: string
    readonly direct?: boolean
}
