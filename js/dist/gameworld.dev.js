"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createGameWorld = createGameWorld;
exports.updateGameMonitorVideo = updateGameMonitorVideo;
exports.clearGameMonitorVideo = clearGameMonitorVideo;
exports.gameWorldData = void 0;

var THREE = _interopRequireWildcard(require("three"));

var _GLTFLoader = require("three/addons/loaders/GLTFLoader.js");

var _CSS3DRenderer = require("three/addons/renderers/CSS3DRenderer.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// ===============================
// ACTIVE GAME MONITOR VIDEO
// ===============================
// These variables remember the CSS scene and the game world position.
// They allow the monitor video to be created only when the car is near a station.
var savedCssScene = null;
var savedWorldPosition = null; // This object remembers where each game station is.

var savedScreenStations = {}; // These remember the video that is currently active.

var activeScreenGroup = null;
var activeScreenGenreName = null; // ===============================
// GAME WORLD DATA
// ===============================

var gameWorldData = [{
  name: "PlayStation",
  color: "#3b82f6",
  angle: 0,
  description: "Console games known for cinematic single-player stories, exclusives, and action adventures.",
  screenTrailer: "https://www.youtube.com/embed/EE-4GvjKcfs",
  games: [{
    title: "God of War Ragnarök",
    note: "Cinematic action-adventure with mythology.",
    trailer: "https://www.youtube.com/embed/EE-4GvjKcfs"
  }, {
    title: "Spider-Man 2",
    note: "Superhero action game with fast movement.",
    trailer: "https://www.youtube.com/embed/qIQ3xNqkVC4"
  }]
}, {
  name: "Xbox",
  color: "#22c55e",
  angle: Math.PI / 3,
  description: "Console gaming focused on action, racing, shooters, and Game Pass-style discovery.",
  screenTrailer: "https://www.youtube.com/embed/FYH9n37B7Yw",
  games: [{
    title: "Forza Horizon 5",
    note: "Open-world racing with cars and festivals.",
    trailer: "https://www.youtube.com/embed/FYH9n37B7Yw"
  }, {
    title: "Halo Infinite",
    note: "Sci-fi shooter with classic Xbox identity.",
    trailer: "https://www.youtube.com/embed/PyMlV5_HRWk"
  }]
}, {
  name: "PC / Steam",
  color: "#60a5fa",
  angle: Math.PI / 3 * 2,
  description: "PC gaming with Steam, mods, indie games, high performance, and many genres.",
  screenTrailer: "https://www.youtube.com/embed/1T22wNvoNiU",
  games: [{
    title: "Baldur's Gate 3",
    note: "Fantasy RPG with deep choices.",
    trailer: "https://www.youtube.com/embed/1T22wNvoNiU"
  }, {
    title: "Counter-Strike 2",
    note: "Competitive PC shooter.",
    trailer: "https://www.youtube.com/embed/c80dVYcL69E"
  }]
}, {
  name: "Racing",
  color: "#facc15",
  angle: Math.PI,
  description: "Fast car games focused on driving, speed, tracks, and open-world racing.",
  screenTrailer: "https://www.youtube.com/embed/1tBUsXIkG1A",
  games: [{
    title: "Gran Turismo 7",
    note: "Realistic racing for car fans.",
    trailer: "https://www.youtube.com/embed/1tBUsXIkG1A"
  }, {
    title: "Need for Speed Unbound",
    note: "Arcade street racing with style.",
    trailer: "https://www.youtube.com/embed/H2Y8XCe7F9E"
  }]
}, {
  name: "Horror Games",
  color: "#c084fc",
  angle: Math.PI / 3 * 4,
  description: "Scary games focused on tension, survival, darkness, and atmosphere.",
  screenTrailer: "https://www.youtube.com/embed/E69tKrfEQag",
  games: [{
    title: "Resident Evil 4 Remake",
    note: "Action horror with survival gameplay.",
    trailer: "https://www.youtube.com/embed/E69tKrfEQag"
  }, {
    title: "Alan Wake 2",
    note: "Psychological horror with cinematic style.",
    trailer: "https://www.youtube.com/embed/dlQ3FeNu5Yw"
  }]
}, {
  name: "Cozy / Indie",
  color: "#80ed99",
  angle: Math.PI / 3 * 5,
  description: "Smaller, creative games with relaxing, emotional, or unique gameplay ideas.",
  screenTrailer: "https://www.youtube.com/embed/ot7uXNQskhs",
  games: [{
    title: "Stardew Valley",
    note: "Relaxing farming and life sim.",
    trailer: "https://www.youtube.com/embed/ot7uXNQskhs"
  }, {
    title: "Hades",
    note: "Indie action game with mythology.",
    trailer: "https://www.youtube.com/embed/mD8x5xLHRho"
  }]
}]; // ===============================
// CREATE GAME WORLD
// ===============================

exports.gameWorldData = gameWorldData;

function createGameWorld(scene, cssScene, createFloatingText, position) {
  // Save these so the monitor video can be created later.
  savedCssScene = cssScene;
  savedWorldPosition = position;
  var gameWorldGroup = new THREE.Group();
  gameWorldGroup.position.set(position.x, 0, position.z);
  var ground = new THREE.Mesh(new THREE.CircleGeometry(position.radius, 80), new THREE.MeshStandardMaterial({
    color: "#07140e",
    roughness: 0.8
  }));
  ground.rotation.x = -Math.PI / 2;
  gameWorldGroup.add(ground);
  var road = new THREE.Mesh(new THREE.RingGeometry(16, 21, 100), new THREE.MeshStandardMaterial({
    color: "#06100a",
    roughness: 0.7
  }));
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.03;
  gameWorldGroup.add(road);
  var sign = createFloatingText("GAME WORLD", "#80ed99");
  sign.position.set(-8, 9, 0);
  gameWorldGroup.add(sign);
  var gameStations = [];
  gameWorldData.forEach(function (genre) {
    var radius = 31;
    var x = Math.cos(genre.angle) * radius;
    var z = Math.sin(genre.angle) * radius;
    var station = createGameStation(genre, x, z, createFloatingText);
    gameStations.push({
      group: station.group,
      genre: genre,
      trigger: new THREE.Vector3(x + position.x, 0, z + position.z)
    });
    gameWorldGroup.add(station.group); // Save the station position.
    // The video is NOT created here anymore.
    // This keeps the project much faster.

    savedScreenStations[genre.name] = {
      x: x,
      z: z,
      genre: genre
    };
  });
  addGameDecorations(gameWorldGroup);
  scene.add(gameWorldGroup);
  return {
    gameWorldGroup: gameWorldGroup,
    gameStations: gameStations
  };
} // ===============================
// CREATE GAME STATION
// ===============================


function createGameStation(genre, x, z, createFloatingText) {
  var group = new THREE.Group();
  group.position.set(x, 0, z); // Make the station face the center of Game World.

  group.lookAt(0, 0, 0); // Main platform

  var base = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 6), new THREE.MeshStandardMaterial({
    color: "#101010",
    roughness: 0.7
  }));
  base.position.y = 0.25;
  group.add(base); // Glowing platform detail

  var glowBase = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.08, 5.4), new THREE.MeshStandardMaterial({
    color: genre.color,
    emissive: genre.color,
    emissiveIntensity: 0.7
  }));
  glowBase.position.y = 0.55;
  group.add(glowBase); // 3D monitor model

  addMonitorModel(group, genre); // Small console box

  var consoleBox = new THREE.Mesh(new THREE.BoxGeometry(2, 0.45, 1.2), new THREE.MeshStandardMaterial({
    color: "#111111",
    roughness: 0.6
  }));
  consoleBox.position.set(2.7, 0.9, 1.1);
  group.add(consoleBox); // Game controller

  var controller = createControllerShape(genre.color);
  controller.position.set(0, 0.85, 1.1);
  group.add(controller); // Floating genre name

  var sign = createFloatingText(genre.name, genre.color);
  sign.position.set(-3.2, 5.9, -2.1);
  group.add(sign);
  return {
    group: group
  };
} // ===============================
// ADD 3D MONITOR MODEL
// ===============================


