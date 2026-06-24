"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createHubWorld = createHubWorld;

var THREE = _interopRequireWildcard(require("three"));

var _GLTFLoader = require("three/addons/loaders/GLTFLoader.js");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var rotatingHologramHolder = null; // ===============================
// HUB SIGN SETTINGS
// ===============================
// These control the size and position of the hub signs.
// x = left / right
// y = up / down
// z = forward / backward

var MAIN_MAP_SIGN_POSITION = new THREE.Vector3(0, 4.2, 18);
var MAIN_MAP_SIGN_SCALE = new THREE.Vector3(13, 6, 1);
var DIRECTION_SIGN_SCALE = new THREE.Vector3(8, 3, 1); // Move these if a sign is in the wrong place.

var DIRECTION_SIGNS = [{
  title: "MOVIE WORLD",
  subtitle: "Drive this way",
  arrow: "↓",
  color: "#ffcc66",
  position: new THREE.Vector3(0, 3.4, -34)
}, {
  title: "TV WORLD",
  subtitle: "Shows and series",
  arrow: "↘",
  color: "#7cc7ff",
  position: new THREE.Vector3(32, 3.4, -24)
}, {
  title: "GAME WORLD",
  subtitle: "Play and explore",
  arrow: "→",
  color: "#80ed99",
  position: new THREE.Vector3(34, 3.4, 18)
}, {
  title: "MUSIC WORLD",
  subtitle: "Stages and videos",
  arrow: "←",
  color: "#ff8ee8",
  position: new THREE.Vector3(-34, 3.4, 18)
}, {
  title: "ANIME WORLD",
  subtitle: "Anime stations",
  arrow: "↙",
  color: "#ff6b6b",
  position: new THREE.Vector3(-32, 3.4, -24)
}]; // ===============================
// CREATE CENTRAL HUB
// ===============================

function createHubWorld(scene, createFloatingText, position) {
  var hubGroup = new THREE.Group();
  hubGroup.position.set(position.x, 0, position.z);
  var hubGround = new THREE.Mesh(new THREE.CircleGeometry(position.radius, 90), new THREE.MeshStandardMaterial({
    color: "#171717",
    roughness: 0.8
  }));
  hubGround.rotation.x = -Math.PI / 2;
  hubGroup.add(hubGround);
  var hubRoad = new THREE.Mesh(new THREE.RingGeometry(18, 24, 100), new THREE.MeshStandardMaterial({
    color: "#0d0d0d",
    roughness: 0.7
  }));
  hubRoad.rotation.x = -Math.PI / 2;
  hubRoad.position.y = 0.03;
  hubGroup.add(hubRoad);
  var centerPlatform = new THREE.Mesh(new THREE.CircleGeometry(12, 60), new THREE.MeshStandardMaterial({
    color: "#263238",
    emissive: "#263238",
    emissiveIntensity: 0.35
  }));
  centerPlatform.rotation.x = -Math.PI / 2;
  centerPlatform.position.y = 0.06;
  hubGroup.add(centerPlatform);
  addHologramSetup(hubGroup);
  var title = createFloatingText("VIDEO ENTERTAINMENT DRIVE", "#ffffff");
  title.position.set(-13, 13, 0);
  hubGroup.add(title);
  var subtitle = createFloatingText("CENTRAL HUB", "#ffcc66");
  subtitle.position.set(-6, 9, 8);
  hubGroup.add(subtitle);
  var instruction = createFloatingText("DRIVE TO ALL WORLDS AND EXPLORE", "#7cc7ff");
  instruction.position.set(-12, 6.5, -10);
  hubGroup.add(instruction); // Add hub navigation signs and billboards.

  addHubNavigationSigns(hubGroup);
  addHubDecorations(hubGroup);
  scene.add(hubGroup);
  return {
    hubGroup: hubGroup,
    update: updateHubWorld
  };
}

function updateHubWorld(deltaTime) {
  if (!rotatingHologramHolder) return;
  rotatingHologramHolder.rotation.y += 0.3 * deltaTime;
} // ===============================
// HUB NAVIGATION SIGNS
// ===============================


function addHubNavigationSigns(group) {
  addMainMapSign(group);
  DIRECTION_SIGNS.forEach(function (signData) {
    var sign = createDirectionSign(signData.title, signData.subtitle, signData.arrow, signData.color);
    sign.position.copy(signData.position); // Orient each sign toward the center of the hub.

    sign.lookAt(0, signData.position.y, 0);
    group.add(sign);
  });
} // ===============================
// MAIN MAP SIGN
// ===============================


