import * as THREE from "three";

// ===============================
// MOVIE WORLD DATA
// ===============================

export const movieWorldData = [
  {
    name: "Action",
    color: "#ff3333",
    angle: 0,
    description: "Fast, intense movies with fights, danger, heroes, and big set pieces.",
    movies: [
      {
        title: "Mad Max: Fury Road",
        note: "Chaotic action and amazing practical stunts.",
        trailer: "https://www.youtube.com/embed/hEJnMQG9ev8"
      },
      {
        title: "John Wick",
        note: "Stylish action with clean choreography.",
        trailer: "https://www.youtube.com/embed/C0BMx-qxsP4"
      }
    ]
  },
  {
    name: "Romance",
    color: "#ff7eb6",
    angle: Math.PI / 3,
    description: "Stories focused on love, connection, heartbreak, and emotions.",
    movies: [
      {
        title: "La La Land",
        note: "Romance, music, dreams, and sacrifice.",
        trailer: "https://www.youtube.com/embed/0pdqf4P9MB8"
      },
      {
        title: "The Notebook",
        note: "Classic emotional romance story.",
        trailer: "https://www.youtube.com/embed/BjJcYdEOI0k"
      }
    ]
  },
  {
    name: "Comedy / Rom-Com",
    color: "#ffd166",
    angle: (Math.PI / 3) * 2,
    description: "Light, funny stories that mix jokes, relationships, awkward moments, and comfort.",
    movies: [
      {
        title: "Crazy Rich Asians",
        note: "Rom-com with family drama and style.",
        trailer: "https://www.youtube.com/embed/ZQ-YX-5bAs0"
      },
      {
        title: "10 Things I Hate About You",
        note: "Funny high-school rom-com classic.",
        trailer: "https://www.youtube.com/embed/AWmjzCZr0Jw"
      }
    ]
  },
  {
    name: "Horror",
    color: "#9d4edd",
    angle: Math.PI,
    description: "Dark movies made to create tension, fear, mystery, and suspense.",
    movies: [
      {
        title: "Get Out",
        note: "Psychological horror with social commentary.",
        trailer: "https://www.youtube.com/embed/DzfpyUB60YY"
      },
      {
        title: "A Quiet Place",
        note: "Tense horror built around silence.",
        trailer: "https://www.youtube.com/embed/WR7cc5t7tv8"
      }
    ]
  },
  {
    name: "Sci-Fi",
    color: "#4cc9f0",
    angle: (Math.PI / 3) * 4,
    description: "Movies about future worlds, space, technology, time, and big ideas.",
    movies: [
      {
        title: "Interstellar",
        note: "Space, time, family, and survival.",
        trailer: "https://www.youtube.com/embed/zSWdZVtXT7E"
      },
      {
        title: "Blade Runner 2049",
        note: "Slow, beautiful futuristic sci-fi.",
        trailer: "https://www.youtube.com/embed/gCcx85zbxz4"
      }
    ]
  },
  {
    name: "Animation / Family",
    color: "#80ed99",
    angle: (Math.PI / 3) * 5,
    description: "Creative animated movies with emotional stories, adventure, and strong visuals.",
    movies: [
      {
        title: "Spider-Man: Into the Spider-Verse",
        note: "Comic-book animation with a unique style.",
        trailer: "https://www.youtube.com/embed/g4Hbz2jLxvQ"
      },
      {
        title: "Coco",
        note: "Family, music, memory, and culture.",
        trailer: "https://www.youtube.com/embed/Ga6RYejo6Hk"
      }
    ]
  }
];

// ===============================
// CREATE MOVIE WORLD
// ===============================

export function createMovieWorld(scene, createFloatingText, position) {
  const movieWorldGroup = new THREE.Group();
  movieWorldGroup.position.set(position.x, 0, position.z);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(position.radius, 80),
    new THREE.MeshStandardMaterial({
      color: "#202020",
      roughness: 0.85
    })
  );
  ground.rotation.x = -Math.PI / 2;
  movieWorldGroup.add(ground);

  const road = new THREE.Mesh(
    new THREE.RingGeometry(16, 21, 100),
    new THREE.MeshStandardMaterial({
      color: "#111111",
      roughness: 0.7
    })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.03;
  movieWorldGroup.add(road);

  const sign = createFloatingText("MOVIE WORLD", "#ffcc66");
  sign.position.set(-7, 9, 0);
  movieWorldGroup.add(sign);

  const movieStations = [];

  movieWorldData.forEach((genre) => {
    const radius = 31;
    const x = Math.cos(genre.angle) * radius;
    const z = Math.sin(genre.angle) * radius;

    const station = createMovieTheater(genre, x, z, createFloatingText);

    movieStations.push({
      group: station.group,
      genre,
      trigger: new THREE.Vector3(x + position.x, 0, z + position.z)
    });

    movieWorldGroup.add(station.group);
  });

  addMovieDecorations(movieWorldGroup);

  scene.add(movieWorldGroup);

  return {
    movieWorldGroup,
    movieStations
  };
}

// ===============================
// CREATE MOVIE THEATER
// ===============================

function createMovieTheater(genre, x, z, createFloatingText) {
  const group = new THREE.Group();

  group.position.set(x, 0, z);
  group.lookAt(0, 0, 0);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.5, 5),
    new THREE.MeshStandardMaterial({
      color: "#151515"
    })
  );
  base.position.y = 0.25;
  group.add(base);

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(7, 4, 0.35),
    new THREE.MeshStandardMaterial({
      color: genre.color,
      emissive: genre.color,
      emissiveIntensity: 0.45
    })
  );
  screen.position.set(0, 3.2, -2);
  group.add(screen);

  const screenInner = new THREE.Mesh(
    new THREE.PlaneGeometry(6.1, 3.1),
    new THREE.MeshBasicMaterial({
      color: "#050505"
    })
  );
  screenInner.position.set(0, 3.2, -2.19);
  group.add(screenInner);

  const sign = createFloatingText(genre.name, genre.color);
  sign.position.set(-3.2, 5.7, -2.1);
  group.add(sign);

  return {
    group
  };
}

// ===============================
// MOVIE DECORATIONS
// ===============================

function addMovieDecorations(group) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 38 + Math.random() * 10;

    const poster = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 3, 0.2),
      new THREE.MeshStandardMaterial({
        color: "#ffcc66",
        emissive: "#ffcc66",
        emissiveIntensity: 0.25
      })
    );

    poster.position.set(
      Math.cos(angle) * radius,
      1.5,
      Math.sin(angle) * radius
    );

    poster.lookAt(0, 1.5, 0);
    group.add(poster);
  }
}