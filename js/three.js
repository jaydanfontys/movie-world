import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Each world has its own file now.
// This keeps the main three.js file cleaner.
import { createHubWorld } from "./hubworld.js";
import { createMovieWorld } from "./movieworld.js";
import { createTVWorld } from "./tvworld.js";
import { createMusicWorld } from "./musicworld.js";
import { createGameWorld } from "./gameworld.js";
import { createAnimeWorld } from "./animeworld.js";

// ===============================
// 1. BASIC SCENE SETUP
// ===============================

// This connects Three.js to the canvas in index.html.
const canvas = document.querySelector("#world");

// The scene is the full 3D world.
const scene = new THREE.Scene();
scene.background = new THREE.Color("#080812");

// This is the camera the player looks through.
const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// This draws the 3D world on the canvas.
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ===============================
// 2. HTML ELEMENTS
// ===============================

// Start screen
const startScreen = document.querySelector("#startScreen");
const startBtn = document.querySelector("#startBtn");

// Movie panel
const moviePanel = document.querySelector("#moviePanel");
const closePanel = document.querySelector("#closePanel");
const panelTitle = document.querySelector("#panelTitle");
const panelDescription = document.querySelector("#panelDescription");
const movieList = document.querySelector("#movieList");
const trailerFrame = document.querySelector("#trailerFrame");

// TV panel
const tvPanel = document.querySelector("#tvPanel");
const closeTvPanel = document.querySelector("#closeTvPanel");
const tvPanelTitle = document.querySelector("#tvPanelTitle");
const tvPanelDescription = document.querySelector("#tvPanelDescription");
const tvList = document.querySelector("#tvList");
const tvTrailerFrame = document.querySelector("#tvTrailerFrame");

// Music panel
const musicPanel = document.querySelector("#musicPanel");
const closeMusicPanel = document.querySelector("#closeMusicPanel");
const musicPanelTitle = document.querySelector("#musicPanelTitle");
const musicPanelDescription = document.querySelector("#musicPanelDescription");
const musicList = document.querySelector("#musicList");
const musicVideoFrame = document.querySelector("#musicVideoFrame");

// Game panel
const gamePanel = document.querySelector("#gamePanel");
const closeGamePanel = document.querySelector("#closeGamePanel");
const gamePanelTitle = document.querySelector("#gamePanelTitle");
const gamePanelDescription = document.querySelector("#gamePanelDescription");
const gameList = document.querySelector("#gameList");
const gameTrailerFrame = document.querySelector("#gameTrailerFrame");

// Anime panel
const animePanel = document.querySelector("#animePanel");
const closeAnimePanel = document.querySelector("#closeAnimePanel");
const animePanelTitle = document.querySelector("#animePanelTitle");
const animePanelDescription = document.querySelector("#animePanelDescription");
const animeList = document.querySelector("#animeList");
const animeTrailerFrame = document.querySelector("#animeTrailerFrame");

// HUD text
const currentGenreText = document.querySelector("#currentGenre");

// Mobile controls
const joystick = document.querySelector("#joystick");
const joystickKnob = document.querySelector("#joystickKnob");
const mobileBrake = document.querySelector("#mobileBrake");

// ===============================
// 3. GAME VARIABLES
// ===============================

const keys = {};

let speed = 0;
let rotationSpeed = 0;
let currentStation = null;
let gameStarted = false;

// Mobile joystick values
let joystickForward = 0;
let joystickTurn = 0;
let mobileBrakePressed = false;

// The car is now a group that holds the selected car.
let car = null;
let activeCarModel = null;

// These buttons come from the car selection cards in index.html.
const carModelButtons = document.querySelectorAll(".carModelCard");

// This car system supports both simple block cars and 3D model cars.
// For user testing, the block cars are safer on phones.
const CAR_OPTIONS = {
  redBlock: {
    name: "Red Block Car",
    type: "basic",
    color: "#d62828"
  },

  blueBlock: {
    name: "Blue Block Car",
    type: "basic",
    color: "#1d4ed8"
  },

  blackBlock: {
    name: "Black Block Car",
    type: "basic",
    color: "#111111"
  },

  challenger: {
    name: "Dodge Challenger",
    type: "model",
    path: "models/dodge_challenger.glb",
    targetLength: 5.2,

    // Change this to Math.PI if the car faces backwards.
    rotationY: 0
  },

  charger: {
    name: "Dodge Charger",
    type: "model",
    path: "models/dodge_charger.glb",
    targetLength: 5.2,

    // Change this to Math.PI if the car faces backwards.
    rotationY: 0
  }
};

