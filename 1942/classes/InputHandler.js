export class InputHandler {
    constructor() {
        this.keys = new Set();
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
        });
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
    }

    isPressed(key) {
        return this.keys.has(key);
    }
}
