import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";

// ===============================
// ACTIVE GAME MONITOR VIDEO
// ===============================

// These variables remember the CSS scene and the game world position.
// They allow the monitor video to be created only when the car is near a station.
let savedCssScene = null;
let savedWorldPosition = null;

// This object remembers where each game station is.
const savedScreenStations = {};

// These remember the video that is currently active.
let activeScreenGroup = null;
let activeScreenGenreName = null;

// ===============================
// GAME WORLD DATA
// ===============================

export const gameWorldData = [
  {
    name: "PlayStation",
    color: "#3b82f6",
    angle: 0,
    description: "Console games known for cinematic single-player stories, exclusives, and action adventures.",
    screenTrailer: "https://www.youtube.com/embed/EE-4GvjKcfs",
    games: [
      {
        title: "God of War Ragnarök",
        note: "Cinematic action-adventure with mythology.",
        trailer: "https://www.youtube.com/embed/EE-4GvjKcfs"
      },
      {
        title: "Spider-Man 2",
        note: "Superhero action game with fast movement.",
        trailer: "https://www.youtube.com/embed/qIQ3xNqkVC4"
      }
    ]
  },
  {
    name: "Xbox",
    color: "#22c55e",
    angle: Math.PI / 3,
    description: "Console gaming focused on action, racing, shooters, and Game Pass-style discovery.",
    screenTrailer: "https://www.youtube.com/embed/FYH9n37B7Yw",
    games: [
      {
        title: "Forza Horizon 5",
        note: "Open-world racing with cars and festivals.",
        trailer: "https://www.youtube.com/embed/FYH9n37B7Yw"
      },
      {
        title: "Halo Infinite",
        note: "Sci-fi shooter with classic Xbox identity.",
        trailer: "https://www.youtube.com/embed/PyMlV5_HRWk"
      }
    ]
  },
  {
    name: "PC / Steam",
    color: "#60a5fa",
    angle: (Math.PI / 3) * 2,
    description: "PC gaming with Steam, mods, indie games, high performance, and many genres.",
    screenTrailer: "https://www.youtube.com/embed/1T22wNvoNiU",
    games: [
      {
        title: "Baldur's Gate 3",
        note: "Fantasy RPG with deep choices.",
        trailer: "https://www.youtube.com/embed/1T22wNvoNiU"
      },
      {
        title: "Counter-Strike 2",
        note: "Competitive PC shooter.",
        trailer: "https://www.youtube.com/embed/c80dVYcL69E"
      }
    ]
  },
  {
    name: "Racing",
    color: "#facc15",
    angle: Math.PI,
    description: "Fast car games focused on driving, speed, tracks, and open-world racing.",
    screenTrailer: "https://www.youtube.com/embed/1tBUsXIkG1A",
    games: [
      {
        title: "Gran Turismo 7",
        note: "Realistic racing for car fans.",
        trailer: "https://www.youtube.com/embed/1tBUsXIkG1A"
      },
      {
        title: "Need for Speed Unbound",
        note: "Arcade street racing with style.",
        trailer: "https://www.youtube.com/embed/H2Y8XCe7F9E"
      }
    ]
  },
  {
    name: "Horror Games",
    color: "#c084fc",
    angle: (Math.PI / 3) * 4,
    description: "Scary games focused on tension, survival, darkness, and atmosphere.",
    screenTrailer: "https://www.youtube.com/embed/E69tKrfEQag",
    games: [
      {
        title: "Resident Evil 4 Remake",
        note: "Action horror with survival gameplay.",
        trailer: "https://www.youtube.com/embed/E69tKrfEQag"
      },
      {
        title: "Alan Wake 2",
        note: "Psychological horror with cinematic style.",
        trailer: "https://www.youtube.com/embed/dlQ3FeNu5Yw"
      }
    ]
  },
  {
    name: "Cozy / Indie",
    color: "#80ed99",
    angle: (Math.PI / 3) * 5,
    description: "Smaller, creative games with relaxing, emotional, or unique gameplay ideas.",
    screenTrailer: "https://www.youtube.com/embed/ot7uXNQskhs",
    games: [
      {
        title: "Stardew Valley",
        note: "Relaxing farming and life sim.",
        trailer: "https://www.youtube.com/embed/ot7uXNQskhs"
      },
      {
        title: "Hades",
        note: "Indie action game with mythology.",
        trailer: "https://www.youtube.com/embed/mD8x5xLHRho"
      }
    ]
  }
];

// ===============================
// CREATE GAME WORLD
// ===============================