// Default car for user testing.
let selectedCarKey = "redBlock";

// ===============================
// 4. WORLD POSITIONS
// ===============================

// These are the positions of all worlds.
// x = left/right position
// z = forward/backward position
// radius = playable circle size
const WORLD_POSITIONS = {
  hub: { x: 0, z: 0, radius: 58 },

  movie: { x: 0, z: -180, radius: 55 },
  tv: { x: 145, z: -105, radius: 55 },
  game: { x: 145, z: 105, radius: 55 },
  music: { x: -145, z: 105, radius: 55 },
  anime: { x: -145, z: -105, radius: 55 }
};

// These are the bridges the car is allowed to drive on.
// The same list is used for bridge collision, so the car does not hit invisible walls.
const BRIDGE_CONNECTIONS = [
  ["hub", "movie"],
  ["hub", "tv"],
  ["hub", "game"],
  ["hub", "music"],
  ["hub", "anime"],

  ["movie", "tv"],
  ["tv", "game"],
  ["game", "music"],
  ["music", "anime"],
  ["anime", "movie"]
];

// ===============================
// 5. CAR SELECTION
// ===============================

carModelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const carKey = button.dataset.car;

    // If the button is for a coming soon car, do nothing.
    if (!CAR_OPTIONS[carKey]) return;

    selectedCarKey = carKey;

    carModelButtons.forEach((btn) => {
      btn.classList.remove("selected");
    });

    button.classList.add("selected");

    // If the car already exists in the world, replace it live.
    if (car) {
      loadSelectedCar();
    }
  });
});

// ===============================
// 6. BUTTONS AND KEYBOARD
// ===============================

if (startBtn) {
  startBtn.addEventListener("click", () => {
    if (startScreen) {
      startScreen.style.display = "none";
    }

    gameStarted = true;
    console.log("Game started");
  });
}

if (closePanel) {
  closePanel.addEventListener("click", closeMoviePanel);
}

if (closeTvPanel) {
  closeTvPanel.addEventListener("click", closeTVPanel);
}

if (closeMusicPanel) {
  closeMusicPanel.addEventListener("click", closeMusicPanelFunction);
}

if (closeGamePanel) {
  closeGamePanel.addEventListener("click", closeGamePanelFunction);
}

if (closeAnimePanel) {
  closeAnimePanel.addEventListener("click", closeAnimePanelFunction);
}

// Save which keys are being pressed.
window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

// ===============================
// 7. MOBILE JOYSTICK CONTROLS
// ===============================

let joystickActive = false;
let joystickCenterX = 0;
let joystickCenterY = 0;
const joystickMaxDistance = 42;

if (joystick && joystickKnob) {
  joystick.addEventListener("pointerdown", (event) => {
    joystickActive = true;

    const rect = joystick.getBoundingClientRect();
    joystickCenterX = rect.left + rect.width / 2;
    joystickCenterY = rect.top + rect.height / 2;

    joystick.setPointerCapture(event.pointerId);
    updateJoystick(event);
  });

  joystick.addEventListener("pointermove", (event) => {
    if (!joystickActive) return;
    updateJoystick(event);
  });

  joystick.addEventListener("pointerup", () => {
    resetJoystick();
  });

  joystick.addEventListener("pointercancel", () => {
    resetJoystick();
  });
}

if (mobileBrake) {
  mobileBrake.addEventListener("pointerdown", () => {
    mobileBrakePressed = true;
  });

  mobileBrake.addEventListener("pointerup", () => {
    mobileBrakePressed = false;
  });

  mobileBrake.addEventListener("pointercancel", () => {
    mobileBrakePressed = false;
  });

  mobileBrake.addEventListener("pointerleave", () => {
    mobileBrakePressed = false;
  });
}

function updateJoystick(event) {
  const deltaX = event.clientX - joystickCenterX;
  const deltaY = event.clientY - joystickCenterY;

  const distance = Math.min(
    Math.sqrt(deltaX * deltaX + deltaY * deltaY),
    joystickMaxDistance
  );

  const angle = Math.atan2(deltaY, deltaX);

  const knobX = Math.cos(angle) * distance;
  const knobY = Math.sin(angle) * distance;

  joystickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;

  // Left and right steering.
// We make right negative and left positive because the car rotation uses:
// positive = left, negative = right.
joystickTurn = -knobX / joystickMaxDistance;

  // Up moves forward. Down reverses.
  joystickForward = -knobY / joystickMaxDistance;
}

