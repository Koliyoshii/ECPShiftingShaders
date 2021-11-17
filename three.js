import * as THREE from '/three.js-master/build/three.module.js';
import {OrbitControls} from '/three.js-master/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '/three.js-master/examples/jsm/loaders/GLTFLoader.js';

function main() {
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas, alpha: true});
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
camera.position.z = 4;
camera.position.x = 0;
camera.position.y = 0;

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.update();

//Add a scene. A scene has all the objects, that we want to render -> like in Blender
const scene = new THREE.Scene();

//Adding some light
let light1;
let light2;
{
    const color1 = new THREE.Color("rgb(35, 91, 204)");
    let intensity1 = 0.5;
	const color2 = new THREE.Color("rgb(237, 40, 40)");
	let intensity2 = 1;
    light1 = new THREE.DirectionalLight(color1, intensity1);
	light2 = new THREE.DirectionalLight(color2, intensity2);
    light1.position.set(-3, 0, 4);
	light2.position.set(3, 0, 4);
    scene.add(light1);
	scene.add(light2);	
}

//Change the color of light
function changeLight() {
	let randomColor1 = new THREE.Color( 0xffffff );
    randomColor1.setHex( Math.random() * 0xffffff );
	let randomColor2 = new THREE.Color( 0xffffff );
	randomColor2.setHex( Math.random() * 0xffffff );
	light1.color.set(randomColor1);
	light2.color.set(randomColor2);
}

// //Generate a box
// const boxWidth =0.1;
// const boxHeight = 0.1;
// const boxDepth = 0.1;
// const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
// //set a basic material
// //Basic Material is not affected by light instead use MeshPhongMaterial
// //const material = new THREE.MeshBasicMaterial({color: 0x44aa88});
// const material = new THREE.MeshPhongMaterial({color: 0x44aa88});  // greenish blue

// //Generate more boxes by a function
// function makeInstance(geometry, color, x) {
//     const material = new THREE.MeshPhongMaterial({color});
   
//     const cube = new THREE.Mesh(geometry, material);
//     scene.add(cube);
   
//     cube.position.x = x;
   
//     return cube;
// }

// //Make more boxes, save them in an array
// const cubes = [
//     makeInstance(geometry, 0x44aa88,  -1),
//     makeInstance(geometry, 0x8844aa, -2),
//     makeInstance(geometry, 0xaa8844,  2),
//     makeInstance(geometry, 0x44aa88, 1),
// ];

// Instantiate a GLTF loader
var body;
var tireAnim;
var armAnim;
const gltfLoader = new GLTFLoader();
var claptrapModel;

