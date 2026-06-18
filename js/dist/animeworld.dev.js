"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAnimeWorld = createAnimeWorld;
exports.animeWorldData = void 0;

var THREE = _interopRequireWildcard(require("three"));

var _GLTFLoader = require("three/addons/loaders/GLTFLoader.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// ===============================
// MODEL PATHS
// ===============================
var TORII_GATE_MODEL_PATH = "models/japanese_torii_gate_game_asset.glb";
var SHRINE_MODEL_PATH = "models/malevolent_shrine__jujutsu_kaisen.glb"; // ===============================
// TORII GATE SETTINGS
// ===============================
// I kept your Torii gate size exactly the same.

var TORII_GATE_SCALE = new THREE.Vector3(0.03, 0.03, 0.03); // If all gates face the wrong direction, change this.
// Try 0, Math.PI, Math.PI / 2, or -Math.PI / 2.

var TORII_GATE_ROTATION_OFFSET = 0; // These are placed at the 3 Anime World entrances:
// 1. Hub -> Anime
// 2. Music -> Anime
// 3. Movie -> Anime

var TORII_GATE_ENTRANCES = [{
  name: "Hub Entrance",
  position: new THREE.Vector3(42, 0, 31),
  rotationY: Math.atan2(145, 105)
}, {
  name: "Music Entrance",
  position: new THREE.Vector3(0, 0, 52),
  rotationY: Math.atan2(0, 210)
}, {
  name: "Movie Entrance",
  position: new THREE.Vector3(46, 0, -24),
  rotationY: Math.atan2(145, -75)
}]; // ===============================
// SHRINE SETTINGS
// ===============================
// I put your Malevolent Shrine scale back the way you had it.
// I only removed the extra "40" after the line because that breaks JavaScript.

var SHRINE_SCALE = new THREE.Vector3(40.08, 40.08, 40.08); // This puts the shrine in the middle of Anime World.

var SHRINE_POSITION = new THREE.Vector3(0, 0, 0); // Change this if the shrine faces the wrong direction.

var SHRINE_ROTATION_Y = 0; // ===============================
// ANIME GENRE MODEL SETTINGS
// ===============================
// maxSize = object size
// position = where it floats above the circle/platform
// modelOffset = small correction if a model appears off the platform

var ANIME_GENRE_MODEL_SETTINGS = {
  "Shonen": {
    modelPath: "models/katana.glb",
    maxSize: 3.2,
    position: new THREE.Vector3(0, 2.2, 0),
    rotation: new THREE.Vector3(0, 0, 0),
    modelOffset: new THREE.Vector3(0, 0, 0),
    floatAmplitude: 0.18,
    floatSpeed: 1.8,
    spinSpeed: 0.003
  },
  "Sports Anime": {
    modelPath: "models/3d_sports_basket_ball_game_asset_pbr_model.glb",
    maxSize: 3.0,
    position: new THREE.Vector3(0, 2.2, 0),
    rotation: new THREE.Vector3(0, 0, 0),
    modelOffset: new THREE.Vector3(0, 0, 0),
    floatAmplitude: 0.18,
    floatSpeed: 1.9,
    spinSpeed: 0.0035
  },
  "Romance Anime": {
    modelPath: "models/single_stem_rose.glb",
    maxSize: 2.8,
    position: new THREE.Vector3(0, 2.1, 0),
    rotation: new THREE.Vector3(0, 0, 0),
    modelOffset: new THREE.Vector3(0, 0, 0),
    floatAmplitude: 0.15,
    floatSpeed: 1.6,
    spinSpeed: 0.0025
  },
  "Fantasy Anime": {
    modelPath: "models/fantasy_final.glb",
    maxSize: 2.4,
    position: new THREE.Vector3(0, 2.4, 0),
    rotation: new THREE.Vector3(0, 0, 0),
    modelOffset: new THREE.Vector3(0, 0, 0),
    floatAmplitude: 0.14,
    floatSpeed: 1.7,
    spinSpeed: 0.0022
  },
  "Mystery / Psychological": {
    modelPath: "models/mystory_box_holi.glb",
    maxSize: 3.0,
    position: new THREE.Vector3(0, 2.15, 0),
    rotation: new THREE.Vector3(0, 0, 0),
    modelOffset: new THREE.Vector3(0, 0, 0),
    floatAmplitude: 0.16,
    floatSpeed: 1.75,
    spinSpeed: 0.003
  },
  "Slice of Life": {
    modelPath: "models/cake.glb",
    maxSize: 2.6,
    position: new THREE.Vector3(0, 2.0, 0),
    rotation: new THREE.Vector3(0, 0, 0),
    modelOffset: new THREE.Vector3(0, 0, 0),
    floatAmplitude: 0.14,
    floatSpeed: 1.5,
    spinSpeed: 0.0025
  }
}; // ===============================
// MODEL CACHE
// ===============================

var toriiGateModelPromise = null;
var shrineModelPromise = null;
var genreModelPromises = {}; // ===============================
// FLOATING MODEL ANIMATION
// ===============================

var floatingGenreObjects = [];
var floatingAnimationStarted = false; // ===============================
// ANIME WORLD DATA
// ===============================

var animeWorldData = [{
  name: "Shonen",
  color: "#ff6b6b",
  angle: 0,
  description: "Action anime with battles, growth, friendship, and strong main characters.",
  anime: [{
    title: "Jujutsu Kaisen",
    note: "Dark shonen with curses, action, and stylish fights.",
    trailer: "https://www.youtube.com/embed/pkKu9hLT-t8"
  }, {
    title: "Demon Slayer",
    note: "Emotional action anime with beautiful animation.",
    trailer: "https://www.youtube.com/embed/VQGCKyvzIM4"
  }]
}, {
  name: "Sports Anime",
  color: "#80ed99",
  angle: Math.PI / 3,
  description: "Anime about teamwork, training, competition, and personal growth.",
  anime: [{
    title: "Haikyuu!!",
    note: "Volleyball anime with teamwork and hype matches.",
    trailer: "https://www.youtube.com/embed/JOGp2c7-cKc"
  }, {
    title: "Blue Lock",
    note: "Football anime focused on ego and becoming the best striker.",
    trailer: "https://www.youtube.com/embed/IVsII3dLbWc"
  }]
}, {
  name: "Romance Anime",
  color: "#ff8fab",
  angle: Math.PI / 3 * 2,
  description: "Anime focused on love, friendship, emotions, and relationships.",
  anime: [{
    title: "Your Name",
    note: "Romance story with beautiful visuals and supernatural mystery.",
    trailer: "https://www.youtube.com/embed/xU47nhruN-Q"
  }, {
    title: "A Silent Voice",
    note: "Emotional anime film about regret, bullying, and healing.",
    trailer: "https://www.youtube.com/embed/nfK6UgLra7g"
  }]
}, {
  name: "Fantasy Anime",
  color: "#c77dff",
  angle: Math.PI,
  description: "Anime with magic, monsters, other worlds, kingdoms, and adventure.",
  anime: [{
    title: "Frieren",
    note: "Fantasy anime about time, memory, and adventure after the hero journey.",
    trailer: "https://www.youtube.com/embed/Iwr1aLEDpe4"
  }, {
    title: "Mushoku Tensei",
    note: "Isekai fantasy with world building and magic.",
    trailer: "https://www.youtube.com/embed/1TiBoHQUj3I"
  }]
}, {
  name: "Mystery / Psychological",
  color: "#4cc9f0",
  angle: Math.PI / 3 * 4,
  description: "Anime with mind games, mystery, tension, and darker stories.",
  anime: [{
    title: "Death Note",
    note: "Psychological battle between a student and a detective.",
    trailer: "https://www.youtube.com/embed/NlJZ-YgAt-c"
  }, {
    title: "Monster",
    note: "Slow psychological thriller with crime and moral questions.",
    trailer: "https://www.youtube.com/embed/9aS-EgdAq6U"
  }]
}, {
  name: "Slice of Life",
  color: "#ffd166",
  angle: Math.PI / 3 * 5,
  description: "Calm anime about daily life, friendship, school, work, and personal moments.",
  anime: [{
    title: "A Place Further Than the Universe",
    note: "Adventure slice-of-life about friendship and chasing dreams.",
    trailer: "https://www.youtube.com/embed/nt573QIevIM"
  }, {
    title: "Barakamon",
    note: "Relaxing anime about creativity, life, and community.",
    trailer: "https://www.youtube.com/embed/1gmN_3kr4wo"
  }]
}]; // ===============================
// CREATE ANIME WORLD
// ===============================

exports.animeWorldData = animeWorldData;

function createAnimeWorld(scene, createFloatingText, position) {
  var animeWorldGroup = new THREE.Group();
  animeWorldGroup.position.set(position.x, 0, position.z);
  var ground = new THREE.Mesh(new THREE.CircleGeometry(position.radius, 80), new THREE.MeshStandardMaterial({
    color: "#241018",
    roughness: 0.8
  }));
  ground.rotation.x = -Math.PI / 2;
  animeWorldGroup.add(ground);
  var road = new THREE.Mesh(new THREE.RingGeometry(16, 21, 100), new THREE.MeshStandardMaterial({
    color: "#12070c",
    roughness: 0.7
  }));
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.03;
  animeWorldGroup.add(road);
  var sign = createFloatingText("ANIME WORLD", "#ff6b6b");
  sign.position.set(-8, 9, 0);
  animeWorldGroup.add(sign);
  addToriiGateEntrances(animeWorldGroup);
  addCenterShrine(animeWorldGroup);
  var animeStations = [];
  animeWorldData.forEach(function (genre) {
    var radius = 31;
    var x = Math.cos(genre.angle) * radius;
    var z = Math.sin(genre.angle) * radius;
    var station = createAnimeStation(genre, x, z, createFloatingText);
    animeStations.push({
      group: station.group,
      genre: genre,
      trigger: new THREE.Vector3(x + position.x, 0, z + position.z)
    });
    animeWorldGroup.add(station.group);
  });
  addAnimeDecorations(animeWorldGroup);
  startFloatingAnimation();
  scene.add(animeWorldGroup);
  return {
    animeWorldGroup: animeWorldGroup,
    animeStations: animeStations
  };
} // ===============================
// ADD CENTER SHRINE
// ===============================


function addCenterShrine(group) {
  var shrineHolder = new THREE.Group();
  shrineHolder.position.copy(SHRINE_POSITION);
  shrineHolder.rotation.y = SHRINE_ROTATION_Y;
  group.add(shrineHolder);
  loadShrineModel().then(function (gltf) {
    var shrine = gltf.scene.clone(true);
    centerModel(shrine);
    shrine.scale.copy(SHRINE_SCALE);
    shrine.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    shrineHolder.add(shrine);
    console.log("Jujutsu Kaisen shrine loaded.");
  })["catch"](function (error) {
    console.log("Shrine model could not load. Backup shrine added.", error);
    var backupShrine = createBackupShrine();
    shrineHolder.add(backupShrine);
  });
} // ===============================
// TORII GATE ENTRANCES
// ===============================


function addToriiGateEntrances(group) {
  loadToriiGateModel().then(function (gltf) {
    TORII_GATE_ENTRANCES.forEach(function (gateData) {
      var gateHolder = new THREE.Group();
      gateHolder.position.copy(gateData.position);
      gateHolder.rotation.y = gateData.rotationY + TORII_GATE_ROTATION_OFFSET;
      var gate = gltf.scene.clone(true);
      centerModel(gate);
      gate.scale.copy(TORII_GATE_SCALE);
      gate.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });
      gateHolder.add(gate);
      group.add(gateHolder);
      console.log("".concat(gateData.name, " Torii gate loaded."));
    });
  })["catch"](function (error) {
    console.log("Torii gate model could not load. Backup gates added.", error);
    TORII_GATE_ENTRANCES.forEach(function (gateData) {
      var backupGate = createBackupToriiGate();
      backupGate.position.copy(gateData.position);
      backupGate.rotation.y = gateData.rotationY + TORII_GATE_ROTATION_OFFSET;
      group.add(backupGate);
    });
  });
} // ===============================
// CREATE ANIME STATION
// ===============================