function addMainMapSign(group) {
  var sign = createMainMapBoard();
  sign.position.copy(MAIN_MAP_SIGN_POSITION);
  sign.lookAt(0, MAIN_MAP_SIGN_POSITION.y, 0);
  group.add(sign);
}

function createMainMapBoard() {
  var canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  var ctx = canvas.getContext("2d"); // Background

  ctx.fillStyle = "#090909";
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Border glow

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 12;
  ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
  ctx.strokeStyle = "#ffcc66";
  ctx.lineWidth = 5;
  ctx.strokeRect(34, 34, canvas.width - 68, canvas.height - 68); // Title

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 64px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 18;
  ctx.fillText("WORLD MAP", canvas.width / 2, 80);
  ctx.shadowBlur = 0; // World list

  ctx.font = "bold 42px Arial";
  ctx.textAlign = "left";
  drawMapLine(ctx, "↓", "MOVIE WORLD", "#ffcc66", 210);
  drawMapLine(ctx, "↘", "TV WORLD", "#7cc7ff", 270);
  drawMapLine(ctx, "→", "GAME WORLD", "#80ed99", 330);
  drawMapLine(ctx, "←", "MUSIC WORLD", "#ff8ee8", 390);
  drawMapLine(ctx, "↙", "ANIME WORLD", "#ff6b6b", 450);
  var texture = new THREE.CanvasTexture(canvas);
  var material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });
  var board = new THREE.Mesh(new THREE.PlaneGeometry(MAIN_MAP_SIGN_SCALE.x, MAIN_MAP_SIGN_SCALE.y), material);
  var frame = createSignFrame(MAIN_MAP_SIGN_SCALE.x, MAIN_MAP_SIGN_SCALE.y, "#ffcc66");
  var signGroup = new THREE.Group();
  signGroup.add(board);
  signGroup.add(frame);
  return signGroup;
}

function drawMapLine(ctx, arrow, text, color, y) {
  ctx.fillStyle = color;
  ctx.fillText(arrow, 260, y);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, 340, y);
} // ===============================
// DIRECTION SIGNS
// ===============================


function createDirectionSign(title, subtitle, arrow, color) {
  var canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 384;
  var ctx = canvas.getContext("2d"); // Background

  ctx.fillStyle = "#080808";
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Border

  ctx.strokeStyle = color;
  ctx.lineWidth = 14;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84); // Arrow

  ctx.fillStyle = color;
  ctx.font = "bold 120px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.shadowColor = color;
  ctx.shadowBlur = 25;
  ctx.fillText(arrow, 80, 190); // Title

  ctx.shadowBlur = 18;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 68px Arial";
  ctx.fillText(title, 260, 145); // Subtitle

  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.font = "bold 38px Arial";
  ctx.fillText(subtitle, 265, 230);
  var texture = new THREE.CanvasTexture(canvas);
  var material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });
  var board = new THREE.Mesh(new THREE.PlaneGeometry(DIRECTION_SIGN_SCALE.x, DIRECTION_SIGN_SCALE.y), material);
  var frame = createSignFrame(DIRECTION_SIGN_SCALE.x, DIRECTION_SIGN_SCALE.y, color);
  var postLeft = createSignPost(color);
  postLeft.position.set(-DIRECTION_SIGN_SCALE.x / 2 + 0.7, -2.1, 0.05);
  var postRight = createSignPost(color);
  postRight.position.set(DIRECTION_SIGN_SCALE.x / 2 - 0.7, -2.1, 0.05);
  var signGroup = new THREE.Group();
  signGroup.add(board);
  signGroup.add(frame);
  signGroup.add(postLeft);
  signGroup.add(postRight);
  return signGroup;
} // ===============================
// SIGN FRAME AND POSTS
// ===============================


function createSignFrame(width, height, color) {
  var frameGroup = new THREE.Group();
  var frameMaterial = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.6,
    roughness: 0.5
  });
  var top = new THREE.Mesh(new THREE.BoxGeometry(width + 0.25, 0.12, 0.12), frameMaterial);
  top.position.set(0, height / 2, 0.03);
  frameGroup.add(top);
  var bottom = top.clone();
  bottom.position.y = -height / 2;
  frameGroup.add(bottom);
  var left = new THREE.Mesh(new THREE.BoxGeometry(0.12, height + 0.25, 0.12), frameMaterial);
  left.position.set(-width / 2, 0, 0.03);
  frameGroup.add(left);
  var right = left.clone();
  right.position.x = width / 2;
  frameGroup.add(right);
  return frameGroup;
}

