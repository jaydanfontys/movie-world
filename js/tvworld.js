import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";

// ===============================
// MODEL PATHS
// ===============================

const TV_MODEL_PATH = "models/tv_screen.glb";
const REMOTE_MODEL_PATH = "models/90s_tv_remote.glb";
const COUCH_MODEL_PATH = "models/outdoor_couch.glb";

// ===============================
// MODEL SETTINGS
// ===============================

// Change these if the models are too big or too small.
const TV_MODEL_SCALE = new THREE.Vector3(0.15, 0.15, 0.15);
const COUCH_MODEL_SCALE = new THREE.Vector3(0.9, 0.9, 0.9);
const REMOTE_MODEL_SCALE = new THREE.Vector3(5, 5, 5);

// TV model position inside each TV station.
const TV_MODEL_POSITION = new THREE.Vector3(0, -13 -2);

// Couch position in front of each TV.
const COUCH_MODEL_POSITION = new THREE.Vector3(0, 0, 3.2);

// Floating remote position in the middle of TV World.
const REMOTE_MODEL_POSITION = new THREE.Vector3(0, 5, 0);

// Change this if the remote faces the wrong direction.
const REMOTE_MODEL_ROTATION = new THREE.Vector3(0, 0, 0);

// ===============================
// YOUTUBE SCREEN SETTINGS
// ===============================

// This controls where the YouTube screen appears on the TV model.
// x = left/right
// y = up/down
// z = forward/back
const TV_YOUTUBE_SCREEN_POSITION = new THREE.Vector3(0, 3, 0.75);
// Bigger/smaller YouTube iframe screen.
const TV_YOUTUBE_SCREEN_WIDTH = 8.5;
const TV_YOUTUBE_SCREEN_HEIGHT = 4.5;

// ===============================
// MODEL CACHE
// ===============================

let tvModelPromise = null;
let remoteModelPromise = null;
let couchModelPromise = null;

// ===============================
// CSS3D VIDEO SCREEN MEMORY
// ===============================

let savedCssScene = null;
let savedWorldPosition = null;
const savedTVStations = {};

let activeTVScreenGroup = null;
let activeTVGenreName = null;

// ===============================
// FLOATING REMOTE ANIMATION
// ===============================

let remoteHolder = null;
let remoteAnimationStarted = false;

// ===============================
// TV SHOW WORLD DATA
// ===============================

export const tvShowData = [
  {
    name: "Crime / Mystery",
    color: "#7cc7ff",
    angle: 0,
    description: "TV shows about investigations, secrets, detectives, and solving crimes.",
    shows: [
      {
        title: "Sherlock",
        note: "A modern detective series with smart mystery stories.",
        trailer: "https://www.youtube.com/embed/xK7S9mrFWL4"
      },
      {
        title: "True Detective",
        note: "Dark crime drama with serious mystery and atmosphere.",
        trailer: "https://www.youtube.com/embed/fVQUcaO4AvE"
      }
    ]
  },
  {
    name: "Sitcom",
    color: "#ffd166",
    angle: Math.PI / 3,
    description: "Funny comfort shows based on characters, jokes, and everyday situations.",
    shows: [
      {
        title: "Brooklyn Nine-Nine",
        note: "A comedy series about detectives working in a police precinct.",
        trailer: "https://www.youtube.com/embed/sEOuJ4z5aTc"
      },
      {
        title: "The Office",
        note: "Workplace comedy with awkward and funny situations.",
        trailer: "https://www.youtube.com/embed/LHOtME2DL4g"
      }
    ]
  },
  {
    name: "Drama",
    color: "#ff8fab",
    angle: (Math.PI / 3) * 2,
    description: "Emotional shows with strong characters, conflict, and serious storytelling.",
    shows: [
      {
        title: "Breaking Bad",
        note: "Crime drama about choices, power, and transformation.",
        trailer: "https://www.youtube.com/embed/HhesaQXLuRY"
      },
      {
        title: "The Bear",
        note: "Fast, stressful, emotional drama inside a restaurant kitchen.",
        trailer: "https://www.youtube.com/embed/gBmkI4jlaIo"
      }
    ]
  },
  {
    name: "Fantasy",
    color: "#c77dff",
    angle: Math.PI,
    description: "Shows with magical worlds, kingdoms, creatures, and supernatural stories.",
    shows: [
      {
        title: "Game of Thrones",
        note: "Fantasy drama with kingdoms, war, and politics.",
        trailer: "https://www.youtube.com/embed/KPLWWIOCOOQ"
      },
      {
        title: "The Witcher",
        note: "Fantasy adventure with monsters, magic, and destiny.",
        trailer: "https://www.youtube.com/embed/ndl1W4ltcmg"
      }
    ]
  },
  {
    name: "Reality TV",
    color: "#80ed99",
    angle: (Math.PI / 3) * 4,
    description: "Shows based on real people, competition, lifestyle, and unscripted moments.",
    shows: [
      {
        title: "The Circle",
        note: "Social media competition show with strategy and fake profiles.",
        trailer: "https://www.youtube.com/embed/wJIfC00Vt3Y"
      },
      {
        title: "MasterChef",
        note: "Cooking competition show with pressure and creativity.",
        trailer: "https://www.youtube.com/embed/Kv2dSj-Q9yM"
      }
    ]
  },
  {
    name: "Documentary",
    color: "#ffffff",
    angle: (Math.PI / 3) * 5,
    description: "Real stories about people, nature, history, crime, sports, and culture.",
    shows: [
      {
        title: "Our Planet",
        note: "Nature documentary series with beautiful visuals.",
        trailer: "https://www.youtube.com/embed/aETNYyrqNYE"
      },
      {
        title: "Formula 1: Drive to Survive",
        note: "Sports documentary about Formula 1 teams and drivers.",
        trailer: "https://www.youtube.com/embed/wtJPe1ksS6E"
      }
    ]
  }
];

