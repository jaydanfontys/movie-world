"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMovieWorld = createMovieWorld;
exports.updateMovieScreenVideo = updateMovieScreenVideo;
exports.clearMovieScreenVideo = clearMovieScreenVideo;
exports.movieWorldData = void 0;

var THREE = _interopRequireWildcard(require("three"));

var _GLTFLoader = require("three/addons/loaders/GLTFLoader.js");

var _CSS3DRenderer = require("three/addons/renderers/CSS3DRenderer.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// ===============================
// MODEL PATHS
// ===============================
var PROJECTOR_MODEL_PATH = "models/projector_set.glb";
var POPCORN_MACHINE_MODEL_PATH = "models/popcorn_machine.glb";
var MOVIE_SEAT_MODEL_PATH = "models/cinemamovie_theater_seat.glb"; // ===============================
// EASY MODEL SIZE SETTINGS
// ===============================
// Change these to make the 3D models bigger or smaller.

var PROJECTOR_MODEL_SCALE = new THREE.Vector3(0.08, 0.08, 0.08);
var POPCORN_MACHINE_MODEL_SCALE = new THREE.Vector3(3.0, 3.0, 3.0);
var MOVIE_SEAT_MODEL_SCALE = new THREE.Vector3(0.8, 0.8, 0.8); // ===============================
// EASY MODEL POSITION SETTINGS
// ===============================
// x = left / right
// y = up / dow4
// z = forward / backward

var PROJECTOR_MODEL_POSITION = new THREE.Vector3(0, -7, 5);
var POPCORN_MACHINE_MODEL_POSITION = new THREE.Vector3(0, 0, 0);
var MOVIE_SEAT_MODEL_POSITION = new THREE.Vector3(0, 0, 3.4); // Change these if the models face the wrong direction.

var PROJECTOR_MODEL_ROTATION_Y = 0;
var POPCORN_MACHINE_MODEL_ROTATION_Y = 0;
var MOVIE_SEAT_MODEL_ROTATION_Y = Math.PI; // ===============================
// YOUTUBE PROJECTOR SCREEN SETTINGS
// ===============================
// This controls the YouTube video screen on the projector screen model.
// x = left / right
// y = up / down
// z = forward / backward

var MOVIE_YOUTUBE_SCREEN_POSITION = new THREE.Vector3(-9, 2, -55.45); // Bigger / smaller YouTube screen.

var MOVIE_YOUTUBE_SCREEN_WIDTH = 26.4;
var MOVIE_YOUTUBE_SCREEN_HEIGHT = 13.5; // ===============================
// MODEL CACHE
// ===============================

var projectorModelPromise = null;
var popcornMachineModelPromise = null;
var movieSeatModelPromise = null; // ===============================
// CSS3D VIDEO SCREEN MEMORY
// ===============================

var savedCssScene = null;
var savedWorldPosition = null;
var savedMovieStations = {};
var activeMovieScreenGroup = null;
var activeMovieGenreName = null; // ===============================
// MOVIE WORLD DATA
// ===============================

var movieWorldData = [{
  name: "Action",
  color: "#ff3333",
  angle: 0,
  description: "Fast, intense movies with fights, danger, heroes, and big set pieces.",
  screenTrailer: "https://www.youtube.com/embed/hEJnMQG9ev8",
  movies: [{
    title: "Mad Max: Fury Road",
    note: "Chaotic action and amazing practical stunts.",
    trailer: "https://www.youtube.com/embed/hEJnMQG9ev8"
  }, {
    title: "John Wick",
    note: "Stylish action with clean choreography.",
    trailer: "https://www.youtube.com/embed/C0BMx-qxsP4"
  }]
}, {
  name: "Romance",
  color: "#ff7eb6",
  angle: Math.PI / 3,
  description: "Stories focused on love, connection, heartbreak, and emotions.",
  screenTrailer: "https://www.youtube.com/embed/0pdqf4P9MB8",
  movies: [{
    title: "La La Land",
    note: "Romance, music, dreams, and sacrifice.",
    trailer: "https://www.youtube.com/embed/0pdqf4P9MB8"
  }, {
    title: "The Notebook",
    note: "Classic emotional romance story.",
    trailer: "https://www.youtube.com/embed/BjJcYdEOI0k"
  }]
}, {
  name: "Comedy / Rom-Com",
  color: "#ffd166",
  angle: Math.PI / 3 * 2,
  description: "Light, funny stories that mix jokes, relationships, awkward moments, and comfort.",
  screenTrailer: "https://www.youtube.com/embed/ZQ-YX-5bAs0",
  movies: [{
    title: "Crazy Rich Asians",
    note: "Rom-com with family drama and style.",
    trailer: "https://www.youtube.com/embed/ZQ-YX-5bAs0"
  }, {
    title: "10 Things I Hate About You",
    note: "Funny high-school rom-com classic.",
    trailer: "https://www.youtube.com/embed/AWmjzCZr0Jw"
  }]
}, {
  name: "Horror",
  color: "#9d4edd",
  angle: Math.PI,
  description: "Dark movies made to create tension, fear, mystery, and suspense.",
  screenTrailer: "https://www.youtube.com/embed/DzfpyUB60YY",
  movies: [{
    title: "Get Out",
    note: "Psychological horror with social commentary.",
    trailer: "https://www.youtube.com/embed/DzfpyUB60YY"
  }, {
    title: "A Quiet Place",
    note: "Tense horror built around silence.",
    trailer: "https://www.youtube.com/embed/WR7cc5t7tv8"
  }]
}, {
  name: "Sci-Fi",
  color: "#4cc9f0",
  angle: Math.PI / 3 * 4,
  description: "Movies about future worlds, space, technology, time, and big ideas.",
  screenTrailer: "https://www.youtube.com/embed/zSWdZVtXT7E",
  movies: [{
    title: "Interstellar",
    note: "Space, time, family, and survival.",
    trailer: "https://www.youtube.com/embed/zSWdZVtXT7E"
  }, {
    title: "Blade Runner 2049",
    note: "Slow, beautiful futuristic sci-fi.",
    trailer: "https://www.youtube.com/embed/gCcx85zbxz4"
  }]
}, {
  name: "Animation / Family",
  color: "#80ed99",
  angle: Math.PI / 3 * 5,
  description: "Creative animated movies with emotional stories, adventure, and strong visuals.",
  screenTrailer: "https://www.youtube.com/embed/g4Hbz2jLxvQ",
  movies: [{
    title: "Spider-Man: Into the Spider-Verse",
    note: "Comic-book animation with a unique style.",
    trailer: "https://www.youtube.com/embed/g4Hbz2jLxvQ"
  }, {
    title: "Coco",
    note: "Family, music, memory, and culture.",
    trailer: "https://www.youtube.com/embed/Ga6RYejo6Hk"
  }]
}]; // ===============================
// CREATE MOVIE WORLD
// ===============================

exports.movieWorldData = movieWorldData;

function createMovieWorld(scene, cssScene, createFloatingText, position) {
  savedCssScene = cssScene;
  savedWorldPosition = position;
  var movieWorldGroup = new THREE.Group();
  movieWorldGroup.position.set(position.x, 0, position.z);
  var ground = new THREE.Mesh(new THREE.CircleGeometry(position.radius, 80), new THREE.MeshStandardMaterial({
    color: "#202020",
    roughness: 0.85
  }));
  ground.rotation.x = -Math.PI / 2;
  movieWorldGroup.add(ground);
  var road = new THREE.Mesh(new THREE.RingGeometry(16, 21, 100), new THREE.MeshStandardMaterial({
    color: "#111111",
    roughness: 0.7
  }));
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.03;
  movieWorldGroup.add(road);
  var sign = createFloatingText("MOVIE WORLD", "#ffcc66");
  sign.position.set(-7, 9, 0);
  movieWorldGroup.add(sign); // Popcorn machine in the middle of Movie World.

  addPopcornMachine(movieWorldGroup);
  var movieStations = [];
  movieWorldData.forEach(function (genre) {
    var radius = 31;
    var x = Math.cos(genre.angle) * radius;
    var z = Math.sin(genre.angle) * radius;
    var station = createMovieTheater(genre, x, z, createFloatingText);
    movieStations.push({
      group: station.group,
      genre: genre,
      trigger: new THREE.Vector3(x + position.x, 0, z + position.z)
    });
    savedMovieStations[genre.name] = {
      x: x,
      z: z,
      genre: genre
    };
    movieWorldGroup.add(station.group);
  });
  addMovieDecorations(movieWorldGroup);
  scene.add(movieWorldGroup);
  return {
    movieWorldGroup: movieWorldGroup,
    movieStations: movieStations
  };
} // ===============================
// CREATE MOVIE THEATER
// ===============================


function createMovieTheater(genre, x, z, createFloatingText) {
  var group = new THREE.Group();
  group.position.set(x, 0, z);
  group.lookAt(0, 0, 0);
  var base = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 5.6, 0.45, 40), new THREE.MeshStandardMaterial({
    color: "#151515",
    roughness: 0.7
  }));
  base.position.y = 0.22;
  group.add(base);
  var glowPlatform = new THREE.Mesh(new THREE.CircleGeometry(5.8, 40), new THREE.MeshStandardMaterial({
    color: genre.color,
    emissive: genre.color,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.18
  }));
  glowPlatform.rotation.x = -Math.PI / 2;
  glowPlatform.position.y = 0.05;
  group.add(glowPlatform); // 3D projector screen model for each genre.

  addProjectorModel(group, genre); // Cinema seats in front of the projector screen.
  // If the model is missing, it will use a simple backup seat.

  addMovieSeatModel(group, genre);
  var sign = createFloatingText(genre.name, genre.color);
  sign.position.set(-3.2, 5.7, -2.1);
  group.add(sign);
  return {
    group: group
  };
} // ===============================
// ADD PROJECTOR SCREEN MODEL
// ===============================