function resetJoystick() {
  joystickActive = false;
  joystickForward = 0;
  joystickTurn = 0;

  if (joystickKnob) {
    joystickKnob.style.transform = "translate(-50%, -50%)";
  }
}

// ===============================
// 8. LIGHTING
// ===============================

const ambientLight = new THREE.AmbientLight("#ffffff", 0.58);
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight("#ffffff", 1.4);
moonLight.position.set(20, 35, 15);
scene.add(moonLight);

// ===============================
// 9. CREATE WORLDS
// ===============================

// Central hub
const hubWorld = createHubWorld(
  scene,
  createFloatingText,
  WORLD_POSITIONS.hub
);

// Movie World
const movieWorld = createMovieWorld(
  scene,
  createFloatingText,
  WORLD_POSITIONS.movie
);
const movieStations = movieWorld.movieStations;

// TV World
const tvWorld = createTVWorld(
  scene,
  createFloatingText,
  WORLD_POSITIONS.tv
);
const tvTheaters = tvWorld.tvTheaters;

// Music World
const musicWorld = createMusicWorld(
  scene,
  createFloatingText,
  WORLD_POSITIONS.music
);
const musicStations = musicWorld.musicStations;

// Game World
const gameWorld = createGameWorld(
  scene,
  createFloatingText,
  WORLD_POSITIONS.game
);
const gameStations = gameWorld.gameStations;

// Anime World
const animeWorld = createAnimeWorld(
  scene,
  createFloatingText,
  WORLD_POSITIONS.anime
);
const animeStations = animeWorld.animeStations;

// ===============================
// 10. CREATE BRIDGES
// ===============================

// Main bridges from the central hub.
createBridgeBetween(WORLD_POSITIONS.hub, WORLD_POSITIONS.movie, "#ffcc66", "MOVIE WORLD");
createBridgeBetween(WORLD_POSITIONS.hub, WORLD_POSITIONS.tv, "#7cc7ff", "TV WORLD");
createBridgeBetween(WORLD_POSITIONS.hub, WORLD_POSITIONS.game, "#80ed99", "GAME WORLD");
createBridgeBetween(WORLD_POSITIONS.hub, WORLD_POSITIONS.music, "#ff8ee8", "MUSIC WORLD");
createBridgeBetween(WORLD_POSITIONS.hub, WORLD_POSITIONS.anime, "#ff6b6b", "ANIME WORLD");

// Extra bridges between the outside worlds.
createBridgeBetween(WORLD_POSITIONS.movie, WORLD_POSITIONS.tv, "#7cc7ff", "TV");
createBridgeBetween(WORLD_POSITIONS.tv, WORLD_POSITIONS.game, "#80ed99", "GAME");
createBridgeBetween(WORLD_POSITIONS.game, WORLD_POSITIONS.music, "#ff8ee8", "MUSIC");
createBridgeBetween(WORLD_POSITIONS.music, WORLD_POSITIONS.anime, "#ff6b6b", "ANIME");
createBridgeBetween(WORLD_POSITIONS.anime, WORLD_POSITIONS.movie, "#ffcc66", "MOVIES");

// ===============================
// 11. ENVIRONMENT
// ===============================

// You removed the pine trees, so I did not add them back.
addStars();

// ===============================
// 12. PLAYER CAR
// ===============================

car = createCar();
scene.add(car);

// Start the player in the central hub.
car.position.set(0, 0.45, 18);
car.rotation.y = Math.PI;

// Camera starting position
camera.position.set(0, 16, 34);
camera.lookAt(car.position);

// ===============================
// 13. BRIDGE SYSTEM
// ===============================