// ===============================
// CREATE TV SHOW WORLD
// ===============================

export function createTVWorld(scene, cssScene, createFloatingText, position) {
  savedCssScene = cssScene;
  savedWorldPosition = position;

  const tvWorldGroup = new THREE.Group();
  tvWorldGroup.position.set(position.x, 0, position.z);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(position.radius, 80),
    new THREE.MeshStandardMaterial({
      color: "#10182b",
      roughness: 0.8
    })
  );
  ground.rotation.x = -Math.PI / 2;
  tvWorldGroup.add(ground);

  const road = new THREE.Mesh(
    new THREE.RingGeometry(16, 21, 100),
    new THREE.MeshStandardMaterial({
      color: "#0b0b12",
      roughness: 0.7
    })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.03;
  tvWorldGroup.add(road);

  const sign = createFloatingText("TV SHOW WORLD", "#7cc7ff");
  sign.position.set(-8, 9, 0);
  tvWorldGroup.add(sign);

  // Floating remote in the middle of TV World.
  addFloatingRemote(tvWorldGroup);

  const tvTheaters = [];

  tvShowData.forEach((genre) => {
    const radius = 31;
    const x = Math.cos(genre.angle) * radius;
    const z = Math.sin(genre.angle) * radius;

    const station = createTVTheater(genre, x, z, createFloatingText);

    savedTVStations[genre.name] = {
      x,
      z,
      genre
    };

    tvTheaters.push({
      group: station.group,
      genre,
      trigger: new THREE.Vector3(x + position.x, 0, z + position.z)
    });

    tvWorldGroup.add(station.group);
  });

  addTVDecorations(tvWorldGroup);
  startRemoteAnimation();

  scene.add(tvWorldGroup);

  return {
    tvWorldGroup,
    tvTheaters
  };
}

// ===============================
// CREATE TV STATION
// ===============================

function createTVTheater(genre, x, z, createFloatingText) {
  const group = new THREE.Group();

  group.position.set(x, 0, z);
  group.lookAt(0, 0, 0);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(5.5, 5.5, 0.45, 40),
    new THREE.MeshStandardMaterial({
      color: "#101010",
      roughness: 0.7
    })
  );
  base.position.y = 0.22;
  group.add(base);

  const glowPlatform = new THREE.Mesh(
    new THREE.CircleGeometry(5.7, 40),
    new THREE.MeshStandardMaterial({
      color: genre.color,
      emissive: genre.color,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.18
    })
  );
  glowPlatform.rotation.x = -Math.PI / 2;
  glowPlatform.position.y = 0.05;
  group.add(glowPlatform);

  addTVModel(group, genre);
  addCouchModel(group, genre);

  const sign = createFloatingText(genre.name, genre.color);
  sign.position.set(-3.4, 5.9, -2.1);
  group.add(sign);

  return {
    group
  };
}