function createAnimeStation(genre, x, z, createFloatingText) {
  var group = new THREE.Group();
  group.position.set(x, 0, z);
  group.lookAt(0, 0, 0);
  var base = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 0.45, 40), new THREE.MeshStandardMaterial({
    color: "#101010",
    roughness: 0.7
  }));
  base.position.y = 0.22;
  group.add(base);
  var glowPlatform = new THREE.Mesh(new THREE.CircleGeometry(5.4, 40), new THREE.MeshStandardMaterial({
    color: genre.color,
    emissive: genre.color,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.2
  }));
  glowPlatform.rotation.x = -Math.PI / 2;
  glowPlatform.position.y = 0.05;
  group.add(glowPlatform);
  addGenreFloatingModel(group, genre);
  var sign = createFloatingText(genre.name, genre.color);
  sign.position.set(-3.5, 5.8, 0);
  group.add(sign);
  return {
    group: group
  };
} // ===============================
// ADD FLOATING GENRE MODEL
// ===============================


function addGenreFloatingModel(group, genre) {
  var settings = ANIME_GENRE_MODEL_SETTINGS[genre.name];

  if (!settings) {
    var backup = createBackupGenreObject(genre.color);
    backup.position.set(0, 2.1, 0);
    group.add(backup);
    return;
  }

  var holder = new THREE.Group();
  holder.position.copy(settings.position);
  group.add(holder);
  loadGenreModel(settings.modelPath).then(function (gltf) {
    var model = gltf.scene.clone(true);
    centerModel(model);
    scaleModelToFit(model, settings.maxSize);
    centerModel(model);

    if (settings.modelOffset) {
      model.position.add(settings.modelOffset);
    }

    model.rotation.x = settings.rotation.x;
    model.rotation.y = settings.rotation.y;
    model.rotation.z = settings.rotation.z;
    model.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    holder.add(model);
    floatingGenreObjects.push({
      holder: holder,
      model: model,
      baseY: settings.position.y,
      baseRotationY: settings.rotation.y,
      amplitude: settings.floatAmplitude,
      floatSpeed: settings.floatSpeed,
      spinSpeed: settings.spinSpeed,
      offset: Math.random() * 10
    });
    console.log("".concat(genre.name, " floating model loaded."));
  })["catch"](function (error) {
    console.log("".concat(genre.name, " model could not load. Backup object added."), error);
    var backup = createBackupGenreObject(genre.color);
    holder.add(backup);
  });
} // ===============================
// FLOATING ANIMATION LOOP
// ===============================


