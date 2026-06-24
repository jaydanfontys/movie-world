import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

// ===============================
// STAGE MODEL SETTINGS
// ===============================

// Defines the 3D stage placement within each music station.
// x = left/right
// y = up/down
// z = forward/back
const STAGE_MODEL_POSITION = new THREE.Vector3(3, 0, 50.2);
const STAGE_MODEL_ROTATION_Y = -8;
const STAGE_MODEL_SCALE = new THREE.Vector3(0.10, 0.07, 0.07);

// ===============================
// TRIGGER / POPUP SETTINGS
// ===============================

// Invisible trigger point used for opening the music popup.
// Positioned near the 3D stage model.
const STAGE_TRIGGER_POSITION = new THREE.Vector3(3, 0, 46);

// Visible marker for the popup activation area.
// This is useful for layout testing.
const STAGE_TRIGGER_VISUAL_RADIUS = 7.5;

// ===============================
// DANCER SETTINGS
// ===============================

// Keep the dancer count low to preserve performance.
// 2 dancers per stage = 12 dancers total.
const DANCERS_PER_STAGE = 2;

// Global scale factor for dancer models.
const DANCER_SCALE = 0.02;

// Disable animation if performance is an issue.
// true = animated dancers
// false = static dancers
const ENABLE_DANCER_ANIMATION = false;

// These are the dancing models in your models folder.
const DANCER_MODEL_PATHS = [
  "models/belly_dance.glb",
  "models/manuel_animated_001_-_3d_dancing_man.glb",
  "models/riverdance_dance_free_animation.glb",
  "models/spider_man_dancing.glb"
];

// Cache loaded dancer models to avoid repeated GLTF loads.
const dancerModelCache = {};
const dancerMixers = [];

// ===============================
// 3D SPEAKER MODEL SETTINGS
// ===============================

const SPEAKER_MODEL_PATH = "models/doof_wagon_speakers.glb";

// Speaker model scale; adjust this if size is incorrect.
// Try 0.05, 0.06, 0.08, or 0.1.
const SPEAKER_MODEL_SCALE = new THREE.Vector3(0.06, 0.06, 0.06);

// Speaker positions around each stage.
// x = left/right
// y = up/down
// z = forward/back
const SPEAKER_POSITIONS = [
  {
    position: new THREE.Vector3(STAGE_MODEL_POSITION.x - 7, 0, STAGE_MODEL_POSITION.z - 3),
    rotationY: STAGE_MODEL_ROTATION_Y
  },
  {
    position: new THREE.Vector3(STAGE_MODEL_POSITION.x + 7, 0, STAGE_MODEL_POSITION.z - 3),
    rotationY: STAGE_MODEL_ROTATION_Y
  },
  {
    position: new THREE.Vector3(STAGE_MODEL_POSITION.x - 6, 0, STAGE_MODEL_POSITION.z + 4),
    rotationY: STAGE_MODEL_ROTATION_Y
  },
  {
    position: new THREE.Vector3(STAGE_MODEL_POSITION.x + 6, 0, STAGE_MODEL_POSITION.z + 4),
    rotationY: STAGE_MODEL_ROTATION_Y
  }
];

let speakerModelPromise = null;

// ===============================
// YOUTUBE MUSIC VIDEO HELPERS
// ===============================

function makeYouTubeAutoplayUrl(url) {
  return `${url}?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1`;
}

export function updateMusicStageAudio(genre) {
  if (!genre) return;

  console.log(`${genre.name} stage reached. YouTube video should play in the popup.`);
}

export function clearMusicStageAudio() {
  // No local MP3 playback is active for the music stage.
  // The popup iframe cleanup is handled by three.js when the panel closes.
}

// Called from the main three.js animation loop.
// Updates dancer animation mixers.
export function updateMusicDancers(deltaTime) {
  if (!ENABLE_DANCER_ANIMATION) return;

  dancerMixers.forEach((mixer) => {
    mixer.update(deltaTime);
  });
}

// ===============================
// MUSIC WORLD DATA
// ===============================

