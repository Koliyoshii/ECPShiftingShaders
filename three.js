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
camera.position.z = 3;

//Add a scene. A scene has all the objects, that we want to render -> like in Blender
const scene = new THREE.Scene();

//Adding some light
{
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
}

//Generate a box
const boxWidth =1;
const boxHeight = 1;
const boxDepth = 1;
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
    makeInstance(geometry, 0x44aa88,  0),
    makeInstance(geometry, 0x8844aa, -2),
    makeInstance(geometry, 0xaa8844,  2),
];

//Create a Mesh. In three a mesh represents the combination of three things: geometry, material, position
const cube = new THREE.Mesh(geometry, material);

//Add mesh to scene
//scene.add(cube);

//render scene
//renderer.render(scene, camera);


//Animation Rendering
function render(time) {
    time *= 0.001;  // convert time to seconds
    cubes.forEach((cube, ndx) => {
        const speed = 1 + ndx * .1;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
      });
   
    renderer.render(scene, camera);
   
    requestAnimationFrame(render);
  }

  //A Request to the browser, that you want to animate something
  requestAnimationFrame(render);
}

main();