"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var THREE = _interopRequireWildcard(require("three"));

var _GLTFLoader = require("three/addons/loaders/GLTFLoader.js");

var _hubworld = require("./hubworld.js");

var _movieworld = require("./movieworld.js");

var _tvworld = require("./tvworld.js");

var _musicworld = require("./musicworld.js");

var _gameworld = require("./gameworld.js");

var _animeworld = require("./animeworld.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Each world has its own file now.
// This keeps the main three.js file cleaner.
// ===============================
// 1. BASIC SCENE SETUP
// ===============================
// This connects Three.js to the canvas in index.html.
var canvas = document.querySelector("#world"); // The scene is the full 3D world.

var scene = new THREE.Scene();
scene.background = new THREE.Color("#080812"); // This is the camera the player looks through.

var camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000); // This draws the 3D world on the canvas.

var renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // ===============================
// 2. HTML ELEMENTS
// ===============================
// Start screen

var startScreen = document.querySelector("#startScreen");
var startBtn = document.querySelector("#startBtn"); // Movie panel

var moviePanel = document.querySelector("#moviePanel");
var closePanel = document.querySelector("#closePanel");
var panelTitle = document.querySelector("#panelTitle");
var panelDescription = document.querySelector("#panelDescription");
var movieList = document.querySelector("#movieList");
var trailerFrame = document.querySelector("#trailerFrame"); // TV panel

var tvPanel = document.querySelector("#tvPanel");
var closeTvPanel = document.querySelector("#closeTvPanel");
var tvPanelTitle = document.querySelector("#tvPanelTitle");
var tvPanelDescription = document.querySelector("#tvPanelDescription");
var tvList = document.querySelector("#tvList");
var tvTrailerFrame = document.querySelector("#tvTrailerFrame"); // Music panel

var musicPanel = document.querySelector("#musicPanel");
var closeMusicPanel = document.querySelector("#closeMusicPanel");
var musicPanelTitle = document.querySelector("#musicPanelTitle");
var musicPanelDescription = document.querySelector("#musicPanelDescription");
var musicList = document.querySelector("#musicList");
var musicVideoFrame = document.querySelector("#musicVideoFrame"); // Game panel

var gamePanel = document.querySelector("#gamePanel");
var closeGamePanel = document.querySelector("#closeGamePanel");
var gamePanelTitle = document.querySelector("#gamePanelTitle");
var gamePanelDescription = document.querySelector("#gamePanelDescription");
var gameList = document.querySelector("#gameList");
var gameTrailerFrame = document.querySelector("#gameTrailerFrame"); // Anime panel

var animePanel = document.querySelector("#animePanel");
var closeAnimePanel = document.querySelector("#closeAnimePanel");
var animePanelTitle = document.querySelector("#animePanelTitle");
var animePanelDescription = document.querySelector("#animePanelDescription");
var animeList = document.querySelector("#animeList");
var animeTrailerFrame = document.querySelector("#animeTrailerFrame"); // HUD text

var currentGenreText = document.querySelector("#currentGenre"); // ===============================
// 3. GAME VARIABLES
// ===============================

var keys = {};
var speed = 0;
var rotationSpeed = 0;
var currentStation = null;
var gameStarted = false;
var selectedCarColor = "#d62828";
var carBodyMaterial;
var carColorButtons = document.querySelectorAll(".carColor"); // ===============================
// 4. WORLD POSITIONS
// ===============================
// These are the positions of all worlds.
// x = left/right position
// z = forward/backward position
// radius = playable circle size

var WORLD_POSITIONS = {
  hub: {
    x: 0,
    z: 0,
    radius: 58
  },
  movie: {
    x: 0,
    z: -180,
    radius: 55
  },
  tv: {
    x: 145,
    z: -105,
    radius: 55
  },
  game: {
    x: 145,
    z: 105,
    radius: 55
  },
  music: {
    x: -145,
    z: 105,
    radius: 55
  },
  anime: {
    x: -145,
    z: -105,
    radius: 55
  }
}; // These are the bridges the car is allowed to drive on.
// The same list is used for bridge collision, so the car does not hit invisible walls.

var BRIDGE_CONNECTIONS = [["hub", "movie"], ["hub", "tv"], ["hub", "game"], ["hub", "music"], ["hub", "anime"], ["movie", "tv"], ["tv", "game"], ["game", "music"], ["music", "anime"], ["anime", "movie"]]; // ===============================
// 5. CAR COLOR SELECTION
// ===============================

carColorButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    selectedCarColor = button.dataset.color;
    carColorButtons.forEach(function (btn) {
      btn.classList.remove("selected");
    });
    button.classList.add("selected"); // If the car already exists, change its color live.

    if (carBodyMaterial) {
      carBodyMaterial.color.set(selectedCarColor);
    }
  });
}); // ===============================
// 6. BUTTONS AND KEYBOARD
// ===============================

if (startBtn) {
  startBtn.addEventListener("click", function () {
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
} // Save which keys are being pressed.


window.addEventListener("keydown", function (event) {
  keys[event.key.toLowerCase()] = true;
});
window.addEventListener("keyup", function (event) {
  keys[event.key.toLowerCase()] = false;
}); // ===============================
// 7. LIGHTING
// ===============================

var ambientLight = new THREE.AmbientLight("#ffffff", 0.58);
scene.add(ambientLight);
var moonLight = new THREE.DirectionalLight("#ffffff", 1.4);
moonLight.position.set(20, 35, 15);
scene.add(moonLight); // ===============================
// 8. CREATE WORLDS
// ===============================
// Central hub

var hubWorld = (0, _hubworld.createHubWorld)(scene, createFloatingText, WORLD_POSITIONS.hub); // Movie World

var movieWorld = (0, _movieworld.createMovieWorld)(scene, createFloatingText, WORLD_POSITIONS.movie);
var movieStations = movieWorld.movieStations; // TV World

var tvWorld = (0, _tvworld.createTVWorld)(scene, createFloatingText, WORLD_POSITIONS.tv);
var tvTheaters = tvWorld.tvTheaters; // Music World

var musicWorld = (0, _musicworld.createMusicWorld)(scene, createFloatingText, WORLD_POSITIONS.music);
var musicStations = musicWorld.musicStations; // Game World

var gameWorld = (0, _gameworld.createGameWorld)(scene, createFloatingText, WORLD_POSITIONS.game);
var gameStations = gameWorld.gameStations; // Anime World

var animeWorld = (0, _animeworld.createAnimeWorld)(scene, createFloatingText, WORLD_POSITIONS.anime);
var animeStations = animeWorld.animeStations; // ===============================
// 9. CREATE BRIDGES
// ===============================
// Main bridges from the central hub.

createBridgeBetween(WORLD_POSITIONS.hub, WORLD_POSITIONS.movie, "#ffcc66", "MOVIE WORLD");
createBridgeBetween(WORLD_POSITIONS.hub, WORLD_POSITIONS.tv, "#7cc7ff", "TV WORLD");
createBridgeBetween(WORLD_POSITIONS.hub, WORLD_POSITIONS.game, "#80ed99", "GAME WORLD");
createBridgeBetween(WORLD_POSITIONS.hub, WORLD_POSITIONS.music, "#ff8ee8", "MUSIC WORLD");
createBridgeBetween(WORLD_POSITIONS.hub, WORLD_POSITIONS.anime, "#ff6b6b", "ANIME WORLD"); // Extra bridges between the outside worlds.

createBridgeBetween(WORLD_POSITIONS.movie, WORLD_POSITIONS.tv, "#7cc7ff", "TV");
createBridgeBetween(WORLD_POSITIONS.tv, WORLD_POSITIONS.game, "#80ed99", "GAME");
createBridgeBetween(WORLD_POSITIONS.game, WORLD_POSITIONS.music, "#ff8ee8", "MUSIC");
createBridgeBetween(WORLD_POSITIONS.music, WORLD_POSITIONS.anime, "#ff6b6b", "ANIME");
createBridgeBetween(WORLD_POSITIONS.anime, WORLD_POSITIONS.movie, "#ffcc66", "MOVIES"); // ===============================
// 10. ENVIRONMENT
// ===============================

addTrees();
addStars(); // ===============================
// 11. PLAYER CAR
// ===============================

var car = createCar();
scene.add(car); // Start the player in the central hub.

car.position.set(0, 0.45, 18);
car.rotation.y = Math.PI; // Camera starting position

camera.position.set(0, 16, 34);
camera.lookAt(car.position); // ===============================
// 12. BRIDGE SYSTEM
// ===============================

function createBridgeBetween(startWorld, endWorld, color, label) {
  var start = new THREE.Vector3(startWorld.x, 0, startWorld.z);
  var end = new THREE.Vector3(endWorld.x, 0, endWorld.z);
  var direction = new THREE.Vector3().subVectors(end, start).normalize(); // This makes the bridge start at the edge of one world
  // and end at the edge of the next world.

  var bridgeStart = start.clone().add(direction.clone().multiplyScalar(startWorld.radius - 2));
  var bridgeEnd = end.clone().add(direction.clone().multiplyScalar(-(endWorld.radius - 2)));
  var center = new THREE.Vector3().addVectors(bridgeStart, bridgeEnd).multiplyScalar(0.5);
  var length = bridgeStart.distanceTo(bridgeEnd); // Rotate the bridge so it points toward the next world.

  var angle = Math.atan2(direction.x, direction.z);
  var bridgeGroup = new THREE.Group();
  bridgeGroup.position.set(center.x, 0, center.z);
  bridgeGroup.rotation.y = angle;
  var floor = new THREE.Mesh(new THREE.BoxGeometry(12, 0.35, length), new THREE.MeshStandardMaterial({
    color: "#1a1a1a",
    roughness: 0.65
  }));
  floor.position.y = -0.1;
  bridgeGroup.add(floor);
  var centerLine = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, length - 5), new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.9
  }));
  centerLine.position.y = 0.1;
  bridgeGroup.add(centerLine);
  var leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1, length), new THREE.MeshStandardMaterial({
    color: "#333333"
  }));
  leftRail.position.set(-6, 0.45, 0);
  bridgeGroup.add(leftRail);
  var rightRail = leftRail.clone();
  rightRail.position.x = 6;
  bridgeGroup.add(rightRail);
  var bridgeText = createFloatingText(label, color);
  bridgeText.position.set(-5, 4.8, 0);
  bridgeGroup.add(bridgeText);
  scene.add(bridgeGroup);
} // ===============================
// 13. CREATE CAR
// ===============================