export const musicWorldData = [
  {
    name: "Pop",
    color: "#ff8ee8",
    angle: 0,
    description: "Popular music with catchy melodies, strong visuals, and music videos.",
    spotifyStyle: "Dance-pop / electronic pop stage energy.",
    songs: [
      {
        title: "Dance Pop Stage",
        note: "Copyright-free dance-pop style video for the Pop stage.",
        video: makeYouTubeAutoplayUrl("https://www.youtube.com/embed/Oq_K2wZPP8Y")
      },
      {
        title: "Electronic Pop Stage",
        note: "Bright pop-style electronic music.",
        video: makeYouTubeAutoplayUrl("https://www.youtube.com/embed/q1ULJ92aldE")
      }
    ]
  },
  {
    name: "Hip-Hop",
    color: "#ffd166",
    angle: Math.PI / 3,
    description: "Music focused on rhythm, flow, lyrics, and strong visual identity.",
    spotifyStyle: "Hip-hop / pluggnb / bass-heavy stage energy.",
    songs: [
      {
        title: "Hip-Hop Style Stage",
        note: "Copyright-free hip-hop style energy.",
        video: makeYouTubeAutoplayUrl("https://www.youtube.com/embed/S-9R6RiIQjI")
      },
      {
        title: "Trap Mix Stage",
        note: "Trap-style music for a stronger stage feeling.",
        video: makeYouTubeAutoplayUrl("https://www.youtube.com/embed/dRz991Yzouw")
      }
    ]
  },
  {
    name: "Rock",
    color: "#ff4d4d",
    angle: (Math.PI / 3) * 2,
    description: "Band-based music with guitars, drums, energy, and stage performance.",
    spotifyStyle: "Alternative rock / guitar stage energy.",
    songs: [
      {
        title: "Alternative Rock Stage",
        note: "Copyright-free rock-style track.",
        video: makeYouTubeAutoplayUrl("https://www.youtube.com/embed/mxlqzyj_1Lo")
      },
      {
        title: "Rock Guitar Mix Stage",
        note: "Guitar-based rock and metal style mix.",
        video: makeYouTubeAutoplayUrl("https://www.youtube.com/embed/gwLkxH_iIWQ")
      }
    ]
  },
  {
    name: "R&B",
    color: "#c77dff",
    angle: Math.PI,
    description: "Smooth vocals, emotional stories, and stylish music videos.",
    spotifyStyle: "Smooth late-night R&B / chill stage atmosphere.",
    songs: [
      {
        title: "R&B Chill Stage",
        note: "Smooth copyright-free R&B-style music.",
        video: makeYouTubeAutoplayUrl("https://www.youtube.com/embed/E0XHakWbRJk")
      },
      {
        title: "Soulful Chill Stage",
        note: "Chill smooth stage atmosphere.",
        video: makeYouTubeAutoplayUrl("https://www.youtube.com/embed/11iCosVTrlQ")
      }
    ]
  },
  {
    name: "EDM",
    color: "#4cc9f0",
    angle: (Math.PI / 3) * 4,
    description: "Electronic music with festivals, lights, and high-energy visuals.",
    spotifyStyle: "Festival EDM / house / future bass stage energy.",
    songs: [
      {
        title: "EDM House Stage",
        note: "High-energy house mix for the EDM stage.",
        video: makeYouTubeAutoplayUrl("https://www.youtube.com/embed/BLO6LRPMUp8")
      },
      {
        title: "NCS Electronic Stage",
        note: "Electronic festival-style mix.",
        video: makeYouTubeAutoplayUrl("https://www.youtube.com/embed/34iRPHalw68")
      }
    ]
  },
  {
    name: "Afro / Latin",
    color: "#80ed99",
    angle: (Math.PI / 3) * 5,
    description: "Rhythmic music styles with dance, culture, and colorful visuals.",
    spotifyStyle: "Afro / Latin dance stage with warm rhythm.",
    songs: [
      {
        title: "Latin Dance Stage",
        note: "Latin dance copyright-free stage music.",
        video: makeYouTubeAutoplayUrl("https://www.youtube.com/embed/mG8QlUGyQk8")
      },
      {
        title: "Afro / Latin Stage",
        note: "Warm rhythmic dance style.",
        video: makeYouTubeAutoplayUrl("https://www.youtube.com/embed/WuZNhUt0XWM")
      }
    ]
  }
];

