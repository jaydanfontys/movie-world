import * as THREE from "three";

// ===============================
// MUSIC WORLD DATA
// ===============================

export const musicWorldData = [
  {
    name: "Pop",
    color: "#ff8ee8",
    angle: 0,
    description: "Popular music with catchy melodies, strong visuals, and music videos.",
    songs: [
      {
        title: "Dua Lipa - Houdini",
        note: "Modern pop with dance visuals.",
        video: "https://www.youtube.com/embed/suAR1PYFNYA"
      },
      {
        title: "The Weeknd - Blinding Lights",
        note: "Retro pop style with cinematic visuals.",
        video: "https://www.youtube.com/embed/4NRXx6U8ABQ"
      }
    ]
  },
  {
    name: "Hip-Hop",
    color: "#ffd166",
    angle: Math.PI / 3,
    description: "Music focused on rhythm, flow, lyrics, and strong visual identity.",
    songs: [
      {
        title: "Kendrick Lamar - HUMBLE.",
        note: "Strong visuals and performance style.",
        video: "https://www.youtube.com/embed/tvTRZJ-4EyI"
      },
      {
        title: "Travis Scott - SICKO MODE",
        note: "Creative editing and surreal visuals.",
        video: "https://www.youtube.com/embed/6ONRf7h3Mdk"
      }
    ]
  },
  {
    name: "Rock",
    color: "#ff4d4d",
    angle: (Math.PI / 3) * 2,
    description: "Band-based music with guitars, drums, energy, and stage performance.",
    songs: [
      {
        title: "Foo Fighters - The Pretender",
        note: "Performance-based rock music video.",
        video: "https://www.youtube.com/embed/SBjQ9tuuTJQ"
      },
      {
        title: "Linkin Park - Numb",
        note: "Rock video with emotional storytelling.",
        video: "https://www.youtube.com/embed/kXYiU_JCYtU"
      }
    ]
  },
  {
    name: "R&B",
    color: "#c77dff",
    angle: Math.PI,
    description: "Smooth vocals, emotional stories, and stylish music videos.",
    songs: [
      {
        title: "SZA - Snooze",
        note: "R&B with soft and emotional visuals.",
        video: "https://www.youtube.com/embed/LDY_XyxBu8A"
      },
      {
        title: "Brent Faiyaz - All Mine",
        note: "Smooth R&B mood and atmosphere.",
        video: "https://www.youtube.com/embed/ZEvQOPUHGH8"
      }
    ]
  },
  {
    name: "EDM",
    color: "#4cc9f0",
    angle: (Math.PI / 3) * 4,
    description: "Electronic music with festivals, lights, and high-energy visuals.",
    songs: [
      {
        title: "Avicii - Levels",
        note: "Classic EDM music video.",
        video: "https://www.youtube.com/embed/_ovdm2yX4MA"
      },
      {
        title: "Calvin Harris - Summer",
        note: "EDM with bright summer visuals.",
        video: "https://www.youtube.com/embed/ebXbLfLACGM"
      }
    ]
  },
  {
    name: "Afro / Latin",
    color: "#80ed99",
    angle: (Math.PI / 3) * 5,
    description: "Rhythmic music styles with dance, culture, and colorful visuals.",
    songs: [
      {
        title: "Rema - Calm Down",
        note: "Afrobeats with colorful visuals.",
        video: "https://www.youtube.com/embed/WcIcVapfqXw"
      },
      {
        title: "J Balvin - Mi Gente",
        note: "Latin music with bright visual style.",
        video: "https://www.youtube.com/embed/wnJ6LuUFpMo"
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

    musicStations.push({
      group: station.group,
      genre,
      trigger: new THREE.Vector3(x + position.x, 0, z + position.z)
    });

    musicWorldGroup.add(station.group);
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
  group.lookAt(0, 0, 0);

  const stage = new THREE.Mesh(
    new THREE.BoxGeometry(9, 0.6, 5),
    new THREE.MeshStandardMaterial({
      color: "#111111"
    })
  );
  stage.position.y = 0.3;
  group.add(stage);

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(7, 3.5, 0.35),
    new THREE.MeshStandardMaterial({
      color: genre.color,
      emissive: genre.color,
      emissiveIntensity: 0.5
    })
  );
  screen.position.set(0, 3, -2);
  group.add(screen);

  const speakerLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 2.2, 0.8),
    new THREE.MeshStandardMaterial({
      color: "#050505"
    })
  );
  speakerLeft.position.set(-4, 1.4, -1.8);
  group.add(speakerLeft);

  const speakerRight = speakerLeft.clone();
  speakerRight.position.x = 4;
  group.add(speakerRight);

  const sign = createFloatingText(genre.name, genre.color);
  sign.position.set(-3.2, 5.6, -2.1);
  group.add(sign);

  return {
    group
  };
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