function startFloatingAnimation() {
  if (floatingAnimationStarted) return;
  floatingAnimationStarted = true;

  function animateFloatingObjects() {
    requestAnimationFrame(animateFloatingObjects);
    var time = performance.now() * 0.001;
    floatingGenreObjects.forEach(function (item) {
      item.holder.position.y = item.baseY + Math.sin(time * item.floatSpeed + item.offset) * item.amplitude;
      item.model.rotation.y = item.baseRotationY + time * item.spinSpeed;
    });
  }

  animateFloatingObjects();
} // ===============================
// LOAD MODELS ONCE
// ===============================


function loadToriiGateModel() {
  if (toriiGateModelPromise) {
    return toriiGateModelPromise;
  }

  var loader = new _GLTFLoader.GLTFLoader();
  toriiGateModelPromise = new Promise(function (resolve, reject) {
    loader.load(TORII_GATE_MODEL_PATH, function (gltf) {
      resolve(gltf);
    }, undefined, function (error) {
      reject(error);
    });
  });
  return toriiGateModelPromise;
}

function loadShrineModel() {
  if (shrineModelPromise) {
    return shrineModelPromise;
  }

  var loader = new _GLTFLoader.GLTFLoader();
  shrineModelPromise = new Promise(function (resolve, reject) {
    loader.load(SHRINE_MODEL_PATH, function (gltf) {
      resolve(gltf);
    }, undefined, function (error) {
      reject(error);
    });
  });
  return shrineModelPromise;
}