// ===============================
// CREATE MUSIC WORLD
// ===============================

export function createMusicWorld(scene, createFloatingText, position) {
  const musicWorldGroup = new THREE.Group();
  musicWorldGroup.position.set(position.x, 0, position.z);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(position.radius, 80),
    new THREE.MeshStandardMaterial({
      color: "#1a0f24",
      roughness: 0.8
    })
  );
  ground.rotation.x = -Math.PI / 2;
  musicWorldGroup.add(ground);

  const road = new THREE.Mesh(
    new THREE.RingGeometry(16, 21, 100),
    new THREE.MeshStandardMaterial({
      color: "#0d0714",
      roughness: 0.7
    })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.03;
  musicWorldGroup.add(road);

  const sign = createFloatingText("MUSIC WORLD", "#ff8ee8");
  sign.position.set(-8, 9, 0);
  musicWorldGroup.add(sign);

  const musicStations = [];

  musicWorldData.forEach((genre) => {
    const radius = 31;
    const x = Math.cos(genre.angle) * radius;
    const z = Math.sin(genre.angle) * radius;

    const station = createMusicStage(genre, x, z, createFloatingText);

    // Add the station first so matrix calculations work.
    musicWorldGroup.add(station.group);

    // Important fix:
    // localToWorld() already accounts for the Music World position.
    // Avoid adding position.x and position.z again or the trigger will be offset incorrectly.
    musicWorldGroup.updateMatrixWorld(true);
    station.group.updateMatrixWorld(true);

    const triggerInFullWorld = station.group.localToWorld(
      STAGE_TRIGGER_POSITION.clone()
    );

    triggerInFullWorld.y = 0;

    musicStations.push({
      group: station.group,
      genre,
      trigger: triggerInFullWorld
    });

    console.log(`${genre.name} music trigger fixed at:`, triggerInFullWorld);
  });

  addMusicDecorations(musicWorldGroup);

  scene.add(musicWorldGroup);

  return {
    musicWorldGroup,
    musicStations
  };
}

// ===============================
// MUSIC STAGE
// ===============================

function createMusicStage(genre, x, z, createFloatingText) {
  const group = new THREE.Group();

  group.position.set(x, 0, z);

  // Make the station face the middle of Music World.
  group.lookAt(0, 0, 0);

  addStageModel(group, genre);
  addSpeakerModels(group, genre);
  addDancersAroundStage(group, genre);
  addTriggerVisual(group, genre.color);

  const glowFloor = new THREE.Mesh(
    new THREE.CircleGeometry(5.6, 48),
    new THREE.MeshStandardMaterial({
      color: genre.color,
      emissive: genre.color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.25
    })
  );
  glowFloor.rotation.x = -Math.PI / 2;
  glowFloor.position.y = 0.05;
  group.add(glowFloor);

  const sign = createFloatingText(genre.name, genre.color);

  // The genre sign is closer to the actual stage model.
  sign.position.set(
    STAGE_MODEL_POSITION.x - 3.5,
    5.8,
    STAGE_MODEL_POSITION.z - 3
  );

  group.add(sign);

  const youtubeText = createFloatingText("YOUTUBE MUSIC STAGE", "#ffffff");

  // This text is near the stage area too.
  youtubeText.position.set(
    STAGE_MODEL_POSITION.x - 4.5,
    4.5,
    STAGE_MODEL_POSITION.z + 2
  );

  youtubeText.scale.set(4.5, 1.2, 1);
  group.add(youtubeText);

  return {
    group
  };
}

// ===============================
// VISIBLE TRIGGER AREA
// ===============================

