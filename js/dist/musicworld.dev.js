"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMusicWorld = createMusicWorld;
exports.musicWorldData = void 0;

var THREE = _interopRequireWildcard(require("three"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// ===============================
// MUSIC WORLD DATA
// ===============================
var musicWorldData = [{
  name: "Pop",
  color: "#ff8ee8",
  angle: 0,
  description: "Popular music with catchy melodies, strong visuals, and music videos.",
  songs: [{
    title: "Dua Lipa - Houdini",
    note: "Modern pop with dance visuals.",
    video: "https://www.youtube.com/embed/suAR1PYFNYA"
  }, {
    title: "The Weeknd - Blinding Lights",
    note: "Retro pop style with cinematic visuals.",
    video: "https://www.youtube.com/embed/4NRXx6U8ABQ"
  }]
}, {
  name: "Hip-Hop",
  color: "#ffd166",
  angle: Math.PI / 3,
  description: "Music focused on rhythm, flow, lyrics, and strong visual identity.",
  songs: [{
    title: "Kendrick Lamar - HUMBLE.",
    note: "Strong visuals and performance style.",
    video: "https://www.youtube.com/embed/tvTRZJ-4EyI"
  }, {
    title: "Travis Scott - SICKO MODE",
    note: "Creative editing and surreal visuals.",
    video: "https://www.youtube.com/embed/6ONRf7h3Mdk"
  }]
}, {
  name: "Rock",
  color: "#ff4d4d",
  angle: Math.PI / 3 * 2,
  description: "Band-based music with guitars, drums, energy, and stage performance.",
  songs: [{
    title: "Foo Fighters - The Pretender",
    note: "Performance-based rock music video.",
    video: "https://www.youtube.com/embed/SBjQ9tuuTJQ"
  }, {
    title: "Linkin Park - Numb",
    note: "Rock video with emotional storytelling.",
    video: "https://www.youtube.com/embed/kXYiU_JCYtU"
  }]
}, {
  name: "R&B",
  color: "#c77dff",
  angle: Math.PI,
  description: "Smooth vocals, emotional stories, and stylish music videos.",
  songs: [{
    title: "SZA - Snooze",
    note: "R&B with soft and emotional visuals.",
    video: "https://www.youtube.com/embed/LDY_XyxBu8A"
  }, {
    title: "Brent Faiyaz - All Mine",
    note: "Smooth R&B mood and atmosphere.",
    video: "https://www.youtube.com/embed/ZEvQOPUHGH8"
  }]
}, {
  name: "EDM",
  color: "#4cc9f0",
  angle: Math.PI / 3 * 4,
  description: "Electronic music with festivals, lights, and high-energy visuals.",
  songs: [{
    title: "Avicii - Levels",
    note: "Classic EDM music video.",
    video: "https://www.youtube.com/embed/_ovdm2yX4MA"
  }, {
    title: "Calvin Harris - Summer",
    note: "EDM with bright summer visuals.",
    video: "https://www.youtube.com/embed/ebXbLfLACGM"
  }]
}, {
  name: "Afro / Latin",
  color: "#80ed99",
  angle: Math.PI / 3 * 5,
  description: "Rhythmic music styles with dance, culture, and colorful visuals.",
  songs: [{
    title: "Rema - Calm Down",
    note: "Afrobeats with colorful visuals.",
    video: "https://www.youtube.com/embed/WcIcVapfqXw"
  }, {
    title: "J Balvin - Mi Gente",
    note: "Latin music with bright visual style.",
    video: "https://www.youtube.com/embed/wnJ6LuUFpMo"
  }]
}]; // ===============================
// CREATE MUSIC WORLD
// ===============================

exports.musicWorldData = musicWorldData;

function createMusicWorld(scene, createFloatingText, position) {
  var musicWorldGroup = new THREE.Group();
  musicWorldGroup.position.set(position.x, 0, position.z);
  var ground = new THREE.Mesh(new THREE.CircleGeometry(position.radius, 80), new THREE.MeshStandardMaterial({
    color: "#1a0f24",
    roughness: 0.8
  }));
  ground.rotation.x = -Math.PI / 2;
  musicWorldGroup.add(ground);
  var road = new THREE.Mesh(new THREE.RingGeometry(16, 21, 100), new THREE.MeshStandardMaterial({
    color: "#0d0714",
    roughness: 0.7
  }));
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.03;
  musicWorldGroup.add(road);
  var sign = createFloatingText("MUSIC WORLD", "#ff8ee8");
  sign.position.set(-8, 9, 0);
  musicWorldGroup.add(sign);
  var musicStations = [];
  musicWorldData.forEach(function (genre) {
    var radius = 31;
    var x = Math.cos(genre.angle) * radius;
    var z = Math.sin(genre.angle) * radius;
    var station = createMusicStage(genre, x, z, createFloatingText);
    musicStations.push({
      group: station.group,
      genre: genre,
      trigger: new THREE.Vector3(x + position.x, 0, z + position.z)
    });
    musicWorldGroup.add(station.group);
  });
  addMusicDecorations(musicWorldGroup);
  scene.add(musicWorldGroup);
  return {
    musicWorldGroup: musicWorldGroup,
    musicStations: musicStations
  };
} // ===============================
// MUSIC STAGE
// ===============================


function createMusicStage(genre, x, z, createFloatingText) {
  var group = new THREE.Group();
  group.position.set(x, 0, z);
  group.lookAt(0, 0, 0);
  var stage = new THREE.Mesh(new THREE.BoxGeometry(9, 0.6, 5), new THREE.MeshStandardMaterial({
    color: "#111111"
  }));
  stage.position.y = 0.3;
  group.add(stage);
  var screen = new THREE.Mesh(new THREE.BoxGeometry(7, 3.5, 0.35), new THREE.MeshStandardMaterial({
    color: genre.color,
    emissive: genre.color,
    emissiveIntensity: 0.5
  }));
  screen.position.set(0, 3, -2);
  group.add(screen);
  var speakerLeft = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.2, 0.8), new THREE.MeshStandardMaterial({
    color: "#050505"
  }));
  speakerLeft.position.set(-4, 1.4, -1.8);
  group.add(speakerLeft);
  var speakerRight = speakerLeft.clone();
  speakerRight.position.x = 4;
  group.add(speakerRight);
  var sign = createFloatingText(genre.name, genre.color);
  sign.position.set(-3.2, 5.6, -2.1);
  group.add(sign);
  return {
    group: group
  };
} // ===============================
// MUSIC DECORATION
// ===============================


function addMusicDecorations(group) {
  for (var i = 0; i < 18; i++) {
    var angle = Math.random() * Math.PI * 2;
    var radius = 38 + Math.random() * 10;
    var barHeight = 1 + Math.random() * 7;
    var equalizerBar = new THREE.Mesh(new THREE.BoxGeometry(0.9, barHeight, 0.9), new THREE.MeshStandardMaterial({
      color: "#ff8ee8",
      emissive: "#ff8ee8",
      emissiveIntensity: 0.35
    }));
    equalizerBar.position.set(Math.cos(angle) * radius, barHeight / 2, Math.sin(angle) * radius);
    group.add(equalizerBar);
  }
}
//# sourceMappingURL=musicworld.dev.js.map
