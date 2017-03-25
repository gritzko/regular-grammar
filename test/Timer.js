class Timer {

    constructor () {
        this.stack = [];
    }

    push (name) {
        this.stack.push({
            time: Date.now(),
            name: name
        });
    }

    pop () {
        const now = Date.now();
        const mark = this.stack.pop();
        console.log(mark.name, (now-mark.time)+'ms');
    }

}

module.exports = Timer;