function addMonitorModel(group, genre) {
  var loader = new _GLTFLoader.GLTFLoader();
  var monitorHolder = new THREE.Group(); // ===============================
  // EASY MONITOR MODEL SETTINGS
  // ===============================
  // x = left/right
  // y = up/down
  // z = forward/back

  monitorHolder.position.set(0, 0.7, -1.7); // Adjust this value if the monitor orientation is incorrect.

  monitorHolder.rotation.y = 0;
  group.add(monitorHolder);
  loader.load("models/ultrawide_monitor.glb", function (gltf) {
    var monitor = gltf.scene;
    centerModel(monitor); // Adjust this scale if the monitor size is incorrect.

    monitor.scale.set(1.0, 1.0, 1.0);
    monitor.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    monitorHolder.add(monitor);
    console.log("".concat(genre.name, " monitor loaded."));
  }, function () {
    console.log("".concat(genre.name, " monitor is loading..."));
  }, function (error) {
    console.log("".concat(genre.name, " monitor could not load. Backup monitor added."), error);
    var backupMonitor = createBackupMonitor(genre.color);
    monitorHolder.add(backupMonitor);
  });
} // ===============================
// BACKUP MONITOR
// ===============================


function createBackupMonitor(color) {
  var backup = new THREE.Group();
  var frame = new THREE.Mesh(new THREE.BoxGeometry(6.8, 3.4, 0.35), new THREE.MeshStandardMaterial({
    color: "#050505",
    roughness: 0.5
  }));
  frame.position.set(0, 2.5, 0);
  backup.add(frame);
  var stand = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.5, 0.35), new THREE.MeshStandardMaterial({
    color: "#050505",
    roughness: 0.5
  }));
  stand.position.set(0, 1, 0);
  backup.add(stand);
  var foot = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 1.2), new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.4
  }));
  foot.position.set(0, 0.2, 0.1);
  backup.add(foot);
  return backup;
} // ===============================
// UPDATE ACTIVE MONITOR VIDEO
// ===============================