function addProjectorModel(group, genre) {
  var projectorHolder = new THREE.Group();
  projectorHolder.position.copy(PROJECTOR_MODEL_POSITION);
  projectorHolder.rotation.y = PROJECTOR_MODEL_ROTATION_Y;
  group.add(projectorHolder);
  loadProjectorModel().then(function (gltf) {
    var projector = gltf.scene.clone(true);
    centerModel(projector);
    projector.scale.copy(PROJECTOR_MODEL_SCALE);
    projector.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    projectorHolder.add(projector);
    console.log("".concat(genre.name, " projector screen loaded."));
  })["catch"](function (error) {
    console.log("".concat(genre.name, " projector model could not load. Backup screen added."), error);
    var backupProjector = createBackupProjector(genre.color);
    projectorHolder.add(backupProjector);
  });
} // ===============================
// ADD POPCORN MACHINE IN CENTER
// ===============================


function addPopcornMachine(group) {
  var popcornHolder = new THREE.Group();
  popcornHolder.position.copy(POPCORN_MACHINE_MODEL_POSITION);
  popcornHolder.rotation.y = POPCORN_MACHINE_MODEL_ROTATION_Y;
  group.add(popcornHolder);
  loadPopcornMachineModel().then(function (gltf) {
    var popcornMachine = gltf.scene.clone(true);
    centerModel(popcornMachine);
    popcornMachine.scale.copy(POPCORN_MACHINE_MODEL_SCALE);
    popcornMachine.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    popcornHolder.add(popcornMachine);
    console.log("Popcorn machine loaded.");
  })["catch"](function (error) {
    console.log("Popcorn machine could not load. Backup popcorn machine added.", error);
    var backupPopcorn = createBackupPopcornMachine();
    popcornHolder.add(backupPopcorn);
  });
} // ===============================
// ADD MOVIE SEATS
// ===============================