function createCar() {
  var group = new THREE.Group();
  carBodyMaterial = new THREE.MeshStandardMaterial({
    color: selectedCarColor,
    roughness: 0.5
  });
  var body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 4), carBodyMaterial);
  body.position.y = 0.55;
  group.add(body);
  var top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.65, 1.8), new THREE.MeshStandardMaterial({
    color: "#f77f00",
    roughness: 0.45
  }));
  top.position.set(0, 1.15, -0.35);
  group.add(top);
  var wheelMaterial = new THREE.MeshStandardMaterial({
    color: "#050505"
  });
  var wheelPositions = [[-1.25, 0.35, 1.35], [1.25, 0.35, 1.35], [-1.25, 0.35, -1.35], [1.25, 0.35, -1.35]];
  wheelPositions.forEach(function (pos) {
    var wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.28, 20), wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(pos[0], pos[1], pos[2]);
    group.add(wheel);
  });
  var lightMaterial = new THREE.MeshStandardMaterial({
    color: "#fff3b0",
    emissive: "#fff3b0",
    emissiveIntensity: 1.4
  });
  var leftLight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.08), lightMaterial);
  leftLight.position.set(-0.55, 0.75, 2.05);
  group.add(leftLight);
  var rightLight = leftLight.clone();
  rightLight.position.x = 0.55;
  group.add(rightLight);
  return group;
} // ===============================
// 14. FLOATING TEXT
// ===============================


function createFloatingText(text, color) {
  var textCanvas = document.createElement("canvas");
  textCanvas.width = 1024;
  textCanvas.height = 256;
  var ctx = textCanvas.getContext("2d");
  ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);
  ctx.fillStyle = color;
  ctx.font = "bold 90px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.shadowColor = color;
  ctx.shadowBlur = 25;
  ctx.fillText(text, 30, 130);
  var texture = new THREE.CanvasTexture(textCanvas);
  var material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true
  });
  var sprite = new THREE.Sprite(material);
  sprite.scale.set(7, 1.8, 1);
  return sprite;
} // ===============================
// 15. TREES
// ===============================