function createBridgeBetween(startWorld, endWorld, color, label) {
  const start = new THREE.Vector3(startWorld.x, 0, startWorld.z);
  const end = new THREE.Vector3(endWorld.x, 0, endWorld.z);

  const direction = new THREE.Vector3().subVectors(end, start).normalize();

  // This makes the bridge start at the edge of one world
  // and end at the edge of the next world.
  const bridgeStart = start.clone().add(
    direction.clone().multiplyScalar(startWorld.radius - 2)
  );

  const bridgeEnd = end.clone().add(
    direction.clone().multiplyScalar(-(endWorld.radius - 2))
  );

  const center = new THREE.Vector3()
    .addVectors(bridgeStart, bridgeEnd)
    .multiplyScalar(0.5);

  const length = bridgeStart.distanceTo(bridgeEnd);

  // Rotate the bridge so it points toward the next world.
  const angle = Math.atan2(direction.x, direction.z);

  const bridgeGroup = new THREE.Group();
  bridgeGroup.position.set(center.x, 0, center.z);
  bridgeGroup.rotation.y = angle;

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(12, 0.35, length),
    new THREE.MeshStandardMaterial({
      color: "#1a1a1a",
      roughness: 0.65
    })
  );
  floor.position.y = -0.1;
  bridgeGroup.add(floor);

  const centerLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.05, length - 5),
    new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.9
    })
  );
  centerLine.position.y = 0.1;
  bridgeGroup.add(centerLine);

  const leftRail = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 1.1, length),
    new THREE.MeshStandardMaterial({
      color: "#333333"
    })
  );
  leftRail.position.set(-6, 0.45, 0);
  bridgeGroup.add(leftRail);

  const rightRail = leftRail.clone();
  rightRail.position.x = 6;
  bridgeGroup.add(rightRail);

  const bridgeText = createFloatingText(label, color);
  bridgeText.position.set(-5, 4.8, 0);
  bridgeGroup.add(bridgeText);

  scene.add(bridgeGroup);
}

// ===============================
// 14. CREATE CAR
// ===============================

function createCar() {
  const group = new THREE.Group();

  // Load the selected car into this group.
  loadSelectedCar(group);

  return group;
}

function loadSelectedCar(targetCarGroup = car) {
  if (!targetCarGroup) return;

  const selectedCar = CAR_OPTIONS[selectedCarKey];

  // Remove the previous car before adding the new one.
  while (targetCarGroup.children.length > 0) {
    const child = targetCarGroup.children[0];
    targetCarGroup.remove(child);
  }

  if (selectedCar.type === "basic") {
    const basicCar = createBasicCar(selectedCar.color);
    targetCarGroup.add(basicCar);

    console.log(`${selectedCar.name} loaded.`);
    return;
  }

  if (selectedCar.type === "model") {
    loadSelectedCarModel(targetCarGroup, selectedCar);
  }
}

function loadSelectedCarModel(targetCarGroup, selectedCar) {
  const loader = new GLTFLoader();

  loader.load(
    selectedCar.path,

    function (gltf) {
      activeCarModel = gltf.scene;

      // Put the model inside a wrapper so we can center and scale it properly.
      const modelWrapper = new THREE.Group();
      modelWrapper.add(activeCarModel);

      // Calculate the size and center of the model.
      const box = new THREE.Box3().setFromObject(activeCarModel);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();

      box.getSize(size);
      box.getCenter(center);

      // Move the model so its center is inside the car group.
      activeCarModel.position.x -= center.x;
      activeCarModel.position.y -= box.min.y;
      activeCarModel.position.z -= center.z;

      // Automatically scale the car to a good size.
      const currentLength = Math.max(size.x, size.z);
      const scaleFactor = selectedCar.targetLength / currentLength;

      modelWrapper.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Rotate the car so it faces the correct driving direction.
      modelWrapper.rotation.y = selectedCar.rotationY;

      targetCarGroup.add(modelWrapper);

      console.log(`${selectedCar.name} loaded.`);
    },

    function () {
      console.log(`${selectedCar.name} is loading...`);
    },

    function (error) {
      console.log(`${selectedCar.name} could not load. Basic backup car added.`, error);

      const backupCar = createBasicCar("#d62828");
      targetCarGroup.add(backupCar);
    }
  );
}

