"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMovieWorld = createMovieWorld;
exports.movieWorldData = void 0;

var THREE = _interopRequireWildcard(require("three"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// ===============================
// MOVIE WORLD DATA
// ===============================
var movieWorldData = [{
  name: "Action",
  color: "#ff3333",
  angle: 0,
  description: "Fast, intense movies with fights, danger, heroes, and big set pieces.",
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

function createMovieWorld(scene, createFloatingText, position) {
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
  movieWorldGroup.add(sign);
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
  var base = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 5), new THREE.MeshStandardMaterial({
    color: "#151515"
  }));
  base.position.y = 0.25;
  group.add(base);
  var screen = new THREE.Mesh(new THREE.BoxGeometry(7, 4, 0.35), new THREE.MeshStandardMaterial({
    color: genre.color,
    emissive: genre.color,
    emissiveIntensity: 0.45
  }));
  screen.position.set(0, 3.2, -2);
  group.add(screen);
  var screenInner = new THREE.Mesh(new THREE.PlaneGeometry(6.1, 3.1), new THREE.MeshBasicMaterial({
    color: "#050505"
  }));
  screenInner.position.set(0, 3.2, -2.19);
  group.add(screenInner);
  var sign = createFloatingText(genre.name, genre.color);
  sign.position.set(-3.2, 5.7, -2.1);
  group.add(sign);
  return {
    group: group
  };
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
}
//# sourceMappingURL=movieworld.dev.js.map
