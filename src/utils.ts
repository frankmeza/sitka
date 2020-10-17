import snakeCase from "lodash.snakecase"

export const createStateChangeKey = (module: string) =>
    `module_${module}_change_state`.toUpperCase();

export const createHandlerKey = (module: string, handler: string) =>
    `module_${module}_${snakeCase(handler)}`.toUpperCase();

export const getInstanceMethodNames = (obj: {}, stop: {}) => {
    const array: string[] = [];
    let proto = Object.getPrototypeOf(obj);

    while (proto && proto !== stop) {
        Object.getOwnPropertyNames(proto).forEach(name => {
            if (name !== "constructor") {
                if (hasMethod(proto, name)) {
                    array.push(name);
                }
            }
        });

        proto = Object.getPrototypeOf(proto);
    }

    return array;
};

const hasMethod = (obj: {}, name: string) => {
    const desc = Object.getOwnPropertyDescriptor(obj, name);
    return !!desc && typeof desc.value === "function";
};