function createBasicCar(color) {
  const group = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.5
  });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.75, 4.2),
    bodyMaterial
  );
  body.position.y = 0.65;
  group.add(body);

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 0.7, 1.9),
    new THREE.MeshStandardMaterial({
      color: "#f77f00",
      roughness: 0.45
    })
  );
  top.position.set(0, 1.25, -0.35);
  group.add(top);

  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.08, 0.75),
    new THREE.MeshStandardMaterial({
      color: "#9bdcff",
      emissive: "#2d9cdb",
      emissiveIntensity: 0.25
    })
  );
  windshield.position.set(0, 1.45, 0.55);
  group.add(windshield);

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: "#050505"
  });

  const wheelPositions = [
    [-1.3, 0.35, 1.45],
    [1.3, 0.35, 1.45],
    [-1.3, 0.35, -1.45],
    [1.3, 0.35, -1.45]
  ];

  wheelPositions.forEach((pos) => {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.38, 0.3, 20),
      wheelMaterial
    );

    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(pos[0], pos[1], pos[2]);
    group.add(wheel);
  });

  const lightMaterial = new THREE.MeshStandardMaterial({
    color: "#fff3b0",
    emissive: "#fff3b0",
    emissiveIntensity: 1.4
  });

  const leftLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.18, 0.08),
    lightMaterial
  );
  leftLight.position.set(-0.6, 0.82, 2.12);
  group.add(leftLight);

  const rightLight = leftLight.clone();
  rightLight.position.x = 0.6;
  group.add(rightLight);

  const backLightMaterial = new THREE.MeshStandardMaterial({
    color: "#ff3333",
    emissive: "#ff3333",
    emissiveIntensity: 0.8
  });

  const leftBackLight = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.16, 0.08),
    backLightMaterial
  );
  leftBackLight.position.set(-0.6, 0.8, -2.12);
  group.add(leftBackLight);

  const rightBackLight = leftBackLight.clone();
  rightBackLight.position.x = 0.6;
  group.add(rightBackLight);

  return group;
}

// ===============================
// 15. FLOATING TEXT
// ===============================

function createFloatingText(text, color) {
  const textCanvas = document.createElement("canvas");
  textCanvas.width = 1024;
  textCanvas.height = 256;

  const ctx = textCanvas.getContext("2d");
  ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);

  ctx.fillStyle = color;
  ctx.font = "bold 90px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.shadowColor = color;
  ctx.shadowBlur = 25;
  ctx.fillText(text, 30, 130);

  const texture = new THREE.CanvasTexture(textCanvas);

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(7, 1.8, 1);

  return sprite;
}

// ===============================
// 16. STARS
// ===============================

function addStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 900;
  const positions = [];

  for (let i = 0; i < starCount; i++) {
    positions.push(
      (Math.random() - 0.5) * 520,
      Math.random() * 150 + 20,
      (Math.random() - 0.5) * 520
    );
  }

  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: "#ffffff",
      size: 0.25
    })
  );

  scene.add(stars);
}

// ===============================
// 17. CAR MOVEMENT
// ===============================

function updateCarMovement() {
  if (!gameStarted) return;

  const forwardPressed = keys["w"] || keys["arrowup"];
  const backwardPressed = keys["s"] || keys["arrowdown"];
  const leftPressed = keys["a"] || keys["arrowleft"];
  const rightPressed = keys["d"] || keys["arrowright"];

  let forwardInput = 0;
  let turnInput = 0;

  // Keyboard input
  if (forwardPressed) {
    forwardInput += 1;
  }

  if (backwardPressed) {
    forwardInput -= 1;
  }

  if (leftPressed) {
    turnInput += 1;
  }

  if (rightPressed) {
    turnInput -= 1;
  }

  // Mobile joystick input
  forwardInput += joystickForward;
  turnInput += joystickTurn;

  forwardInput = THREE.MathUtils.clamp(forwardInput, -1, 1);
  turnInput = THREE.MathUtils.clamp(turnInput, -1, 1);

  if (forwardInput > 0.05) {
    speed += 0.015 * forwardInput;
  } else if (forwardInput < -0.05) {
    speed += 0.012 * forwardInput;
  } else {
    speed *= 0.94;
  }

  if (mobileBrakePressed) {
    speed *= 0.82;
  }

  speed = THREE.MathUtils.clamp(speed, -0.18, 0.32);

  if (Math.abs(speed) > 0.01) {
    car.rotation.y += 0.04 * turnInput * Math.sign(speed);
  }

  // Save old position first.
  // If the car moves outside the world or bridge,
  // it will be placed back here.
  const previousX = car.position.x;
  const previousZ = car.position.z;

  car.position.x += Math.sin(car.rotation.y) * speed;
  car.position.z += Math.cos(car.rotation.y) * speed;

  if (!isCarInPlayableArea()) {
    car.position.x = previousX;
    car.position.z = previousZ;
    speed *= -0.25;
  }
}

// ===============================
// 18. PLAYABLE AREA CHECK
// ===============================

