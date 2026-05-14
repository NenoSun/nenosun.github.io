import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// ── LOADING MANAGER ──────────────────────────────────────────────────────────
const manager = new THREE.LoadingManager();

manager.onProgress = (_url, loaded, total) => {
    const pct = Math.round((loaded / total) * 100);
    const bar = document.getElementById('loading-bar');
    if (bar) bar.style.width = pct + '%';
};

manager.onLoad = () => {
    const screen = document.getElementById('loading-screen');
    if (screen) {
        screen.style.opacity = '0';
        setTimeout(() => { screen.style.display = 'none'; }, 750);
    }
    const ui = document.getElementById('hero-ui');
    if (ui) {
        ui.style.opacity = '1';
        ui.style.transform = 'translateY(0)';
    }
};

// ── RENDERER ─────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.65;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// ── SCENE ────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();

// ── CAMERA ───────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.01, 200);
camera.position.set(4.5, 2.2, 6);

// ── CONTROLS ─────────────────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.38;
controls.minDistance = 2.5;
controls.maxDistance = 18;
controls.maxPolarAngle = Math.PI / 2 + 0.08;
controls.target.set(0, 0, 0);
controls.update();

// ── CAR MODEL ────────────────────────────────────────────────────────────────
const loader = new GLTFLoader(manager);
loader.load(
    '/public/porsche_911_with_interior.glb',
    (gltf) => {
        const mesh = gltf.scene;
        mesh.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Center the model at world origin
        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());
        mesh.position.sub(center);

        // Ground plane flush with car bottom
        const groundY = box.min.y - center.y;
        const ground = new THREE.Mesh(
            new THREE.CircleGeometry(14, 72),
            new THREE.MeshStandardMaterial({ color: 0x0c0f0c, metalness: 0.45, roughness: 0.65 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = groundY;
        ground.receiveShadow = true;
        scene.add(ground);

        scene.add(mesh);
        controls.target.set(0, 0, 0);
        controls.update();
    },
    undefined,
    (error) => console.error('GLTFLoader error:', error)
);

// ── HDR ENVIRONMENT ──────────────────────────────────────────────────────────
const hdrLoader = new RGBELoader(manager);
hdrLoader.load('/public/monochrome_studio_02_4k.hdr', (hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdr;
    scene.environmentIntensity = 1.15;
});

// ── RESIZE ───────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ── RENDER LOOP ───────────────────────────────────────────────────────────────
function animate() {
    controls.update();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