function addTriggerVisual(group, color) {
  const triggerCircle = new THREE.Mesh(
    new THREE.CircleGeometry(STAGE_TRIGGER_VISUAL_RADIUS, 48),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    })
  );

  triggerCircle.rotation.x = -Math.PI / 2;
  triggerCircle.position.copy(STAGE_TRIGGER_POSITION);
  triggerCircle.position.y = 0.08;

  group.add(triggerCircle);

  const triggerRing = new THREE.Mesh(
    new THREE.TorusGeometry(STAGE_TRIGGER_VISUAL_RADIUS, 0.08, 12, 72),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.75,
      transparent: true,
      opacity: 0.75
    })
  );

  triggerRing.rotation.x = Math.PI / 2;
  triggerRing.position.copy(STAGE_TRIGGER_POSITION);
  triggerRing.position.y = 0.12;

  group.add(triggerRing);
}

// ===============================
// ADD 3D STAGE MODEL
// ===============================

function addStageModel(group, genre) {
  const loader = new GLTFLoader();

  const stageHolder = new THREE.Group();

  // Preserve the existing custom stage position.
  stageHolder.position.copy(STAGE_MODEL_POSITION);

  // Preserve the existing custom stage rotation.
  stageHolder.rotation.y = STAGE_MODEL_ROTATION_Y;

  group.add(stageHolder);

  loader.load(
    "models/small_stage.glb",

    function (gltf) {
      const stage = gltf.scene;

      centerModel(stage);

      // Preserve the existing custom stage scale.
      stage.scale.copy(STAGE_MODEL_SCALE);

      stage.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });

      stageHolder.add(stage);

      console.log(`${genre.name} 3D stage loaded.`);
    },

    function () {
      console.log(`${genre.name} stage is loading...`);
    },

    function (error) {
      console.log(`${genre.name} stage could not load. Backup stage added.`, error);

      const backupStage = createBackupStage(genre.color);
      backupStage.scale.copy(STAGE_MODEL_SCALE);
      stageHolder.add(backupStage);
    }
  );
}

// ===============================
// ADD 3D SPEAKER MODELS
// ===============================

function addSpeakerModels(group, genre) {
  const speakerGroup = new THREE.Group();
  group.add(speakerGroup);

  loadSpeakerModel()
    .then((gltf) => {
      SPEAKER_POSITIONS.forEach((speakerData, index) => {
        const speaker = SkeletonUtils.clone(gltf.scene);

        centerModel(speaker);

        speaker.position.copy(speakerData.position);
        speaker.rotation.y = speakerData.rotationY;
        speaker.scale.copy(SPEAKER_MODEL_SCALE);

        speaker.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });

        speakerGroup.add(speaker);

        console.log(`${genre.name} speaker ${index + 1} loaded.`);
      });
    })
    .catch((error) => {
      console.log("Speaker model could not load. Backup speakers added.", error);

      addBackupSpeakers(speakerGroup);
    });
}

// ===============================
// LOAD SPEAKER MODEL ONCE
// ===============================

function loadSpeakerModel() {
  if (speakerModelPromise) {
    return speakerModelPromise;
  }

  const loader = new GLTFLoader();

  speakerModelPromise = new Promise((resolve, reject) => {
    loader.load(
      SPEAKER_MODEL_PATH,
      (gltf) => {
        resolve(gltf);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });

  return speakerModelPromise;
}

// ===============================
// BACKUP SPEAKERS
// ===============================

function addBackupSpeakers(group) {
  SPEAKER_POSITIONS.forEach((speakerData) => {
    const speaker = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 1),
      new THREE.MeshStandardMaterial({
        color: "#050505",
        roughness: 0.6
      })
    );

    speaker.position.copy(speakerData.position);
    speaker.rotation.y = speakerData.rotationY;
    group.add(speaker);
  });
}

// ===============================
// ADD DANCERS AROUND STAGE
// ===============================