function updateGameMonitorVideo(genre) {
  if (!savedCssScene || !savedWorldPosition) return;
  if (!genre) return; // If the correct video is already playing, do nothing.

  if (activeScreenGenreName === genre.name) return; // Remove the old video first.

  clearGameMonitorVideo();
  var stationData = savedScreenStations[genre.name];
  if (!stationData) return;
  activeScreenGroup = createMonitorIframeScreen(genre, stationData.x, stationData.z, savedWorldPosition);
  savedCssScene.add(activeScreenGroup);
  activeScreenGenreName = genre.name;
} // ===============================
// CLEAR ACTIVE MONITOR VIDEO
// ===============================


function clearGameMonitorVideo() {
  if (!activeScreenGroup || !savedCssScene) return;
  activeScreenGroup.traverse(function (child) {
    if (child.element && child.element.tagName === "IFRAME") {
      child.element.src = "";
      child.element.remove();
    }
  });
  savedCssScene.remove(activeScreenGroup);
  activeScreenGroup = null;
  activeScreenGenreName = null;
} // ===============================
// CREATE YOUTUBE IFRAME SCREEN
// ===============================


function createMonitorIframeScreen(genre, x, z, worldPosition) {
  var iframe = document.createElement("iframe");
  iframe.src = makeYoutubeScreenUrl(genre.screenTrailer);
  iframe.width = "640";
  iframe.height = "300";
  iframe.allow = "autoplay; encrypted-media; picture-in-picture";
  iframe.className = "gameMonitorIframe";
  iframe.style.border = "0";
  iframe.style.borderRadius = "14px";
  iframe.style.background = "black";
  iframe.style.pointerEvents = "none";
  var screenObject = new _CSS3DRenderer.CSS3DObject(iframe); // ===============================
  // EASY VIDEO SCREEN SETTINGS
  // ===============================
  // Change this to make the video wider/narrower.

  var screenWidth = 10; // Change this to make the video taller/shorter.

  var screenHeight = 4.7; // Change these to move the video on the monitor.
  // x = left/right
  // y = up/down
  // z = forward/back

  var screenX = -0.10;
  var screenY = 4.42;
  var screenZ = -0.75; // This scales the HTML iframe into the 3D world size.

  screenObject.scale.set(screenWidth / 640, screenHeight / 300, 1);
  var cssStationGroup = new THREE.Group();
  cssStationGroup.position.set(worldPosition.x + x, 0, worldPosition.z + z); // Make the video face the center of Game World.

  cssStationGroup.lookAt(worldPosition.x, 0, worldPosition.z);
  screenObject.position.set(screenX, screenY, screenZ); // Change this to Math.PI if the video appears backwards.

  screenObject.rotation.y = 0;
  cssStationGroup.add(screenObject);
  return cssStationGroup;
} // ===============================
// MAKE YOUTUBE AUTOPLAY URL
// ===============================


function makeYoutubeScreenUrl(url) {
  return "".concat(url, "?autoplay=1&mute=0&controls=0&rel=0&modestbranding=1&playsinline=1");
} // ===============================
// CENTER MODEL HELPER
// ===============================


function centerModel(model) {
  var box = new THREE.Box3().setFromObject(model);
  var center = new THREE.Vector3();
  box.getCenter(center);
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= box.min.y;
} // ===============================
// CONTROLLER SHAPE
// ===============================


function createControllerShape(color) {
  var controller = new THREE.Group();
  var middle = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.25, 0.65), new THREE.MeshStandardMaterial({
    color: "#050505"
  }));
  controller.add(middle);
  var leftGrip = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), new THREE.MeshStandardMaterial({
    color: "#050505"
  }));
  leftGrip.scale.set(1, 0.55, 0.8);
  leftGrip.position.set(-0.8, 0, 0);
  controller.add(leftGrip);
  var rightGrip = leftGrip.clone();
  rightGrip.position.x = 0.8;
  controller.add(rightGrip);
  var button = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.8
  }));
  button.position.set(0.45, 0.18, -0.15);
  controller.add(button);
  return controller;
} // ===============================
// GAME DECORATIONS
// ===============================


function addGameDecorations(group) {
  for (var i = 0; i < 14; i++) {
    var angle = Math.random() * Math.PI * 2;
    var radius = 38 + Math.random() * 10;
    var cube = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshStandardMaterial({
      color: "#80ed99",
      emissive: "#80ed99",
      emissiveIntensity: 0.25
    }));
    cube.position.set(Math.cos(angle) * radius, 0.75, Math.sin(angle) * radius);
    cube.rotation.y = Math.random() * Math.PI * 2;
    group.add(cube);
  }
}
//# sourceMappingURL=gameworld.dev.js.map