function addTrees() {
  var loader = new _GLTFLoader.GLTFLoader(); // Your tree model should be inside:
  // models/pine_tree.glb

  var treeModelPath = "models/";
  loader.load(treeModelPath, function (gltf) {
    var originalTree = gltf.scene;

    for (var i = 0; i < 80; i++) {
      var worldKeys = Object.keys(WORLD_POSITIONS);
      var randomWorld = WORLD_POSITIONS[worldKeys[Math.floor(Math.random() * worldKeys.length)]];
      var angle = Math.random() * Math.PI * 2;
      var radius = randomWorld.radius + 8 + Math.random() * 16;
      var tree = originalTree.clone(true);
      tree.position.set(randomWorld.x + Math.cos(angle) * radius, 0, randomWorld.z + Math.sin(angle) * radius);
      tree.scale.set(1.5, 1.5, 1.5);
      tree.rotation.y = Math.random() * Math.PI * 2;
      scene.add(tree);
    }

    console.log("Tree model loaded.");
  }, function () {
    console.log("Tree model is loading...");
  }, function () {
    console.log("Tree model could not load. Backup trees added.");
    addSimpleTrees();
  });
}

function addSimpleTrees() {
  for (var i = 0; i < 80; i++) {
    var worldKeys = Object.keys(WORLD_POSITIONS);
    var randomWorld = WORLD_POSITIONS[worldKeys[Math.floor(Math.random() * worldKeys.length)]];
    var angle = Math.random() * Math.PI * 2;
    var radius = randomWorld.radius + 8 + Math.random() * 16;
    var tree = new THREE.Group();
    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.2, 8), new THREE.MeshStandardMaterial({
      color: "#5c3d2e"
    }));
    trunk.position.y = 0.6;
    tree.add(trunk);
    var leaves = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.8, 10), new THREE.MeshStandardMaterial({
      color: "#1b7f3a"
    }));
    leaves.position.y = 1.8;
    tree.add(leaves);
    tree.position.set(randomWorld.x + Math.cos(angle) * radius, 0, randomWorld.z + Math.sin(angle) * radius);
    scene.add(tree);
  }
} // ===============================
// 16. STARS
// ===============================


function addStars() {
  var starGeometry = new THREE.BufferGeometry();
  var starCount = 900;
  var positions = [];

  for (var i = 0; i < starCount; i++) {
    positions.push((Math.random() - 0.5) * 520, Math.random() * 150 + 20, (Math.random() - 0.5) * 520);
  }

  starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  var stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({
    color: "#ffffff",
    size: 0.25
  }));
  scene.add(stars);
} // ===============================
// 17. CAR MOVEMENT
// ===============================


function updateCarMovement() {
  if (!gameStarted) return;
  var forwardPressed = keys["w"] || keys["arrowup"];
  var backwardPressed = keys["s"] || keys["arrowdown"];
  var leftPressed = keys["a"] || keys["arrowleft"];
  var rightPressed = keys["d"] || keys["arrowright"];

  if (forwardPressed) {
    speed += 0.015;
  } else if (backwardPressed) {
    speed -= 0.012;
  } else {
    speed *= 0.94;
  }

  speed = THREE.MathUtils.clamp(speed, -0.18, 0.32);

  if (leftPressed) {
    rotationSpeed = 0.04;
  } else if (rightPressed) {
    rotationSpeed = -0.04;
  } else {
    rotationSpeed = 0;
  }

  if (Math.abs(speed) > 0.01) {
    car.rotation.y += rotationSpeed * Math.sign(speed);
  } // Save old position first.
  // If the car moves outside the world or bridge,
  // it will be placed back here.


  var previousX = car.position.x;
  var previousZ = car.position.z;
  car.position.x += Math.sin(car.rotation.y) * speed;
  car.position.z += Math.cos(car.rotation.y) * speed;

  if (!isCarInPlayableArea()) {
    car.position.x = previousX;
    car.position.z = previousZ;
    speed *= -0.25;
  }
} // ===============================
// 18. PLAYABLE AREA CHECK
// ===============================


function isCarInPlayableArea() {
  var point = new THREE.Vector2(car.position.x, car.position.z); // Check if the car is inside one of the worlds.

  var worldKeys = Object.keys(WORLD_POSITIONS);

  for (var _i = 0, _worldKeys = worldKeys; _i < _worldKeys.length; _i++) {
    var key = _worldKeys[_i];
    var world = WORLD_POSITIONS[key];

    if (isInsideCircle(point.x, point.y, world.x, world.z, world.radius)) {
      return true;
    }
  } // Check if the car is on one of the bridges.


  for (var _i2 = 0, _BRIDGE_CONNECTIONS = BRIDGE_CONNECTIONS; _i2 < _BRIDGE_CONNECTIONS.length; _i2++) {
    var connection = _BRIDGE_CONNECTIONS[_i2];
    var start = WORLD_POSITIONS[connection[0]];
    var end = WORLD_POSITIONS[connection[1]];

    if (isPointOnBridge(point, start, end)) {
      return true;
    }
  }

  return false;
}

