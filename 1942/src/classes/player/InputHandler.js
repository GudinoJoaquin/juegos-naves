export class InputHandler {
    constructor() {
        this.keys = new Set();
        this.pressedKeys = new Set(); // New set for keys pressed once
        this.mouseClicked = false;
        this.mouseClickX = 0;
        this.mouseClickY = 0;

        this.touchPosition = { x: null, y: null }; // Store the current touch position
        this.touchActive = false; // Flag to indicate if touch is active

        window.addEventListener('keydown', (e) => {
            if (!this.keys.has(e.code)) { // Only add to pressedKeys if it wasn't already down
                this.pressedKeys.add(e.code);
            }
            this.keys.add(e.code);
        });
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });

        window.addEventListener('mousedown', (e) => {
            const rect = e.target.getBoundingClientRect();
            this.mouseClicked = true;
            this.mouseClickX = e.clientX - rect.left; // X relative to canvas
            this.mouseClickY = e.clientY - rect.top;  // Y relative to canvas
        });

        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                const rect = e.target.getBoundingClientRect();
                this.touchActive = true;
                this.touchPosition.x = e.touches[0].clientX - rect.left;
                this.touchPosition.y = e.touches[0].clientY - rect.top;
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const rect = e.target.getBoundingClientRect();
                this.touchPosition.x = e.touches[0].clientX - rect.left;
                this.touchPosition.y = e.touches[0].clientY - rect.top;
            }
        });

        window.addEventListener('touchend', (e) => {
            if (e.touches.length === 0) { // No more touches
                this.touchActive = false;
                this.touchPosition.x = null;
                this.touchPosition.y = null;
            }
        });
    }

    isKeyDown(key) { // For continuous press (e.g., movement)
        return this.keys.has(key);
    }

    isKeyPressed(key) { // For single press events (e.g., menu selection)
        return this.pressedKeys.has(key);
    }

    clearKey(key) { // To clear a pressed key after it's been handled
        this.pressedKeys.delete(key);
    }

    // Call this at the end of each game loop update to clear pressed keys
    clearPressedKeys() {
        this.pressedKeys.clear();
    }

    getMouseClick() {
        if (this.mouseClicked) {
            this.mouseClicked = false; // Reset click state after reading
            return { x: this.mouseClickX, y: this.mouseClickY };
        }
        return null;
    }

    getTouchPosition() {
        return this.touchActive ? { x: this.touchPosition.x, y: this.touchPosition.y } : null;
    }
}