function isCarInPlayableArea() {
  const point = new THREE.Vector2(car.position.x, car.position.z);

  // Check if the car is inside one of the worlds.
  const worldKeys = Object.keys(WORLD_POSITIONS);

  for (const key of worldKeys) {
    const world = WORLD_POSITIONS[key];

    if (isInsideCircle(point.x, point.y, world.x, world.z, world.radius)) {
      return true;
    }
  }

  // Check if the car is on one of the bridges.
  for (const connection of BRIDGE_CONNECTIONS) {
    const start = WORLD_POSITIONS[connection[0]];
    const end = WORLD_POSITIONS[connection[1]];

    if (isPointOnBridge(point, start, end)) {
      return true;
    }
  }

  return false;
}

function isInsideCircle(x, z, centerX, centerZ, radius) {
  const dx = x - centerX;
  const dz = z - centerZ;

  return Math.sqrt(dx * dx + dz * dz) <= radius;
}

function isPointOnBridge(point, startWorld, endWorld) {
  const start = new THREE.Vector2(startWorld.x, startWorld.z);
  const end = new THREE.Vector2(endWorld.x, endWorld.z);

  const direction = new THREE.Vector2().subVectors(end, start).normalize();

  const bridgeStart = start.clone().add(
    direction.clone().multiplyScalar(startWorld.radius - 2)
  );

  const bridgeEnd = end.clone().add(
    direction.clone().multiplyScalar(-(endWorld.radius - 2))
  );

  const bridgeVector = new THREE.Vector2().subVectors(bridgeEnd, bridgeStart);
  const pointVector = new THREE.Vector2().subVectors(point, bridgeStart);

  const bridgeLength = bridgeVector.length();
  const bridgeDirection = bridgeVector.clone().normalize();

  const distanceAlongBridge = pointVector.dot(bridgeDirection);

  // If the car is before the bridge start or after bridge end, it is not on the bridge.
  if (distanceAlongBridge < 0 || distanceAlongBridge > bridgeLength) {
    return false;
  }

  const closestPoint = bridgeStart.clone().add(
    bridgeDirection.clone().multiplyScalar(distanceAlongBridge)
  );

  const sideDistance = point.distanceTo(closestPoint);

  // This number is the bridge width for collision.
  // Higher number = easier to drive on bridge.
  return sideDistance <= 7;
}

// ===============================
// 19. CAMERA FOLLOW
// ===============================

function updateCamera() {
  const cameraOffset = new THREE.Vector3(
    -Math.sin(car.rotation.y) * 9,
    6,
    -Math.cos(car.rotation.y) * 9
  );

  const targetCameraPosition = car.position.clone().add(cameraOffset);

  camera.position.lerp(targetCameraPosition, 0.08);

  const lookTarget = car.position.clone();
  lookTarget.y += 1.2;
  camera.lookAt(lookTarget);
}

// ===============================
// 20. STATION INTERACTION
// ===============================

function checkStationDistance() {
  const nearestMovie = getNearestStation(movieStations);
  const nearestTV = getNearestStation(tvTheaters);
  const nearestMusic = getNearestStation(musicStations);
  const nearestGame = getNearestStation(gameStations);
  const nearestAnime = getNearestStation(animeStations);

  if (nearestMovie.station && nearestMovie.distance < 8) {
    currentGenreText.textContent = `${nearestMovie.station.genre.name} Movie Theater`;

    if (currentStation !== nearestMovie.station) {
      closeAllPanels();
      openMoviePanel(nearestMovie.station.genre);
      currentStation = nearestMovie.station;
    }
  } else if (nearestTV.station && nearestTV.distance < 8) {
    currentGenreText.textContent = `${nearestTV.station.genre.name} TV Station`;

    if (currentStation !== nearestTV.station) {
      closeAllPanels();
      openTVPanel(nearestTV.station.genre);
      currentStation = nearestTV.station;
    }
  } else if (nearestMusic.station && nearestMusic.distance < 8) {
    currentGenreText.textContent = `${nearestMusic.station.genre.name} Music Stage`;

    if (currentStation !== nearestMusic.station) {
      closeAllPanels();
      openMusicPanel(nearestMusic.station.genre);
      currentStation = nearestMusic.station;
    }
  } else if (nearestGame.station && nearestGame.distance < 8) {
    currentGenreText.textContent = `${nearestGame.station.genre.name} Game Station`;

    if (currentStation !== nearestGame.station) {
      closeAllPanels();
      openGamePanel(nearestGame.station.genre);
      currentStation = nearestGame.station;
    }
  } else if (nearestAnime.station && nearestAnime.distance < 8) {
    currentGenreText.textContent = `${nearestAnime.station.genre.name} Station`;

    if (currentStation !== nearestAnime.station) {
      closeAllPanels();
      openAnimePanel(nearestAnime.station.genre);
      currentStation = nearestAnime.station;
    }
  } else {
    closeAllPanels();
    updateLocationText();
    currentStation = null;
  }
}