function addMovieSeatModel(group, genre) {
  var seatHolder = new THREE.Group();
  seatHolder.position.copy(MOVIE_SEAT_MODEL_POSITION);
  seatHolder.rotation.y = MOVIE_SEAT_MODEL_ROTATION_Y;
  group.add(seatHolder);
  loadMovieSeatModel().then(function (gltf) {
    var seatModel = gltf.scene.clone(true);
    centerModel(seatModel);
    seatModel.scale.copy(MOVIE_SEAT_MODEL_SCALE);
    seatModel.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    seatHolder.add(seatModel);
    console.log("".concat(genre.name, " movie seat loaded."));
  })["catch"](function (error) {
    console.log("".concat(genre.name, " movie seat model could not load. Backup seat added."), error);
    var backupSeat = createBackupMovieSeat();
    seatHolder.add(backupSeat);
  });
} // ===============================
// MOVIE SCREEN VIDEO FUNCTIONS
// ===============================


function updateMovieScreenVideo(genre) {
  if (!savedCssScene || !savedWorldPosition) return;
  if (!genre) return;
  if (activeMovieGenreName === genre.name) return;
  clearMovieScreenVideo();
  var stationData = savedMovieStations[genre.name];
  if (!stationData) return;
  activeMovieScreenGroup = createMovieIframeScreen(genre, stationData.x, stationData.z, savedWorldPosition);
  savedCssScene.add(activeMovieScreenGroup);
  activeMovieGenreName = genre.name;
}

