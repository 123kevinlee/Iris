//Custom Set Class since Javascript doesn't have one
class Set {
    constructor() {
        this.set = [];
    }
    add(element) {
        if (this.set.includes(element)) {
            return false;
        } else {
            this.set.push(element);
            return true;
        }
    }
    clear() {
        this.set = [];
    }
    contains() {
        return this.set.include(element) ? true : false;
    }
    isEmpty() {
        return this.set.length == 0 ? true : false;
    }
    size() {
        return this.set.length;
    }
}