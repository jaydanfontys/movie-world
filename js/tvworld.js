import * as THREE from "three";

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

export function createTVWorld(scene, createFloatingText, position) {
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

  const tvTheaters = [];

  tvShowData.forEach((genre) => {
    const radius = 31;
    const x = Math.cos(genre.angle) * radius;
    const z = Math.sin(genre.angle) * radius;

    const station = createTVTheater(genre, x, z, createFloatingText);

    tvTheaters.push({
      group: station.group,
      genre,
      trigger: new THREE.Vector3(x + position.x, 0, z + position.z)
    });

    tvWorldGroup.add(station.group);
  });

  addTVDecorations(tvWorldGroup);

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
    new THREE.BoxGeometry(8, 0.5, 5),
    new THREE.MeshStandardMaterial({
      color: "#101010"
    })
  );
  base.position.y = 0.25;
  group.add(base);

  const tvFrame = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 4.5, 0.5),
    new THREE.MeshStandardMaterial({
      color: "#050505",
      roughness: 0.45
    })
  );
  tvFrame.position.set(0, 3.2, -2);
  group.add(tvFrame);

  const tvScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(6.6, 3.5),
    new THREE.MeshBasicMaterial({
      color: genre.color
    })
  );
  tvScreen.position.set(0, 3.2, -2.28);
  group.add(tvScreen);

  const tvStand = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.5, 0.3),
    new THREE.MeshStandardMaterial({
      color: "#222222"
    })
  );
  tvStand.position.set(0, 1.2, -2);
  group.add(tvStand);

  const sign = createFloatingText(genre.name, genre.color);
  sign.position.set(-3.2, 5.9, -2.1);
  group.add(sign);

  return {
    group
  };
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