function clearMovieScreenVideo() {
  if (!activeMovieScreenGroup || !savedCssScene) return;
  activeMovieScreenGroup.traverse(function (child) {
    if (child.element && child.element.tagName === "IFRAME") {
      child.element.src = "";
      child.element.remove();
    }
  });
  savedCssScene.remove(activeMovieScreenGroup);
  activeMovieScreenGroup = null;
  activeMovieGenreName = null;
}

function createMovieIframeScreen(genre, x, z, worldPosition) {
  var iframe = document.createElement("iframe");
  iframe.src = makeYoutubeScreenUrl(genre.screenTrailer || genre.movies[0].trailer);
  iframe.width = "640";
  iframe.height = "360";
  iframe.allow = "autoplay; encrypted-media; picture-in-picture";
  iframe.className = "movieWorldIframe";
  iframe.style.border = "0";
  iframe.style.borderRadius = "12px";
  iframe.style.background = "black";
  iframe.style.pointerEvents = "none";
  var screenObject = new _CSS3DRenderer.CSS3DObject(iframe);
  screenObject.scale.set(MOVIE_YOUTUBE_SCREEN_WIDTH / 640, MOVIE_YOUTUBE_SCREEN_HEIGHT / 360, 1);
  var cssStationGroup = new THREE.Group();
  cssStationGroup.position.set(worldPosition.x + x, 0, worldPosition.z + z);
  cssStationGroup.lookAt(worldPosition.x, 0, worldPosition.z);
  screenObject.position.copy(MOVIE_YOUTUBE_SCREEN_POSITION);
  screenObject.rotation.y = 0;
  cssStationGroup.add(screenObject);
  return cssStationGroup;
}

function makeYoutubeScreenUrl(url) {
  return "".concat(url, "?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&playsinline=1");
} // ===============================
// LOAD MODELS ONCE
// ===============================


function loadProjectorModel() {
  if (projectorModelPromise) {
    return projectorModelPromise;
  }

  var loader = new _GLTFLoader.GLTFLoader();
  projectorModelPromise = new Promise(function (resolve, reject) {
    loader.load(PROJECTOR_MODEL_PATH, function (gltf) {
      resolve(gltf);
    }, undefined, function (error) {
      reject(error);
    });
  });
  return projectorModelPromise;
}

function loadPopcornMachineModel() {
  if (popcornMachineModelPromise) {
    return popcornMachineModelPromise;
  }

  var loader = new _GLTFLoader.GLTFLoader();
  popcornMachineModelPromise = new Promise(function (resolve, reject) {
    loader.load(POPCORN_MACHINE_MODEL_PATH, function (gltf) {
      resolve(gltf);
    }, undefined, function (error) {
      reject(error);
    });
  });
  return popcornMachineModelPromise;
}

