import * as THREE from "three";

// ===============================
// ANIME WORLD DATA
// ===============================

export const animeWorldData = [
  {
    name: "Shonen",
    color: "#ff6b6b",
    angle: 0,
    description: "Action anime with battles, growth, friendship, and strong main characters.",
    anime: [
      {
        title: "Jujutsu Kaisen",
        note: "Dark shonen with curses, action, and stylish fights.",
        trailer: "https://www.youtube.com/embed/pkKu9hLT-t8"
      },
      {
        title: "Demon Slayer",
        note: "Emotional action anime with beautiful animation.",
        trailer: "https://www.youtube.com/embed/VQGCKyvzIM4"
      }
    ]
  },
  {
    name: "Sports Anime",
    color: "#80ed99",
    angle: Math.PI / 3,
    description: "Anime about teamwork, training, competition, and personal growth.",
    anime: [
      {
        title: "Haikyuu!!",
        note: "Volleyball anime with teamwork and hype matches.",
        trailer: "https://www.youtube.com/embed/JOGp2c7-cKc"
      },
      {
        title: "Blue Lock",
        note: "Football anime focused on ego and becoming the best striker.",
        trailer: "https://www.youtube.com/embed/IVsII3dLbWc"
      }
    ]
  },
  {
    name: "Romance Anime",
    color: "#ff8fab",
    angle: (Math.PI / 3) * 2,
    description: "Anime focused on love, friendship, emotions, and relationships.",
    anime: [
      {
        title: "Your Name",
        note: "Romance story with beautiful visuals and supernatural mystery.",
        trailer: "https://www.youtube.com/embed/xU47nhruN-Q"
      },
      {
        title: "A Silent Voice",
        note: "Emotional anime film about regret, bullying, and healing.",
        trailer: "https://www.youtube.com/embed/nfK6UgLra7g"
      }
    ]
  },
  {
    name: "Fantasy Anime",
    color: "#c77dff",
    angle: Math.PI,
    description: "Anime with magic, monsters, other worlds, kingdoms, and adventure.",
    anime: [
      {
        title: "Frieren",
        note: "Fantasy anime about time, memory, and adventure after the hero journey.",
        trailer: "https://www.youtube.com/embed/Iwr1aLEDpe4"
      },
      {
        title: "Mushoku Tensei",
        note: "Isekai fantasy with world building and magic.",
        trailer: "https://www.youtube.com/embed/1TiBoHQUj3I"
      }
    ]
  },
  {
    name: "Mystery / Psychological",
    color: "#4cc9f0",
    angle: (Math.PI / 3) * 4,
    description: "Anime with mind games, mystery, tension, and darker stories.",
    anime: [
      {
        title: "Death Note",
        note: "Psychological battle between a student and a detective.",
        trailer: "https://www.youtube.com/embed/NlJZ-YgAt-c"
      },
      {
        title: "Monster",
        note: "Slow psychological thriller with crime and moral questions.",
        trailer: "https://www.youtube.com/embed/9aS-EgdAq6U"
      }
    ]
  },
  {
    name: "Slice of Life",
    color: "#ffd166",
    angle: (Math.PI / 3) * 5,
    description: "Calm anime about daily life, friendship, school, work, and personal moments.",
    anime: [
      {
        title: "A Place Further Than the Universe",
        note: "Adventure slice-of-life about friendship and chasing dreams.",
        trailer: "https://www.youtube.com/embed/nt573QIevIM"
      },
      {
        title: "Barakamon",
        note: "Relaxing anime about creativity, life, and community.",
        trailer: "https://www.youtube.com/embed/1gmN_3kr4wo"
      }
    ]
  }
];

// ===============================
// CREATE ANIME WORLD
// ===============================

export function createAnimeWorld(scene, createFloatingText, position) {
  const animeWorldGroup = new THREE.Group();
  animeWorldGroup.position.set(position.x, 0, position.z);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(position.radius, 80),
    new THREE.MeshStandardMaterial({
      color: "#241018",
      roughness: 0.8
    })
  );
  ground.rotation.x = -Math.PI / 2;
  animeWorldGroup.add(ground);

  const road = new THREE.Mesh(
    new THREE.RingGeometry(16, 21, 100),
    new THREE.MeshStandardMaterial({
      color: "#12070c",
      roughness: 0.7
    })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.03;
  animeWorldGroup.add(road);

  const sign = createFloatingText("ANIME WORLD", "#ff6b6b");
  sign.position.set(-8, 9, 0);
  animeWorldGroup.add(sign);

  const animeStations = [];

  animeWorldData.forEach((genre) => {
    const radius = 31;
    const x = Math.cos(genre.angle) * radius;
    const z = Math.sin(genre.angle) * radius;

    const station = createAnimeStation(genre, x, z, createFloatingText);

    animeStations.push({
      group: station.group,
      genre,
      trigger: new THREE.Vector3(x + position.x, 0, z + position.z)
    });

    animeWorldGroup.add(station.group);
  });

  addAnimeDecorations(animeWorldGroup);

  scene.add(animeWorldGroup);

  return {
    animeWorldGroup,
    animeStations
  };
}

// ===============================
// CREATE ANIME STATION
// ===============================

function createAnimeStation(genre, x, z, createFloatingText) {
  const group = new THREE.Group();

  group.position.set(x, 0, z);
  group.lookAt(0, 0, 0);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(9, 0.5, 5),
    new THREE.MeshStandardMaterial({
      color: "#101010"
    })
  );
  base.position.y = 0.25;
  group.add(base);

  const mangaPanel = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 4, 0.35),
    new THREE.MeshStandardMaterial({
      color: genre.color,
      emissive: genre.color,
      emissiveIntensity: 0.5
    })
  );
  mangaPanel.position.set(0, 3.2, -2);
  group.add(mangaPanel);

  const innerPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(5.8, 3),
    new THREE.MeshBasicMaterial({
      color: "#050505"
    })
  );
  innerPanel.position.set(0, 3.2, -2.19);
  group.add(innerPanel);

  const leftPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 3, 12),
    new THREE.MeshStandardMaterial({
      color: "#222222"
    })
  );
  leftPost.position.set(-3.2, 1.5, -2);
  group.add(leftPost);

  const rightPost = leftPost.clone();
  rightPost.position.x = 3.2;
  group.add(rightPost);

  const sign = createFloatingText(genre.name, genre.color);
  sign.position.set(-3.2, 5.8, -2.1);
  group.add(sign);

  return {
    group
  };
}

// ===============================
// ANIME DECORATION
// ===============================

function addAnimeDecorations(group) {
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 38 + Math.random() * 10;

    const lantern = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 1),
      new THREE.MeshStandardMaterial({
        color: "#ff6b6b",
        emissive: "#ff6b6b",
        emissiveIntensity: 0.35
      })
    );

    lantern.position.set(
      Math.cos(angle) * radius,
      1,
      Math.sin(angle) * radius
    );

    group.add(lantern);
  }
}