function isInsideCircle(x, z, centerX, centerZ, radius) {
  var dx = x - centerX;
  var dz = z - centerZ;
  return Math.sqrt(dx * dx + dz * dz) <= radius;
}

function isPointOnBridge(point, startWorld, endWorld) {
  var start = new THREE.Vector2(startWorld.x, startWorld.z);
  var end = new THREE.Vector2(endWorld.x, endWorld.z);
  var direction = new THREE.Vector2().subVectors(end, start).normalize();
  var bridgeStart = start.clone().add(direction.clone().multiplyScalar(startWorld.radius - 2));
  var bridgeEnd = end.clone().add(direction.clone().multiplyScalar(-(endWorld.radius - 2)));
  var bridgeVector = new THREE.Vector2().subVectors(bridgeEnd, bridgeStart);
  var pointVector = new THREE.Vector2().subVectors(point, bridgeStart);
  var bridgeLength = bridgeVector.length();
  var bridgeDirection = bridgeVector.clone().normalize();
  var distanceAlongBridge = pointVector.dot(bridgeDirection); // If the car is before the bridge start or after bridge end, it is not on the bridge.

  if (distanceAlongBridge < 0 || distanceAlongBridge > bridgeLength) {
    return false;
  }

  var closestPoint = bridgeStart.clone().add(bridgeDirection.clone().multiplyScalar(distanceAlongBridge));
  var sideDistance = point.distanceTo(closestPoint); // This number is the bridge width for collision.
  // Higher number = easier to drive on bridge.

  return sideDistance <= 7;
} // ===============================
// 19. CAMERA FOLLOW
// ===============================


function updateCamera() {
  var cameraOffset = new THREE.Vector3(-Math.sin(car.rotation.y) * 9, 6, -Math.cos(car.rotation.y) * 9);
  var targetCameraPosition = car.position.clone().add(cameraOffset);
  camera.position.lerp(targetCameraPosition, 0.08);
  var lookTarget = car.position.clone();
  lookTarget.y += 1.2;
  camera.lookAt(lookTarget);
} // ===============================
// 20. STATION INTERACTION
// ===============================


