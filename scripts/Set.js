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
        if (this.set.includes(element)) {
            return true;
        } else {
            return false;
        }
    }
    isEmpty() {
        if (this.set.length == 0) {
            return true;
        } else {
            return false;
        }
    }
    size() {
        return this.set.length;
    }
}