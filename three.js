import * as THREE from '/three.js-master/build/three.module.js';
import {OrbitControls} from '/three.js-master/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '/three.js-master/examples/jsm/loaders/GLTFLoader.js';

function main() {
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;

//Define perspective Camera
const fov = 75;
const aspect = window.innerWidth / window.innerHeight;  // the canvas default
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
//Camera position needs to be a bit further of the origin in order to see the object
camera.position.z = 3;

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.update();

//Add a scene. A scene has all the objects, that we want to render -> like in Blender
const scene = new THREE.Scene();

//Adding some light
{
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
	const backlight = new THREE.DirectionalLight(color, 1);
	backlight.position.set(1,-2,-4);
    light.position.set(-1, 2, 4);
    scene.add(light);
}

//Generate a box
const boxWidth =0.1;
const boxHeight = 0.1;
const boxDepth = 0.1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
//set a basic material
//Basic Material is not affected by light instead use MeshPhongMaterial
//const material = new THREE.MeshBasicMaterial({color: 0x44aa88});
const material = new THREE.MeshPhongMaterial({color: 0x44aa88});  // greenish blue

//Generate more boxes by a function
function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({color});
   
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
   
    cube.position.x = x;
   
    return cube;
}

//Make more boxes, save them in an array
const cubes = [
    makeInstance(geometry, 0x44aa88,  -1),
    makeInstance(geometry, 0x8844aa, -2),
    makeInstance(geometry, 0xaa8844,  2),
    makeInstance(geometry, 0x44aa88, 1),
];

//Create a Mesh. In three a mesh represents the combination of three things: geometry, material, position
//const cube = new THREE.Mesh(geometry, material);

//Add mesh to scene
//scene.add(cube);

//render scene
//renderer.render(scene, camera);

// Instantiate a GLTF loader
var model;
const gltfLoader = new GLTFLoader();

// Load a glTF resource
gltfLoader.load(
	// resource URL
	'Claptrap.gltf',
	// called when the resource is loaded
	function ( gltf ) {
		console.log( gltf );
		const claptrapModel = gltf.scene;
		model = gltf.scene;
		claptrapModel.scale.set(0.5,0.5,0.5);
		claptrapModel.position.xyz=0;
		scene.add( claptrapModel );
		// gltf.animations; // Array<THREE.AnimationClip>
		// gltf.scene; // THREE.Group
		// gltf.scenes; // Array<THREE.Group>
		// gltf.cameras; // Array<THREE.Camera>
		// gltf.asset; // Object

	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded.' + ' ' + 'The gltf Object has been successfully loaded.' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened when loading the gltf object.' );

	}
);

//Animation Rendering
function render(time) {
    time *= 0.001;  // convert time to seconds
    cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * .1;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
      });
	if (model) {
	model.rotation.y += 0.01;
	}

    renderer.render(scene, camera);
   
    requestAnimationFrame(render);
  }

  //A Request to the browser, that you want to animate something
  requestAnimationFrame(render);
}

main();