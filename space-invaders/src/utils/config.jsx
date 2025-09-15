//creamos y inicializamos las constantes del jugador y enemigo
export const PLAYER_COOLDOWN = 300;
export const HORIZONTAL_MARGIN = 30;
export const PLAYER_SPEED = 200;
export const ENEMY_BULLET_SPEED = 80;

//creamos un arreglo de objetos el cual va a tener las propiedades de los enemigos
export const ENEMY_LEVELS = [
  { color: "red", speed: 50, image: "/src/assets/img/red.png", points: 5 },
  { color: "green", speed: 70, image: "/src/assets/img/green.png", points: 10 },
  {
    color: "yellow",
    speed: 90,
    image: "/src/assets/img/yellow.png",
    points: 15,
  },
];

//creamos y inicializamos del UFO que te da vida
export const UFO_INTERVAL = 15000;
export const UFO_INITIAL_DELAY = 10000;
export const UFO_SPEED = 120;

//se exportan todas al home
