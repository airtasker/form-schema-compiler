export default class Environment {
    constructor(parent) {
        this.vars = Object.create(null);
    }

    get(name) {
        if (name in this.vars) {
            return this.vars[name];
        }
        return null;
    }

    set(name, value = null) {
        this.vars[name] = value;
    }

    evaluateComponents(ast) {
        throw new Error("should implement this base on the framework you are using");
    }
}
