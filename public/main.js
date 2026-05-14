import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

const renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true });

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const loader = new GLTFLoader();
loader.load(
    '/public/porsche_911_with_interior.glb', 
    (gltf) => { 
        const mesh = gltf.scene;
        mesh.traverse((child) => {
            
            child.castShadow = true;
            child.receiveShadow = true;
        });
        mesh.position.x = 2;
        mesh.position.y = 0.1;
        ;
        scene.add(mesh);
     },
    undefined,
    (error) => { console.error(error); }
);

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 100 );
camera.position.z = 3;
const controls = new OrbitControls(camera, renderer.domElement);


const hdrLoader = new HDRLoader();
hdrLoader.load('/public/quattro_canti_4k.hdr', (hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdr;
    scene.environmentIntensity = 1.0;
});

function animate( time ) {
    controls.update();
    renderer.render( scene, camera );
}