function addDancersAroundStage(group, genre) {
  const dancerArea = new THREE.Group();

  // Put the small crowd around the stage area.
  dancerArea.position.set(
    STAGE_MODEL_POSITION.x,
    0,
    STAGE_MODEL_POSITION.z - 8
  );

  group.add(dancerArea);

  for (let i = 0; i < DANCERS_PER_STAGE; i++) {
    const modelPath = DANCER_MODEL_PATHS[i % DANCER_MODEL_PATHS.length];

    // Spread dancers in front of the stage.
    const row = Math.floor(i / 2);
    const column = i % 2;

    const x = (column - 0.5) * 2.2 + randomBetween(-0.25, 0.25);
    const z = row * 2.2 + randomBetween(-0.25, 0.25);

    const dancerPosition = new THREE.Vector3(x, 0, z);

    loadDancerClone(modelPath, dancerArea, dancerPosition, genre, i);
  }
}

// ===============================
// LOAD AND CLONE DANCER MODEL
// ===============================

function loadDancerClone(modelPath, parentGroup, position, genre, index) {
  loadDancerModel(modelPath)
    .then((gltf) => {
      const dancer = SkeletonUtils.clone(gltf.scene);

      centerModel(dancer);

      dancer.position.copy(position);
      dancer.scale.set(DANCER_SCALE, DANCER_SCALE, DANCER_SCALE);

      // Make dancers face the stage.
      dancer.rotation.y = Math.PI + randomBetween(-0.35, 0.35);

      const randomSize = randomBetween(0.8, 1.15);
      dancer.scale.multiplyScalar(randomSize);

      dancer.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });

      parentGroup.add(dancer);

      if (ENABLE_DANCER_ANIMATION && gltf.animations && gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(dancer);

        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.play();
        });

        dancerMixers.push(mixer);
      } else if (ENABLE_DANCER_ANIMATION) {
        addSimpleDanceBounce(dancer, index);
      }

      console.log(`${genre.name} dancer loaded: ${modelPath}`);
    })
    .catch((error) => {
      console.log(`Dancer could not load: ${modelPath}`, error);
    });
}

// ===============================
// LOAD DANCER MODEL ONCE
// ===============================

function loadDancerModel(modelPath) {
  if (dancerModelCache[modelPath]) {
    return dancerModelCache[modelPath];
  }

  const loader = new GLTFLoader();

  dancerModelCache[modelPath] = new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      (gltf) => {
        resolve(gltf);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });

  return dancerModelCache[modelPath];
}

// ===============================
// SIMPLE BACKUP DANCE BOUNCE
// ===============================

function addSimpleDanceBounce(object, index) {
  const startY = object.position.y;
  const startRotationY = object.rotation.y;

  const mixerLikeObject = {
    update(deltaTime) {
      const time = performance.now() * 0.004 + index;

      object.position.y = startY + Math.sin(time * 2) * 0.08;
      object.rotation.y = startRotationY + Math.sin(time) * 0.25;
      object.rotation.z = Math.sin(time * 1.5) * 0.05;
    }
  };

  dancerMixers.push(mixerLikeObject);
}

// ===============================
// BACKUP STAGE
// ===============================

function createBackupStage(color) {
  const backup = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(9, 0.6, 5),
    new THREE.MeshStandardMaterial({
      color: "#111111",
      roughness: 0.7
    })
  );
  base.position.y = 0.3;
  backup.add(base);

  const backScreen = new THREE.Mesh(
    new THREE.BoxGeometry(7, 3.5, 0.35),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5
    })
  );
  backScreen.position.set(0, 3, -2);
  backup.add(backScreen);

  return backup;
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
// RANDOM HELPER
// ===============================

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// ===============================
// MUSIC DECORATION
// ===============================

function addMusicDecorations(group) {
  for (let i = 0; i < 18; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 38 + Math.random() * 10;

    const barHeight = 1 + Math.random() * 7;

    const equalizerBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, barHeight, 0.9),
      new THREE.MeshStandardMaterial({
        color: "#ff8ee8",
        emissive: "#ff8ee8",
        emissiveIntensity: 0.35
      })
    );

    equalizerBar.position.set(
      Math.cos(angle) * radius,
      barHeight / 2,
      Math.sin(angle) * radius
    );

    group.add(equalizerBar);
  }
}