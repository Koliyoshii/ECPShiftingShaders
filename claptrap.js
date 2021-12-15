import * as THREE from "./build/three.module.js";
import { GLTFLoader } from "./GLTFLoader.js";
import { ARButton } from "./ARButton.js";

let gTire, gArm, gClaptrapModel, renderer, light, camera, scene;

let container;
let findTarget;
let hitTestSource = null;
let hitTestSourceRequested = false;
let controller;

init();
animate();

function init() {
  // create container
  container = document.createElement("div");
  document.body.appendChild(container);

  // create the scene
  scene = new THREE.Scene();

  // create and set the camera
  const angleOfView = 55;
  const aspectRatio = window.innerWidth / window.innerHeight;
  const nearPlane = 0.1;
  const farPlane = 1000;
  camera = new THREE.PerspectiveCamera(
    angleOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );
  //camera.matrixAutoUpdate = false;
  //camera.position.set(0, 8, 30);

  // add fog
  const fog = new THREE.Fog("gray", 1, 90);
  scene.fog = fog;

  // LIGHTS
  // directional lighting
  let color = 0xffffff;
  let intensity = 0.7;
  light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 30, 30);
  scene.add(light);
  // ambient lighting
  let ambientColor = 0xaaaaff;
  let ambientIntensity = 0.2;
  const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
  scene.add(ambientLight);

  // create renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.autoClear = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  //Create AR Button
  document.body.appendChild(
    ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] })
  );

  // GEOMETRY
  const gltfLoader = new GLTFLoader();

  //Load claptrap
  gltfLoader.load(
    // resource URL
    "./models/claptrapBody.gltf",
    // called when the resource is loaded
    function (gltf) {
      console.log(gltf);
      gClaptrapModel = gltf.scene;
      gClaptrapModel.scale.set(0.05, 0.05, 0.05); //scale 3D model
      //gClaptrapModel.rotation.y = Math.PI / 2; //rotate 180 degrees

      // Add coordinate systems and plane normal
      const axesHelperScene = new THREE.AxesHelper(5);
      gClaptrapModel.add(axesHelperScene);
      //gClaptrapModel.add(positionalSound); //Sound wird hinzugefügt

      // Load Claptrap Tire
      gltfLoader.load(
        // resource URL
        "./models/reifen.gltf",
        // called when the resource is loaded
        function (gltf) {
          console.log(gltf);
          const tire = gltf.scene;

          //position of the tire with regards to its body
          tire.position.y = -1.675;
          tire.position.z = -0.03;

          // Add coordinate systems and plane normal
          const axesHelperScene = new THREE.AxesHelper(5); //Achsen werden angezeigt
          tire.add(axesHelperScene);

          //give global gTire the tire
          gTire = gltf.scene;

          //add the tire to the global claptrap model
          gClaptrapModel.add(tire);
        }
      );

      // Load Claptrap Arm
      gltfLoader.load(
        // resource URL
        "./models/arm.gltf",
        // called when the resource is loaded
        function (gltf) {
          console.log(gltf);
          const arm = gltf.scene; //arm wird der Szene hinzugefügt

          //position of the arm with regards to its body
          arm.position.z = -0.1;
          arm.position.y = 0.35;

          // Add coordinate systems and plane normal
          const axesHelperScene = new THREE.AxesHelper(10);
          arm.add(axesHelperScene);

          //give global gArm the arm
          gArm = gltf.scene;

          //add the arm tothe global claptrap model
          gClaptrapModel.add(arm);
        }
      );
    }
  );

  const geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 32).translate(
    0,
    0.1,
    0
  );

  //Function to add claptraps
  function onSelect() {
    if (findTarget.visible) {
      gClaptrapModel.position.setFromMatrixPosition(findTarget.matrix);
      //gClaptrapModel.position.z = findTarget.matrix.z + 1;
      scene.add(gClaptrapModel);
      // const material = new THREE.MeshPhongMaterial({
      //   color: 0xffffff * Math.random(),
      // });
      // const mesh = new THREE.Mesh(gClaptrapModel, material);
      // mesh.position.setFromMatrixPosition(findTarget.matrix);
      // mesh.scale.y = Math.random() * 2 + 1;
    }
  }

  //Function to intialize movement
  setRandomPosition();

  //Add controller
  //Code from WebXR Examples Hit-Test.
  //https://github.com/mrdoob/three.js/blob/master/examples/webxr_ar_hittest.html
  controller = renderer.xr.getController(0);
  controller.addEventListener("select", onSelect);
  controller.addEventListener("select", setRandomPosition);
  scene.add(controller);

  //Add TargetHitter
  findTarget = new THREE.Mesh(
    new THREE.RingGeometry(0.03, 0.04, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial()
  );
  findTarget.matrixAutoUpdate = false;
  findTarget.visible = false;
  scene.add(findTarget);

  //
  window.addEventListener("resize", onWindowResize);
} //end function init()

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function setRandomPosition() {
  direction = new THREE.Vector3(
    Math.random() * 2 - 1,
    0,
    Math.random() * 2 - 1
  ).normalize();
  console.log(direction);
}

