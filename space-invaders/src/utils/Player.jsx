export default class Player {
  constructor(name) {
    this.name = name;
  }

  move(e, setPos) {
    setPos((prev) => {
      switch (e.key) {
        case "ArrowLeft":
          return prev.x > 2 ? { ...prev, x: prev.x - 1 } : prev;
        case "ArrowRight":
          return prev.x < 128 ? { ...prev, x: prev.x + 1 } : prev;
        default:
          return prev;
      }
    });
  }
}