export function createGameWorld(scene, cssScene, createFloatingText, position) {
  // Save these so the monitor video can be created later.
  savedCssScene = cssScene;
  savedWorldPosition = position;

  const gameWorldGroup = new THREE.Group();
  gameWorldGroup.position.set(position.x, 0, position.z);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(position.radius, 80),
    new THREE.MeshStandardMaterial({
      color: "#07140e",
      roughness: 0.8
    })
  );
  ground.rotation.x = -Math.PI / 2;
  gameWorldGroup.add(ground);

  const road = new THREE.Mesh(
    new THREE.RingGeometry(16, 21, 100),
    new THREE.MeshStandardMaterial({
      color: "#06100a",
      roughness: 0.7
    })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.03;
  gameWorldGroup.add(road);

  const sign = createFloatingText("GAME WORLD", "#80ed99");
  sign.position.set(-8, 9, 0);
  gameWorldGroup.add(sign);

  const gameStations = [];

  gameWorldData.forEach((genre) => {
    const radius = 31;
    const x = Math.cos(genre.angle) * radius;
    const z = Math.sin(genre.angle) * radius;

    const station = createGameStation(genre, x, z, createFloatingText);

    gameStations.push({
      group: station.group,
      genre,
      trigger: new THREE.Vector3(x + position.x, 0, z + position.z)
    });

    gameWorldGroup.add(station.group);

    // Save the station position.
    // The video is NOT created here anymore.
    // This keeps the project much faster.
    savedScreenStations[genre.name] = {
      x,
      z,
      genre
    };
  });

  addGameDecorations(gameWorldGroup);

  scene.add(gameWorldGroup);

  return {
    gameWorldGroup,
    gameStations
  };
}

// ===============================
// CREATE GAME STATION
// ===============================

function createGameStation(genre, x, z, createFloatingText) {
  const group = new THREE.Group();

  group.position.set(x, 0, z);

  // Make the station face the center of Game World.
  group.lookAt(0, 0, 0);

  // Main platform
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.5, 6),
    new THREE.MeshStandardMaterial({
      color: "#101010",
      roughness: 0.7
    })
  );
  base.position.y = 0.25;
  group.add(base);

  // Glowing platform detail
  const glowBase = new THREE.Mesh(
    new THREE.BoxGeometry(9.4, 0.08, 5.4),
    new THREE.MeshStandardMaterial({
      color: genre.color,
      emissive: genre.color,
      emissiveIntensity: 0.7
    })
  );
  glowBase.position.y = 0.55;
  group.add(glowBase);

  // 3D monitor model
  addMonitorModel(group, genre);

  // Small console box
  const consoleBox = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.45, 1.2),
    new THREE.MeshStandardMaterial({
      color: "#111111",
      roughness: 0.6
    })
  );
  consoleBox.position.set(2.7, 0.9, 1.1);
  group.add(consoleBox);

  // Game controller
  const controller = createControllerShape(genre.color);
  controller.position.set(0, 0.85, 1.1);
  group.add(controller);

  // Floating genre name
  const sign = createFloatingText(genre.name, genre.color);
  sign.position.set(-3.2, 5.9, -2.1);
  group.add(sign);

  return {
    group
  };
}

// ===============================
// ADD 3D MONITOR MODEL
// ===============================

function addMonitorModel(group, genre) {
  const loader = new GLTFLoader();

  const monitorHolder = new THREE.Group();

  // ===============================
  // EASY MONITOR MODEL SETTINGS
  // ===============================

  // x = left/right
  // y = up/down
  // z = forward/back
  monitorHolder.position.set(0, 0.7, -1.7);

  // Change this if the monitor faces the wrong way.
  monitorHolder.rotation.y = 0;

  group.add(monitorHolder);

  loader.load(
    "models/ultrawide_monitor.glb",

    function (gltf) {
      const monitor = gltf.scene;

      centerModel(monitor);

      // Change this if the monitor is too big or small.
      monitor.scale.set(1.0, 1.0, 1.0);

      monitor.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      monitorHolder.add(monitor);

      console.log(`${genre.name} monitor loaded.`);
    },

    function () {
      console.log(`${genre.name} monitor is loading...`);
    },

    function (error) {
      console.log(`${genre.name} monitor could not load. Backup monitor added.`, error);

      const backupMonitor = createBackupMonitor(genre.color);
      monitorHolder.add(backupMonitor);
    }
  );
}

// ===============================
// BACKUP MONITOR
// ===============================

function createBackupMonitor(color) {
  const backup = new THREE.Group();

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 3.4, 0.35),
    new THREE.MeshStandardMaterial({
      color: "#050505",
      roughness: 0.5
    })
  );
  frame.position.set(0, 2.5, 0);
  backup.add(frame);

  const stand = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 1.5, 0.35),
    new THREE.MeshStandardMaterial({
      color: "#050505",
      roughness: 0.5
    })
  );
  stand.position.set(0, 1, 0);
  backup.add(stand);

  const foot = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.25, 1.2),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.4
    })
  );
  foot.position.set(0, 0.2, 0.1);
  backup.add(foot);

  return backup;
}

