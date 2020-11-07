import { SagaMeta, SitkaModuleAction } from "../src/types";
import { CounterState } from "./test_data/test_index";
import { Action, Middleware } from "redux";

import CounterModule from "./test_data/test_counter_module";
import TestSitkaModule from "./test_data/test_sitka_module";

type TestSitkaModuleAction = SitkaModuleAction<CounterState>;

type TestAction = Action<"MODULE_COUNTER_CHANGE_STATE"> & {
    readonly counter: number;
};

describe("CounterModule", () => {
    const counterModule: CounterModule = new CounterModule();

    describe("public reduxKey()", () => {
        test("returns moduleName of this SitkaModule", () => {
            expect(counterModule.reduxKey()).toEqual("counter");
        });
    });

    const t = new TestSitkaModule();

    describe("protected createAction()", () => {
        describe("receives Partial<MODULE_STATE>; returns SitkaModuleAction", () => {
            test("when passed null as MODULE_STATE", () => {
                // this one is funny...
                const expected = {
                    type: "MODULE_COUNTER_CHANGE_STATE",
                    MODULE_COUNTER_CHANGE_STATE: null,
                };

                expect(t.testCreateActionNull()).toEqual(expected);
            });

            test("when passed {} as MODULE_STATE", () => {
                const expected: TestSitkaModuleAction = {
                    type: "MODULE_COUNTER_CHANGE_STATE",
                };

                expect(t.testCreateActionEmptyObject()).toEqual(expected);
            });

            test("when passed expected change to MODULE_STATE", () => {
                const expected: TestSitkaModuleAction = {
                    type: "MODULE_COUNTER_CHANGE_STATE",
                    counter: 42,
                };

                expect(t.testCreateAction()).toEqual(expected);
            });
        });
    });

    describe("protected setState()", () => {
        test("receives full module state; returns Redux Action", () => {
            const expected: TestAction = {
                type: "MODULE_COUNTER_CHANGE_STATE",
                counter: 42,
            };

            expect(t.testSetState()).toEqual(expected);
        });
    });

    describe("protected createSubscription()", () => {
        test("receives actionType string, handler function; returns SagaMeta", () => {
            const expected: SagaMeta = {
                name: "MODULE_COUNTER_CHANGE_STATE",
                handler: t.testCallbackFunction,
                direct: true,
            };

            expect(t.testCreateSubscription()).toEqual(expected);
        });
    });

    // this method allows this module to provide
    // middleware to the application at large
    describe("provideMiddleware()", () => {
        test("returns Middleware[]", () => {
            // defaults to returning []
            const expected: Middleware[] = [];
            expect(t.testProvideMiddleware()).toEqual(expected);
        });
    });

    // this method allows this module to listen for actions,
    // then run a callback function immediately afterwards
    describe("provideSubscriptions()", () => {
        test("returns SagaMeta[]", () => {
            // defaults to returning []
            const expected: SagaMeta[] = [];
            expect(t.testProvideSubscriptions()).toEqual(expected);
        });
    });
});
