const canvas = document.getElementById('bg-canvas');
const pointer = { x: 0, y: 0 };

window.addEventListener('pointermove', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

const startThreeScene = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.position.z = 6;

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const point = new THREE.PointLight(0xe96443, 1.3, 100);
  point.position.set(5, 4, 8);
  scene.add(point);

  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.2, 0.35, 170, 24),
    new THREE.MeshStandardMaterial({
      color: 0x904e95,
      metalness: 0.55,
      roughness: 0.2,
      emissive: 0x1f0d22,
    })
  );
  scene.add(knot);

  const stars = new THREE.Group();
  for (let i = 0; i < 220; i += 1) {
    const star = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );

    const [x, y, z] = Array.from({ length: 3 }, () => THREE.MathUtils.randFloatSpread(45));
    star.position.set(x, y, z);
    stars.add(star);
  }
  scene.add(stars);

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);

  const animate = () => {
    requestAnimationFrame(animate);
    const scroll = window.scrollY || 0;

    knot.rotation.x += 0.005;
    knot.rotation.y += 0.006;
    knot.position.y = -scroll * 0.0009;

    stars.rotation.y += 0.0007;
    camera.position.x += ((pointer.x * 0.35) - camera.position.x) * 0.02;
    camera.position.y += (((pointer.y * 0.25) - scroll * 0.0003) - camera.position.y) * 0.02;

    renderer.render(scene, camera);
  };
  animate();
};

const startCanvasFallback = () => {
  const ctx = canvas.getContext('2d');
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const dots = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    z: Math.random() * 2 + 0.2,
  }));

  const animate = () => {
    requestAnimationFrame(animate);
    const scroll = window.scrollY || 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach((dot, index) => {
      dot.y += 0.15 * dot.z;
      if (dot.y > canvas.height + 10) {
        dot.y = -10;
      }

      const x = dot.x + pointer.x * 15 * dot.z;
      const y = dot.y - scroll * 0.05 * dot.z;
      const radius = 0.6 + dot.z * 1.1;
      const hue = index % 2 === 0 ? '233,100,67' : '144,78,149';
      ctx.fillStyle = `rgba(${hue},0.7)`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  };
  animate();
};

if (window.THREE) {
  startThreeScene();
} else {
  startCanvasFallback();
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

document.getElementById('year').textContent = new Date().getFullYear();

const themeToggle = document.getElementById('theme-toggle');
const preferredTheme = localStorage.getItem('theme');
if (preferredTheme === 'light') {
  document.body.classList.add('light');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  themeToggle.textContent = isLight ? '☀️' : '🌙';
});