function loadGenreModel(modelPath) {
  if (genreModelPromises[modelPath]) {
    return genreModelPromises[modelPath];
  }

  var loader = new _GLTFLoader.GLTFLoader();
  genreModelPromises[modelPath] = new Promise(function (resolve, reject) {
    loader.load(modelPath, function (gltf) {
      resolve(gltf);
    }, undefined, function (error) {
      reject(error);
    });
  });
  return genreModelPromises[modelPath];
} // ===============================
// BACKUP SHRINE
// ===============================


function createBackupShrine() {
  var shrine = new THREE.Group();
  var base = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 0.8, 32), new THREE.MeshStandardMaterial({
    color: "#1a1a1a",
    roughness: 0.7
  }));
  base.position.y = 0.4;
  shrine.add(base);
  var middle = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 5), new THREE.MeshStandardMaterial({
    color: "#6b0f1a",
    emissive: "#6b0f1a",
    emissiveIntensity: 0.2,
    roughness: 0.6
  }));
  middle.position.y = 2;
  shrine.add(middle);
  var roof = new THREE.Mesh(new THREE.ConeGeometry(4.5, 2, 4), new THREE.MeshStandardMaterial({
    color: "#111111",
    roughness: 0.65
  }));
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 4.3;
  shrine.add(roof);
  shrine.scale.copy(SHRINE_SCALE);
  return shrine;
} // ===============================
// BACKUP TORII GATE
// ===============================