function animate() {
  renderer.setAnimationLoop(draw);
} //end function animate()

//Settings for Claptrap Animation
let kmh = 0.05; //set pace
var borderLeft = -5.0; //set borderLeft
var borderRight = 5.0; //set borderRight
let direction;
let delta;
var clock = new THREE.Clock();
let shift = new THREE.Vector3();

// DRAW
function draw(time, frame) {
  time *= 0.001; //convert time to seconds

  //Resize Display Size and update Projection Matrix
  if (resizeDisplay) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  //Animation for Claptrap Body
  //Quelle Code: https://jsfiddle.net/prisoner849/qqoouo2w/
  //noch fehlerhaft, Fehlermeldung in Zeile 200 setRandomPosition
  if (gClaptrapModel) {
    delta = clock.getDelta();
    shift.copy(direction).multiplyScalar(delta * kmh);
    gClaptrapModel.position.add(shift);
    //gClaptrapModel.translateZ(10); Frage: Richtung, in die Claptrap guckt anpassen
  }
  // if (gClaptrapModel) {
  //   //Initialize animation to move right
  //   gClaptrapModel.position.x += kmh;
  //   //if Claptrap is at a certain x-Position, turn around
  //   if (gClaptrapModel.position.x <= borderLeft) {
  //     kmh = Math.abs(kmh);
  //     gClaptrapModel.rotation.y += Math.PI;
  //     //changeLight(); //farbe wird zu zufälligen farbwert geändert
  //   } else if (gClaptrapModel.position.x >= borderRight) {
  //     //if Claptrap is at a certain x-Position, turn around
  //     kmh = -Math.abs(kmh);
  //     gClaptrapModel.rotation.y += Math.PI; //dreht um 180grad um
  //     //changeLight();//farbe wird zu zufälligen farbwert geändert
  //   }
  // }

  //Rotation of the tire
  var tireRotationSpeed = 0.1;
  if (gTire) {
    gTire.rotation.x += tireRotationSpeed;
  }

  //Arm movement
  var armMovementSpeed = 0.003;
  if (gArm) {
    //Die Date.now() Methode gibt die Anzahl der Millisekunden,
    //die seit dem 01.01.1970 00:00:00 UTC vergangen sind zurück.
    //Math.PI * 0.5 um 180 Grad einzuschränken
    gArm.rotation.x = Math.sin(Date.now() * armMovementSpeed) * Math.PI * 0.5;
  }

  //Code from WebXR Examples Hit-Test.
  //Functionality of detecting surface and place objects with a circle as a Finder
  //https://github.com/mrdoob/three.js/blob/master/examples/webxr_ar_hittest.html
  if (frame) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();
    if (hitTestSourceRequested === false) {
      session.requestReferenceSpace("viewer").then(function (referenceSpace) {
        session
          .requestHitTestSource({ space: referenceSpace })
          .then(function (source) {
            hitTestSource = source;
          });
      });

      session.addEventListener("end", function () {
        hitTestSourceRequested = false;
        hitTestSource = null;
      });
      hitTestSourceRequested = true;
    }

    if (hitTestSource) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length) {
        const hit = hitTestResults[0];

        findTarget.visible = true;
        findTarget.matrix.fromArray(
          hit.getPose(referenceSpace).transform.matrix
        );
      } else {
        findTarget.visible = false;
      }
    }
  } //end if frame

  //Render scene
  renderer.render(scene, camera);

  // light.position.x = 20*Math.cos(time);
  // light.position.y = 20*Math.sin(time);
} //end function draw

// UPDATE RESIZE
function resizeDisplay() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width != width || canvas.height != height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
} //end function resizeDisplay
