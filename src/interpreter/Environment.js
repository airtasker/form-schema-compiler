export default class Environment {
    vars = Object.create(null);

    get(name) {
        if (name in this.vars) {
            return this.vars[name];
        }
        return null;
    }

    set(name, value = null) {
        this.vars[name] = value;
        return value; //  return value because assignment should return value e.g (a = 1)
    }

    evaluateComponents(ast) {
        throw new Error("should implement this base on the framework you are using");
    }
}