// Load Claptrap Body
gltfLoader.load(
	// resource URL
	'claptrapBody.gltf',
	// called when the resource is loaded
	function ( gltf ) {
		console.log( gltf );
		claptrapModel = gltf.scene;
		claptrapModel.scale.set(0.5,0.5,0.5);
		claptrapModel.position.xyz=0;
		claptrapModel.rotation.y = Math.PI / 2;
		// Add coordinate systems and plane normal
		const axesHelperScene = new THREE.AxesHelper( 5 );
		claptrapModel.add( axesHelperScene );
		
		// Load Claptrap Tire
		gltfLoader.load(
			// resource URL
			'reifen.gltf',
			// called when the resource is loaded
			function ( gltf ) {
					console.log( gltf );
					const tire = gltf.scene;
					tire.position.y = -1.675;
					tire.position.z = -0.03;
					// Add coordinate systems and plane normal
					const axesHelperScene = new THREE.AxesHelper( 5 );
					tire.add( axesHelperScene );
					tireAnim = gltf.scene;
					claptrapModel.add( tire );
				},
				// called while loading is progressing
				function ( xhr ) {

					console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded.' + ' ' + 'The Tire object has been successfully loaded.' );

				},
				// called when loading has errors
				function ( error ) {

					console.log( 'An error happened when loading the Tire object.' );

				}
		);

		// Load Claptrap Arm
		gltfLoader.load(
			// resource URL
			'arm.gltf',
			// called when the resource is loaded
			function ( gltf ) {
				console.log( gltf );
				const arm = gltf.scene;
				arm.position.z= -0.1;
				arm.position.y = 0.35;
				// Add coordinate systems and plane normal
				const axesHelperScene = new THREE.AxesHelper( 10 );
				arm.add( axesHelperScene );
				armAnim = gltf.scene;
				claptrapModel.add(arm);
			},
			// called while loading is progressing
			function ( xhr ) {
				console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded.' + ' ' + 'The Arm object has been successfully loaded.' );
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'An error happened when loading the Arm object.' );
			}
		);

		body = gltf.scene;
		claptrapModel.add(positionalSound);
		claptrapModel.castShadow = true;
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

//load landscape
let landscape;
gltfLoader.load(
	// resource URL
	'landscape.gltf',
	// called when the resource is loaded
	function ( gltf ) {
		console.log( gltf );
		landscape = gltf.scene;
		landscape.scale.set(0.5,0.5,0.5);
		landscape.position.xyz=0;
		landscape.position.z = -4;
		landscape.rotation.y = Math.PI / 2;
		
		// Add coordinate systems and plane normal
		const axesHelperScene = new THREE.AxesHelper( 5 );
		landscape.add( axesHelperScene );

		scene.add( landscape );
		// gltf.animations; // Array<THREE.AnimationClip>
		// gltf.scene; // THREE.Group
		// gltf.scenes; // Array<THREE.Group>
		// gltf.cameras; // Array<THREE.Camera>
		// gltf.asset; // Object

	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded.' + ' ' + 'The landscape has been successfully loaded.' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened when loading the landscape object.' );

	}
);


//Implement sound
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
const sound = new THREE.Audio( listener );

// create the PositionalAudio object (passing in the listener)
const positionalSound = new THREE.PositionalAudio( listener );

// load a sound and set it as the PositionalAudio object's buffer
const positionalAudioLoader = new THREE.AudioLoader();
positionalAudioLoader.load( 'sounds/ende.wav', function( buffer ) {
	positionalSound.setBuffer( buffer );
	positionalSound.setRefDistance( 1 );
	positionalSound.setLoop( true );
	positionalSound.play(10);
},
function ( xhr ) {

	console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded.' + ' ' + 'The PositonalAudio has been successfully loaded.' );

},
// called when loading has errors
function ( error ) {

	console.log( 'An error happened when loading the PositionalAudio.' );

});

// load a sound and set it as the Audio object's buffer
let audioLoader = new THREE.AudioLoader();
audioLoader.load( 'sounds/dp_around_the_world.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( false );
	sound.setVolume( 0.1 );
	sound.play(3);
},
function ( xhr ) {

	console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded.' + ' ' + 'The Audio has been successfully loaded.' );

},
// called when loading has errors
function ( error ) {

	console.log( 'An error happened when loading the Audio.' );

}
);

var kmh = 0.05;

//Animation Rendering
function render(time) {
    time *= 0.001;  // convert time to seconds
		
	if (body) {
		body.position.x += (kmh);
		//console.log(body.rotation.y);
		if(body.position.x <= -3.0 ){
			kmh = 0.05;
			changeLight();
			body.rotation.y += Math.PI / 2;
		} else if(body.position.x >= 3.0){
			kmh = -0.05;
			changeLight();
			body.rotation.y += Math.PI;
		}
		//console.log(kmh);
		if (kmh > 0 ) {
			body.rotation.y = Math.PI / 2;
		}
}

	if (tireAnim) {
		tireAnim.rotation.x += 0.1;
	}

	if (armAnim) {
		//Die Date.now() Methode gibt die Anzahl der Millisekunden, 
		//die seit dem 01.01.1970 00:00:00 UTC vergangen sind zurück.
		//Math.PI * 0.5 um 180 Grad einzuschränken
		armAnim.rotation.x = Math.sin(Date.now() * 0.003) * Math.PI * 0.5;
		//console.log(Math.sin(Date.now()));
	}

    renderer.render(scene, camera);
   
    requestAnimationFrame(render);
  }

  //A Request to the browser, that you want to animate something
  requestAnimationFrame(render);
}

main();