function getNearestStation(stations) {
  let nearestStation = null;
  let nearestDistance = Infinity;

  stations.forEach((station) => {
    const distance = car.position.distanceTo(station.trigger);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestStation = station;
    }
  });

  return {
    station: nearestStation,
    distance: nearestDistance
  };
}

function updateLocationText() {
  const x = car.position.x;
  const z = car.position.z;

  if (isInsideCircle(x, z, WORLD_POSITIONS.hub.x, WORLD_POSITIONS.hub.z, WORLD_POSITIONS.hub.radius)) {
    currentGenreText.textContent = "Central Entertainment Hub";
  } else if (isInsideCircle(x, z, WORLD_POSITIONS.movie.x, WORLD_POSITIONS.movie.z, WORLD_POSITIONS.movie.radius)) {
    currentGenreText.textContent = "Movie World";
  } else if (isInsideCircle(x, z, WORLD_POSITIONS.tv.x, WORLD_POSITIONS.tv.z, WORLD_POSITIONS.tv.radius)) {
    currentGenreText.textContent = "TV Show World";
  } else if (isInsideCircle(x, z, WORLD_POSITIONS.music.x, WORLD_POSITIONS.music.z, WORLD_POSITIONS.music.radius)) {
    currentGenreText.textContent = "Music World";
  } else if (isInsideCircle(x, z, WORLD_POSITIONS.game.x, WORLD_POSITIONS.game.z, WORLD_POSITIONS.game.radius)) {
    currentGenreText.textContent = "Game World";
  } else if (isInsideCircle(x, z, WORLD_POSITIONS.anime.x, WORLD_POSITIONS.anime.z, WORLD_POSITIONS.anime.radius)) {
    currentGenreText.textContent = "Anime World";
  } else {
    currentGenreText.textContent = "Bridge";
  }
}

// ===============================
// 21. PANEL HELPERS
// ===============================

function closeAllPanels() {
  closeMoviePanel();
  closeTVPanel();
  closeMusicPanelFunction();
  closeGamePanelFunction();
  closeAnimePanelFunction();
}

// ===============================
// 22. MOVIE PANEL
// ===============================

function openMoviePanel(genre) {
  if (!moviePanel) return;

  panelTitle.textContent = `${genre.name} Drive-In`;
  panelDescription.textContent = genre.description;
  movieList.innerHTML = "";

  genre.movies.forEach((movie, index) => {
    const card = document.createElement("div");
    card.className = "movieCard";

    card.innerHTML = `
      <h3>${movie.title}</h3>
      <p>${movie.note}</p>
    `;

    card.addEventListener("mouseenter", () => {
      trailerFrame.src = movie.trailer;
    });

    card.addEventListener("click", () => {
      window.open(movie.trailer, "_blank");
    });

    movieList.appendChild(card);

    if (index === 0) {
      trailerFrame.src = movie.trailer;
    }
  });

  moviePanel.classList.remove("hidden");
}

function closeMoviePanel() {
  if (!moviePanel) return;

  moviePanel.classList.add("hidden");

  if (trailerFrame) {
    trailerFrame.src = "";
  }
}

// ===============================
// 23. TV PANEL
// ===============================

function openTVPanel(genre) {
  if (!tvPanel) return;

  tvPanelTitle.textContent = `${genre.name} TV Station`;
  tvPanelDescription.textContent = genre.description;
  tvList.innerHTML = "";

  genre.shows.forEach((show, index) => {
    const card = document.createElement("div");
    card.className = "tvCard";

    card.innerHTML = `
      <h3>${show.title}</h3>
      <p>${show.note}</p>
    `;

    card.addEventListener("mouseenter", () => {
      tvTrailerFrame.src = show.trailer;
    });

    card.addEventListener("click", () => {
      window.open(show.trailer, "_blank");
    });

    tvList.appendChild(card);

    if (index === 0) {
      tvTrailerFrame.src = show.trailer;
    }
  });

  tvPanel.classList.remove("hidden");
}