// ===============================
// UPDATE ACTIVE MONITOR VIDEO
// ===============================

export function updateGameMonitorVideo(genre) {
  if (!savedCssScene || !savedWorldPosition) return;
  if (!genre) return;

  // If the correct video is already playing, do nothing.
  if (activeScreenGenreName === genre.name) return;

  // Remove the old video first.
  clearGameMonitorVideo();

  const stationData = savedScreenStations[genre.name];

  if (!stationData) return;

  activeScreenGroup = createMonitorIframeScreen(
    genre,
    stationData.x,
    stationData.z,
    savedWorldPosition
  );

  savedCssScene.add(activeScreenGroup);
  activeScreenGenreName = genre.name;
}

// ===============================
// CLEAR ACTIVE MONITOR VIDEO
// ===============================

export function clearGameMonitorVideo() {
  if (!activeScreenGroup || !savedCssScene) return;

  activeScreenGroup.traverse((child) => {
    if (child.element && child.element.tagName === "IFRAME") {
      child.element.src = "";
      child.element.remove();
    }
  });

  savedCssScene.remove(activeScreenGroup);

  activeScreenGroup = null;
  activeScreenGenreName = null;
}

// ===============================
// CREATE YOUTUBE IFRAME SCREEN
// ===============================

function createMonitorIframeScreen(genre, x, z, worldPosition) {
  const iframe = document.createElement("iframe");

  iframe.src = makeYoutubeScreenUrl(genre.screenTrailer);
  iframe.width = "640";
  iframe.height = "300";
  iframe.allow = "autoplay; encrypted-media; picture-in-picture";
  iframe.className = "gameMonitorIframe";

  iframe.style.border = "0";
  iframe.style.borderRadius = "14px";
  iframe.style.background = "black";
  iframe.style.pointerEvents = "none";

  const screenObject = new CSS3DObject(iframe);

  // ===============================
  // EASY VIDEO SCREEN SETTINGS
  // ===============================

  // Change this to make the video wider/narrower.
  const screenWidth = 10;

  // Change this to make the video taller/shorter.
  const screenHeight = 4.7;

  // Change these to move the video on the monitor.
  // x = left/right
  // y = up/down
  // z = forward/back
  const screenX = -0.10;
  const screenY = 4.42;
  const screenZ = -0.75;

  // This scales the HTML iframe into the 3D world size.
  screenObject.scale.set(screenWidth / 640, screenHeight / 300, 1);

  const cssStationGroup = new THREE.Group();

  cssStationGroup.position.set(
    worldPosition.x + x,
    0,
    worldPosition.z + z
  );

  // Make the video face the center of Game World.
  cssStationGroup.lookAt(worldPosition.x, 0, worldPosition.z);

  screenObject.position.set(screenX, screenY, screenZ);

  // Change this to Math.PI if the video appears backwards.
  screenObject.rotation.y = 0;

  cssStationGroup.add(screenObject);

  return cssStationGroup;
}

// ===============================
// MAKE YOUTUBE AUTOPLAY URL
// ===============================

function makeYoutubeScreenUrl(url) {
  return `${url}?autoplay=1&mute=0&controls=0&rel=0&modestbranding=1&playsinline=1`;
}

// ===============================
// CENTER MODEL HELPER
// ===============================

function centerModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = new THREE.Vector3();

  box.getCenter(center);

  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= box.min.y;
}

// ===============================
// CONTROLLER SHAPE
// ===============================

function createControllerShape(color) {
  const controller = new THREE.Group();

  const middle = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.25, 0.65),
    new THREE.MeshStandardMaterial({
      color: "#050505"
    })
  );
  controller.add(middle);

  const leftGrip = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 16),
    new THREE.MeshStandardMaterial({
      color: "#050505"
    })
  );
  leftGrip.scale.set(1, 0.55, 0.8);
  leftGrip.position.set(-0.8, 0, 0);
  controller.add(leftGrip);

  const rightGrip = leftGrip.clone();
  rightGrip.position.x = 0.8;
  controller.add(rightGrip);

  const button = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 12),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.8
    })
  );
  button.position.set(0.45, 0.18, -0.15);
  controller.add(button);

  return controller;
}

// ===============================
// GAME DECORATIONS
// ===============================

function addGameDecorations(group) {
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 38 + Math.random() * 10;

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.MeshStandardMaterial({
        color: "#80ed99",
        emissive: "#80ed99",
        emissiveIntensity: 0.25
      })
    );

    cube.position.set(
      Math.cos(angle) * radius,
      0.75,
      Math.sin(angle) * radius
    );

    cube.rotation.y = Math.random() * Math.PI * 2;

    group.add(cube);
  }
}