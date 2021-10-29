import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';

function main() {
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});

//Define perspective Camera
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
//Camera position needs to be a bit further of the origin in order to see the object
camera.position.z = 2;

//Add a scene. A scene has all the objects, that we want to render -> like in Blender
const scene = new THREE.Scene();
//Generate a box
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
//set a basic material
const material = new THREE.MeshBasicMaterial({color: 0x44aa88});

//Create a Mesh. In three a mesh represents the combination of three things: geometry, material, position
const cube = new THREE.Mesh(geometry, material);

//Add mesh to scene
scene.add(cube);

//render scene
renderer.render(scene, camera);
}

main();