// ===============================
// ADD 3D TV MODEL
// ===============================

function addTVModel(group, genre) {
  const tvHolder = new THREE.Group();

  tvHolder.position.copy(TV_MODEL_POSITION);

  group.add(tvHolder);

  loadTVModel()
    .then((gltf) => {
      const tv = gltf.scene.clone(true);

      centerModel(tv);
      tv.scale.copy(TV_MODEL_SCALE);

      tv.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });

      tvHolder.add(tv);

      console.log(`${genre.name} TV model loaded.`);
    })
    .catch((error) => {
      console.log(`${genre.name} TV model could not load. Backup TV added.`, error);

      const backupTV = createBackupTV(genre.color);
      tvHolder.add(backupTV);
    });
}

// ===============================
// ADD COUCH MODEL
// ===============================

function addCouchModel(group, genre) {
  const couchHolder = new THREE.Group();

  couchHolder.position.copy(COUCH_MODEL_POSITION);
  couchHolder.rotation.y = Math.PI;

  group.add(couchHolder);

  loadCouchModel()
    .then((gltf) => {
      const couch = gltf.scene.clone(true);

      centerModel(couch);
      couch.scale.copy(COUCH_MODEL_SCALE);

      couch.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });

      couchHolder.add(couch);

      console.log(`${genre.name} couch loaded.`);
    })
    .catch((error) => {
      console.log(`${genre.name} couch model could not load. Backup couch added.`, error);

      const backupCouch = createBackupCouch();
      couchHolder.add(backupCouch);
    });
}

// ===============================
// ADD FLOATING REMOTE
// ===============================

function addFloatingRemote(group) {
  remoteHolder = new THREE.Group();

  remoteHolder.position.copy(REMOTE_MODEL_POSITION);
  remoteHolder.rotation.set(
    REMOTE_MODEL_ROTATION.x,
    REMOTE_MODEL_ROTATION.y,
    REMOTE_MODEL_ROTATION.z
  );

  group.add(remoteHolder);

  loadRemoteModel()
    .then((gltf) => {
      const remote = gltf.scene.clone(true);

      centerModel(remote);
      remote.scale.copy(REMOTE_MODEL_SCALE);

      remote.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });

      remoteHolder.add(remote);

      console.log("Floating remote loaded.");
    })
    .catch((error) => {
      console.log("Remote model could not load. Backup remote added.", error);

      const backupRemote = createBackupRemote();
      remoteHolder.add(backupRemote);
    });
}

// ===============================
// TV SCREEN VIDEO FUNCTIONS
// ===============================

export function updateTVScreenVideo(genre) {
  if (!savedCssScene || !savedWorldPosition) return;
  if (!genre) return;

  if (activeTVGenreName === genre.name) return;

  clearTVScreenVideo();

  const stationData = savedTVStations[genre.name];

  if (!stationData) return;

  activeTVScreenGroup = createTVIframeScreen(
    genre,
    stationData.x,
    stationData.z,
    savedWorldPosition
  );

  savedCssScene.add(activeTVScreenGroup);
  activeTVGenreName = genre.name;
}

export function clearTVScreenVideo() {
  if (!activeTVScreenGroup || !savedCssScene) return;

  activeTVScreenGroup.traverse((child) => {
    if (child.element && child.element.tagName === "IFRAME") {
      child.element.src = "";
      child.element.remove();
    }
  });

  savedCssScene.remove(activeTVScreenGroup);

  activeTVScreenGroup = null;
  activeTVGenreName = null;
}

function createTVIframeScreen(genre, x, z, worldPosition) {
  const iframe = document.createElement("iframe");

  iframe.src = makeYoutubeScreenUrl(genre.shows[0].trailer);
  iframe.width = "640";
  iframe.height = "360";
  iframe.allow = "autoplay; encrypted-media; picture-in-picture";
  iframe.className = "tvWorldIframe";

  iframe.style.border = "0";
  iframe.style.borderRadius = "12px";
  iframe.style.background = "black";
  iframe.style.pointerEvents = "none";

  const screenObject = new CSS3DObject(iframe);

  screenObject.scale.set(
    TV_YOUTUBE_SCREEN_WIDTH / 640,
    TV_YOUTUBE_SCREEN_HEIGHT / 360,
    1
  );

  const cssStationGroup = new THREE.Group();

  cssStationGroup.position.set(
    worldPosition.x + x,
    0,
    worldPosition.z + z
  );

  cssStationGroup.lookAt(worldPosition.x, 0, worldPosition.z);

  screenObject.position.copy(TV_YOUTUBE_SCREEN_POSITION);
  screenObject.rotation.y = 0;

  cssStationGroup.add(screenObject);

  return cssStationGroup;
}