function createSignPost(color) {
  var post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.5, 0.18), new THREE.MeshStandardMaterial({
    color: "#222222",
    emissive: color,
    emissiveIntensity: 0.18,
    roughness: 0.6
  }));
  return post;
} // ===============================
// HOLOGRAM PROJECTOR + EARTH HOLOGRAM
// ===============================


function addHologramSetup(group) {
  var loader = new _GLTFLoader.GLTFLoader();
  var hologramSetup = new THREE.Group();
  hologramSetup.position.set(0, 0, 0);
  group.add(hologramSetup);
  var projectorHolder = new THREE.Group(); // Raise/lower the projector here.
  // Bigger middle number = higher projector.

  projectorHolder.position.set(0, 1.8, 0);
  hologramSetup.add(projectorHolder);
  var hologramHolder = new THREE.Group(); // Raise/lower the hologram here.

  hologramHolder.position.set(0, 6.2, 0);
  hologramSetup.add(hologramHolder);
  rotatingHologramHolder = hologramHolder; // ===============================
  // LOAD PROJECTOR MODEL
  // ===============================

  loader.load("models/hologram_projector_with_hologra.glb", function (gltf) {
    var projector = gltf.scene; // Center the model inside the holder.

    centerModel(projector); // Keep the model inside the holder.

    projector.position.set(projector.position.x, projector.position.y, projector.position.z); // Make projector bigger so the actual 3D model shows.

    projector.scale.set(6, 6, 6);
    projector.rotation.y = 0;
    projectorHolder.add(projector);
    console.log("Hologram projector loaded.");
  }, function () {
    console.log("Hologram projector is loading...");
  }, function (error) {
    console.log("Hologram projector could not load. Backup base added.", error);
    var backupProjector = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.8, 1, 64), new THREE.MeshStandardMaterial({
      color: "#111827",
      emissive: "#4cc9f0",
      emissiveIntensity: 0.35,
      roughness: 0.45
    }));
    backupProjector.position.set(0, 0, 0);
    projectorHolder.add(backupProjector);
  }); // ===============================
  // LOAD EARTH HOLOGRAM MODEL
  // ===============================

  loader.load("models/earth_globe_hologram_2mb_looping_animation.glb", function (gltf) {
    var hologram = gltf.scene;
    centerModel(hologram);
    hologram.position.set(hologram.position.x, hologram.position.y, hologram.position.z);
    hologram.scale.set(4, 4, 4);
    hologramHolder.add(hologram);
    var glowRing = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.08, 16, 80), new THREE.MeshStandardMaterial({
      color: "#4cc9f0",
      emissive: "#4cc9f0",
      emissiveIntensity: 1.4,
      transparent: true,
      opacity: 0.85
    }));
    glowRing.rotation.x = Math.PI / 2;
    glowRing.position.set(0, -1.5, 0);
    hologramHolder.add(glowRing);
    var beam = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 3.2, 5.2, 48, 1, true), new THREE.MeshStandardMaterial({
      color: "#4cc9f0",
      emissive: "#4cc9f0",
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.13,
      side: THREE.DoubleSide
    }));
    beam.position.set(0, -2.4, 0);
    hologramHolder.add(beam);
    console.log("Earth hologram loaded.");
  }, function () {
    console.log("Earth hologram is loading...");
  }, function (error) {
    console.log("Earth hologram could not load. Backup hologram added.", error);
    var backupSphere = new THREE.Mesh(new THREE.SphereGeometry(4, 32, 32), new THREE.MeshStandardMaterial({
      color: "#4cc9f0",
      emissive: "#4cc9f0",
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.65
    }));
    backupSphere.position.set(0, 0, 0);
    hologramHolder.add(backupSphere);
  });
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
// HUB DECORATIONS
// ===============================


function addHubDecorations(group) {
  var colors = ["#ffcc66", "#7cc7ff", "#ff8ee8", "#80ed99", "#ff6b6b"];

  for (var i = 0; i < 18; i++) {
    var angle = Math.random() * Math.PI * 2;
    var radius = 32 + Math.random() * 18;
    var color = colors[i % colors.length];
    var pillar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 4 + Math.random() * 4, 1.1), new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.25
    }));
    pillar.position.set(Math.cos(angle) * radius, pillar.geometry.parameters.height / 2, Math.sin(angle) * radius);
    group.add(pillar);
  }
}
//# sourceMappingURL=hubworld.dev.js.map