function createBackupToriiGate() {
  var gate = new THREE.Group();
  var redMaterial = new THREE.MeshStandardMaterial({
    color: "#b91c1c",
    emissive: "#ff2d2d",
    emissiveIntensity: 0.15,
    roughness: 0.6
  });
  var darkMaterial = new THREE.MeshStandardMaterial({
    color: "#111111",
    roughness: 0.7
  });
  var leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 5, 16), redMaterial);
  leftPillar.position.set(-2.2, 2.5, 0);
  gate.add(leftPillar);
  var rightPillar = leftPillar.clone();
  rightPillar.position.x = 2.2;
  gate.add(rightPillar);
  var topBeam = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.35, 0.45), redMaterial);
  topBeam.position.set(0, 5.1, 0);
  gate.add(topBeam);
  var upperBeam = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.35, 0.55), darkMaterial);
  upperBeam.position.set(0, 5.55, 0);
  gate.add(upperBeam);
  var middleBeam = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.25, 0.4), redMaterial);
  middleBeam.position.set(0, 4.2, 0);
  gate.add(middleBeam);
  gate.scale.copy(TORII_GATE_SCALE);
  return gate;
} // ===============================
// BACKUP GENRE OBJECT
// ===============================


function createBackupGenreObject(color) {
  var object = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 24), new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.35,
    roughness: 0.5
  }));
  return object;
} // ===============================
// ANIME DECORATION
// ===============================


function addAnimeDecorations(group) {
  for (var i = 0; i < 14; i++) {
    var angle = Math.random() * Math.PI * 2;
    var radius = 38 + Math.random() * 10;
    var lantern = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshStandardMaterial({
      color: "#ff6b6b",
      emissive: "#ff6b6b",
      emissiveIntensity: 0.35
    }));
    lantern.position.set(Math.cos(angle) * radius, 1, Math.sin(angle) * radius);
    group.add(lantern);
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

function scaleModelToFit(model, targetMaxSize) {
  var box = new THREE.Box3().setFromObject(model);
  var size = new THREE.Vector3();
  box.getSize(size);
  var maxDimension = Math.max(size.x, size.y, size.z);
  if (maxDimension === 0) return;
  var scaleFactor = targetMaxSize / maxDimension;
  model.scale.multiplyScalar(scaleFactor);
}
//# sourceMappingURL=animeworld.dev.js.map