function makeYoutubeScreenUrl(url) {
  return `${url}?autoplay=1&mute=0&controls=0&rel=0&modestbranding=1&playsinline=1`;
}

// ===============================
// LOAD MODELS ONCE
// ===============================

function loadTVModel() {
  if (tvModelPromise) return tvModelPromise;

  const loader = new GLTFLoader();

  tvModelPromise = new Promise((resolve, reject) => {
    loader.load(
      TV_MODEL_PATH,
      (gltf) => resolve(gltf),
      undefined,
      (error) => reject(error)
    );
  });

  return tvModelPromise;
}

function loadRemoteModel() {
  if (remoteModelPromise) return remoteModelPromise;

  const loader = new GLTFLoader();

  remoteModelPromise = new Promise((resolve, reject) => {
    loader.load(
      REMOTE_MODEL_PATH,
      (gltf) => resolve(gltf),
      undefined,
      (error) => reject(error)
    );
  });

  return remoteModelPromise;
}

function loadCouchModel() {
  if (couchModelPromise) return couchModelPromise;

  const loader = new GLTFLoader();

  couchModelPromise = new Promise((resolve, reject) => {
    loader.load(
      COUCH_MODEL_PATH,
      (gltf) => resolve(gltf),
      undefined,
      (error) => reject(error)
    );
  });

  return couchModelPromise;
}

// ===============================
// REMOTE ANIMATION
// ===============================

function startRemoteAnimation() {
  if (remoteAnimationStarted) return;

  remoteAnimationStarted = true;

  function animateRemote() {
    requestAnimationFrame(animateRemote);

    if (!remoteHolder) return;

    const time = performance.now() * 0.001;

    remoteHolder.position.y =
      REMOTE_MODEL_POSITION.y + Math.sin(time * 1.5) * 0.25;

    remoteHolder.rotation.y += 0.01;
  }

  animateRemote();
}

// ===============================
// BACKUP MODELS
// ===============================

function createBackupTV(color) {
  const tv = new THREE.Group();

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 4.5, 0.5),
    new THREE.MeshStandardMaterial({
      color: "#050505",
      roughness: 0.45
    })
  );
  frame.position.set(0, 3.2, -2);
  tv.add(frame);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(6.6, 3.5),
    new THREE.MeshBasicMaterial({
      color: color
    })
  );
  screen.position.set(0, 3.2, -2.28);
  tv.add(screen);

  const stand = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.5, 0.3),
    new THREE.MeshStandardMaterial({
      color: "#222222"
    })
  );
  stand.position.set(0, 1.2, -2);
  tv.add(stand);

  return tv;
}

function createBackupCouch() {
  const couch = new THREE.Group();

  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(5, 0.7, 1.8),
    new THREE.MeshStandardMaterial({
      color: "#222222",
      roughness: 0.65
    })
  );
  seat.position.y = 0.6;
  couch.add(seat);

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(5, 1.8, 0.5),
    new THREE.MeshStandardMaterial({
      color: "#111111",
      roughness: 0.65
    })
  );
  back.position.set(0, 1.25, -0.75);
  couch.add(back);

  return couch;
}

function createBackupRemote() {
  const remote = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.18, 3),
    new THREE.MeshStandardMaterial({
      color: "#111111",
      roughness: 0.55
    })
  );

  return remote;
}

// ===============================
// TV DECORATION
// ===============================

function addTVDecorations(group) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 38 + Math.random() * 10;
    const towerHeight = 5 + Math.random() * 4;

    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, towerHeight, 1.2),
      new THREE.MeshStandardMaterial({
        color: "#1d2c4a",
        emissive: "#1d2c4a",
        emissiveIntensity: 0.25
      })
    );

    tower.position.set(
      Math.cos(angle) * radius,
      towerHeight / 2,
      Math.sin(angle) * radius
    );

    group.add(tower);
  }
}

// ===============================
// HELPER FUNCTIONS
// ===============================

function centerModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();

  box.getCenter(center);

  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= box.min.y;
}