function checkStationDistance() {
  var nearestMovie = getNearestStation(movieStations);
  var nearestTV = getNearestStation(tvTheaters);
  var nearestMusic = getNearestStation(musicStations);
  var nearestGame = getNearestStation(gameStations);
  var nearestAnime = getNearestStation(animeStations);

  if (nearestMovie.station && nearestMovie.distance < 8) {
    currentGenreText.textContent = "".concat(nearestMovie.station.genre.name, " Movie Theater");

    if (currentStation !== nearestMovie.station) {
      closeAllPanels();
      openMoviePanel(nearestMovie.station.genre);
      currentStation = nearestMovie.station;
    }
  } else if (nearestTV.station && nearestTV.distance < 8) {
    currentGenreText.textContent = "".concat(nearestTV.station.genre.name, " TV Station");

    if (currentStation !== nearestTV.station) {
      closeAllPanels();
      openTVPanel(nearestTV.station.genre);
      currentStation = nearestTV.station;
    }
  } else if (nearestMusic.station && nearestMusic.distance < 8) {
    currentGenreText.textContent = "".concat(nearestMusic.station.genre.name, " Music Stage");

    if (currentStation !== nearestMusic.station) {
      closeAllPanels();
      openMusicPanel(nearestMusic.station.genre);
      currentStation = nearestMusic.station;
    }
  } else if (nearestGame.station && nearestGame.distance < 8) {
    currentGenreText.textContent = "".concat(nearestGame.station.genre.name, " Game Station");

    if (currentStation !== nearestGame.station) {
      closeAllPanels();
      openGamePanel(nearestGame.station.genre);
      currentStation = nearestGame.station;
    }
  } else if (nearestAnime.station && nearestAnime.distance < 8) {
    currentGenreText.textContent = "".concat(nearestAnime.station.genre.name, " Anime Station");

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
  var nearestStation = null;
  var nearestDistance = Infinity;
  stations.forEach(function (station) {
    var distance = car.position.distanceTo(station.trigger);

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
  var x = car.position.x;
  var z = car.position.z;

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
} // ===============================
// 21. PANEL HELPERS
// ===============================


function closeAllPanels() {
  closeMoviePanel();
  closeTVPanel();
  closeMusicPanelFunction();
  closeGamePanelFunction();
  closeAnimePanelFunction();
} // ===============================
// 22. MOVIE PANEL
// ===============================


function openMoviePanel(genre) {
  if (!moviePanel) return;
  panelTitle.textContent = "".concat(genre.name, " Drive-In");
  panelDescription.textContent = genre.description;
  movieList.innerHTML = "";
  genre.movies.forEach(function (movie, index) {
    var card = document.createElement("div");
    card.className = "movieCard";
    card.innerHTML = "\n      <h3>".concat(movie.title, "</h3>\n      <p>").concat(movie.note, "</p>\n    ");
    card.addEventListener("mouseenter", function () {
      trailerFrame.src = movie.trailer;
    });
    card.addEventListener("click", function () {
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
} // ===============================
// 23. TV PANEL
// ===============================


function openTVPanel(genre) {
  if (!tvPanel) return;
  tvPanelTitle.textContent = "".concat(genre.name, " TV Station");
  tvPanelDescription.textContent = genre.description;
  tvList.innerHTML = "";
  genre.shows.forEach(function (show, index) {
    var card = document.createElement("div");
    card.className = "tvCard";
    card.innerHTML = "\n      <h3>".concat(show.title, "</h3>\n      <p>").concat(show.note, "</p>\n    ");
    card.addEventListener("mouseenter", function () {
      tvTrailerFrame.src = show.trailer;
    });
    card.addEventListener("click", function () {
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
} // ===============================
// 24. MUSIC PANEL
// ===============================


function openMusicPanel(genre) {
  if (!musicPanel) return;
  musicPanelTitle.textContent = "".concat(genre.name, " Stage");
  musicPanelDescription.textContent = genre.description;
  musicList.innerHTML = "";
  genre.songs.forEach(function (song, index) {
    var card = document.createElement("div");
    card.className = "musicCard";
    card.innerHTML = "\n      <h3>".concat(song.title, "</h3>\n      <p>").concat(song.note, "</p>\n    ");
    card.addEventListener("mouseenter", function () {
      musicVideoFrame.src = song.video;
    });
    card.addEventListener("click", function () {
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
} // ===============================
// 25. GAME PANEL
// ===============================


function openGamePanel(genre) {
  if (!gamePanel) return;
  gamePanelTitle.textContent = "".concat(genre.name, " Station");
  gamePanelDescription.textContent = genre.description;
  gameList.innerHTML = "";
  genre.games.forEach(function (game, index) {
    var card = document.createElement("div");
    card.className = "gameCard";
    card.innerHTML = "\n      <h3>".concat(game.title, "</h3>\n      <p>").concat(game.note, "</p>\n    ");
    card.addEventListener("mouseenter", function () {
      gameTrailerFrame.src = game.trailer;
    });
    card.addEventListener("click", function () {
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
} // ===============================
// 26. ANIME PANEL
// ===============================


function openAnimePanel(genre) {
  if (!animePanel) return;
  animePanelTitle.textContent = "".concat(genre.name, " Anime Station");
  animePanelDescription.textContent = genre.description;
  animeList.innerHTML = "";
  genre.anime.forEach(function (anime, index) {
    var card = document.createElement("div");
    card.className = "animeCard";
    card.innerHTML = "\n      <h3>".concat(anime.title, "</h3>\n      <p>").concat(anime.note, "</p>\n    ");
    card.addEventListener("mouseenter", function () {
      animeTrailerFrame.src = anime.trailer;
    });
    card.addEventListener("click", function () {
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
} // ===============================
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
  stations.forEach(function (station) {
    station.group.children.forEach(function (child) {
      if (child.material && child.material.emissive) {
        child.material.emissiveIntensity = currentStation === station ? activeGlow : normalGlow;
      }
    });
  });
} // ===============================
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

animate(); // ===============================
// 29. RESPONSIVE CANVAS
// ===============================

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
//# sourceMappingURL=three.dev.js.map