function loadMovieSeatModel() {
  if (movieSeatModelPromise) {
    return movieSeatModelPromise;
  }

  var loader = new _GLTFLoader.GLTFLoader();
  movieSeatModelPromise = new Promise(function (resolve, reject) {
    loader.load(MOVIE_SEAT_MODEL_PATH, function (gltf) {
      resolve(gltf);
    }, undefined, function (error) {
      reject(error);
    });
  });
  return movieSeatModelPromise;
} // ===============================
// BACKUP PROJECTOR SCREEN
// ===============================


function createBackupProjector(color) {
  var projector = new THREE.Group();
  var frame = new THREE.Mesh(new THREE.BoxGeometry(7, 4, 0.35), new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.35
  }));
  frame.position.set(0, 3.2, -2);
  projector.add(frame);
  var screen = new THREE.Mesh(new THREE.PlaneGeometry(6.1, 3.1), new THREE.MeshBasicMaterial({
    color: "#050505"
  }));
  screen.position.set(0, 3.2, -2.21);
  projector.add(screen);
  return projector;
} // ===============================
// BACKUP POPCORN MACHINE
// ===============================


function createBackupPopcornMachine() {
  var popcorn = new THREE.Group();
  var body = new THREE.Mesh(new THREE.BoxGeometry(2, 3, 1.4), new THREE.MeshStandardMaterial({
    color: "#b91c1c",
    roughness: 0.6
  }));
  body.position.y = 1.5;
  popcorn.add(body);
  var glass = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.2), new THREE.MeshStandardMaterial({
    color: "#fff7cc",
    emissive: "#fff7cc",
    emissiveIntensity: 0.25,
    transparent: true,
    opacity: 0.65
  }));
  glass.position.y = 2.5;
  popcorn.add(glass);
  var top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 1.6), new THREE.MeshStandardMaterial({
    color: "#ffd166",
    roughness: 0.5
  }));
  top.position.y = 3.3;
  popcorn.add(top);
  return popcorn;
} // ===============================
// BACKUP MOVIE SEAT
// ===============================


function createBackupMovieSeat() {
  var seat = new THREE.Group();
  var seatBottom = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.5, 1.8), new THREE.MeshStandardMaterial({
    color: "#5b1111",
    roughness: 0.65
  }));
  seatBottom.position.y = 0.6;
  seat.add(seatBottom);
  var seatBack = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.8, 0.45), new THREE.MeshStandardMaterial({
    color: "#7f1d1d",
    roughness: 0.65
  }));
  seatBack.position.set(0, 1.35, -0.7);
  seat.add(seatBack);
  var armLeft = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 1.8), new THREE.MeshStandardMaterial({
    color: "#111111",
    roughness: 0.65
  }));
  armLeft.position.set(-2.2, 0.85, 0);
  seat.add(armLeft);
  var armRight = armLeft.clone();
  armRight.position.x = 2.2;
  seat.add(armRight);
  return seat;
} // ===============================
// MOVIE DECORATIONS
// ===============================


function addMovieDecorations(group) {
  for (var i = 0; i < 12; i++) {
    var angle = Math.random() * Math.PI * 2;
    var radius = 38 + Math.random() * 10;
    var poster = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3, 0.2), new THREE.MeshStandardMaterial({
      color: "#ffcc66",
      emissive: "#ffcc66",
      emissiveIntensity: 0.25
    }));
    poster.position.set(Math.cos(angle) * radius, 1.5, Math.sin(angle) * radius);
    poster.lookAt(0, 1.5, 0);
    group.add(poster);
  }
} // ===============================
// HELPER FUNCTIONS
// ===============================


function centerModel(model) {
  var box = new THREE.Box3().setFromObject(model);
  var center = new THREE.Vector3();
  box.getCenter(center);
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= box.min.y;
}
//# sourceMappingURL=movieworld.dev.js.map