function closeTVPanel() {
  if (!tvPanel) return;

  tvPanel.classList.add("hidden");

  if (tvTrailerFrame) {
    tvTrailerFrame.src = "";
  }
}

// ===============================
// 24. MUSIC PANEL
// ===============================

function openMusicPanel(genre) {
  if (!musicPanel) return;

  musicPanelTitle.textContent = `${genre.name} Stage`;
  musicPanelDescription.textContent = genre.description;
  musicList.innerHTML = "";

  genre.songs.forEach((song, index) => {
    const card = document.createElement("div");
    card.className = "musicCard";

    card.innerHTML = `
      <h3>${song.title}</h3>
      <p>${song.note}</p>
    `;

    card.addEventListener("mouseenter", () => {
      musicVideoFrame.src = song.video;
    });

    card.addEventListener("click", () => {
      window.open(song.video, "_blank");
    });

    musicList.appendChild(card);

    if (index === 0) {
      musicVideoFrame.src = song.video;
    }
  });

  musicPanel.classList.remove("hidden");
}

function closeMusicPanelFunction() {
  if (!musicPanel) return;

  musicPanel.classList.add("hidden");

  if (musicVideoFrame) {
    musicVideoFrame.src = "";
  }
}

// ===============================
// 25. GAME PANEL
// ===============================

function openGamePanel(genre) {
  if (!gamePanel) return;

  gamePanelTitle.textContent = `${genre.name} Station`;
  gamePanelDescription.textContent = genre.description;
  gameList.innerHTML = "";

  genre.games.forEach((game, index) => {
    const card = document.createElement("div");
    card.className = "gameCard";

    card.innerHTML = `
      <h3>${game.title}</h3>
      <p>${game.note}</p>
    `;

    card.addEventListener("mouseenter", () => {
      gameTrailerFrame.src = game.trailer;
    });

    card.addEventListener("click", () => {
      window.open(game.trailer, "_blank");
    });

    gameList.appendChild(card);

    if (index === 0) {
      gameTrailerFrame.src = game.trailer;
    }
  });

  gamePanel.classList.remove("hidden");
}

function closeGamePanelFunction() {
  if (!gamePanel) return;

  gamePanel.classList.add("hidden");

  if (gameTrailerFrame) {
    gameTrailerFrame.src = "";
  }
}

// ===============================
// 26. ANIME PANEL
// ===============================

function openAnimePanel(genre) {
  if (!animePanel) return;

  animePanelTitle.textContent = genre.name;
  animePanelDescription.textContent = genre.description;
  animeList.innerHTML = "";

  genre.anime.forEach((anime, index) => {
    const card = document.createElement("div");
    card.className = "animeCard";

    card.innerHTML = `
      <h3>${anime.title}</h3>
      <p>${anime.note}</p>
    `;

    card.addEventListener("mouseenter", () => {
      animeTrailerFrame.src = anime.trailer;
    });

    card.addEventListener("click", () => {
      window.open(anime.trailer, "_blank");
    });

    animeList.appendChild(card);

    if (index === 0) {
      animeTrailerFrame.src = anime.trailer;
    }
  });

  animePanel.classList.remove("hidden");
}

function closeAnimePanelFunction() {
  if (!animePanel) return;

  animePanel.classList.add("hidden");

  if (animeTrailerFrame) {
    animeTrailerFrame.src = "";
  }
}

// ===============================
// 27. HIGHLIGHT ACTIVE STATIONS
// ===============================

function updateStationHighlights() {
  updateHighlightForGroup(movieStations, 0.45, 1.1);
  updateHighlightForGroup(tvTheaters, 0.55, 1.2);
  updateHighlightForGroup(musicStations, 0.5, 1.2);
  updateHighlightForGroup(gameStations, 0.45, 1.2);
  updateHighlightForGroup(animeStations, 0.5, 1.2);
}

function updateHighlightForGroup(stations, normalGlow, activeGlow) {
  stations.forEach((station) => {
    station.group.children.forEach((child) => {
      if (child.material && child.material.emissive) {
        child.material.emissiveIntensity =
          currentStation === station ? activeGlow : normalGlow;
      }
    });
  });
}

// ===============================
// 28. ANIMATION LOOP
// ===============================

function animate() {
  requestAnimationFrame(animate);

  updateCarMovement();
  updateCamera();
  checkStationDistance();
  updateStationHighlights();

  renderer.render(scene, camera);
}

animate();

// ===============================
// 29. RESPONSIVE CANVAS
// ===============================

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});