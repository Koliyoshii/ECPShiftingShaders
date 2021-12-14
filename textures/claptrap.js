import * as THREE from './build/three.module.js';
import { GLTFLoader } from './GLTFLoader.js';
import { ARButton } from './ARButton.js';

var gBody, gTire, gArm, gClaptrapModel, gl, light, camera, scene;

init();
animate();

function init() {
    // create context
    gl = new THREE.WebGLRenderer({
		antialias: true,
	});
	gl.autoClear = true;
    gl.setPixelRatio(window.devicePixelRatio);
    gl.setSize(window.innerWidth, window.innerHeight);
    gl.outputEncoding = THREE.sRGBEncoding;
    gl.xr.enabled = true;
    document.body.appendChild(gl.domElement);
    document.body.appendChild(ARButton.createButton(gl));
    
    // create and set the camera
    const angleOfView = 55;
    const aspectRatio = window.innerWidth / window.innerHeight;
    const nearPlane = 0.1;
    const farPlane = 1000;
    // camera = new THREE.PerspectiveCamera(
    //     angleOfView,
    //     aspectRatio,
    //     nearPlane,
    //     farPlane
    // );
	camera = new THREE.PerspectiveCamera();
	camera.matrixAutoUpdate = false;
    //camera.position.set(0, 8, 30);

    // create the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.3, 0.5, 0.8);

    // add fog
    const fog = new THREE.Fog("gray", 1, 90);
    scene.fog = fog;
    
    // GEOMETRY
	const gltfLoader = new GLTFLoader();

	//Load claptrap
	gltfLoader.load(
		// resource URL
		'./models/claptrapBody.gltf',
		// called when the resource is loaded
		function ( gltf ) {
			console.log( gltf );
			gClaptrapModel = gltf.scene;
			gClaptrapModel.scale.set(0.5,0.5,0.5); //scale 3D model
			gClaptrapModel.position.xyz=0; //position of 3D model
			gClaptrapModel.rotation.y = Math.PI / 2; //rotate 180 degrees

			// Add coordinate systems and plane normal
			const axesHelperScene = new THREE.AxesHelper( 5 );
			gClaptrapModel.add( axesHelperScene ); 
			
			// Load Claptrap Tire
			gltfLoader.load(
				// resource URL
				'./models/reifen.gltf',
				// called when the resource is loaded
				function ( gltf ) {
						console.log( gltf );
						const tire = gltf.scene;

						//position of the tire with regards to its body
						tire.position.y = -1.675; 
						tire.position.z = -0.03;

						// Add coordinate systems and plane normal
						const axesHelperScene = new THREE.AxesHelper( 5 ); //Achsen werden angezeigt
						tire.add( axesHelperScene );
						
						//give global gTire the tire
						gTire = gltf.scene;

						//add the tire to the global claptrap model
						gClaptrapModel.add( tire );
					},
					// called while loading is progressing
					function ( xhr ) {
						console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded.' + ' ' + 'The tire has been successfully loaded.' );
					},
					// called when loading has errors
					function ( error ) {
						console.log( 'An error happened when loading the tire.' );
					}
			);

			// Load Claptrap Arm
			gltfLoader.load(
				// resource URL
				'./models/arm.gltf',
				// called when the resource is loaded
				function ( gltf ) {
					console.log( gltf );
					const arm = gltf.scene; //arm wird der Szene hinzugefügt

					//position of the arm with regards to its body
					arm.position.z= -0.1;
					arm.position.y = 0.35;

					// Add coordinate systems and plane normal
					const axesHelperScene = new THREE.AxesHelper( 10 );
					arm.add( axesHelperScene );

					//give global gArm the arm
					gArm = gltf.scene;

					//add the arm tothe global claptrap model
					gClaptrapModel.add(arm);
				},
				// called while loading is progressing
				function ( xhr ) {
					console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded.' + ' ' + 'The arm has been successfully loaded.' );
				},
				// called when loading has errors
				function ( error ) {
					console.log( 'An error happened when loading the arm.' );
				}
			);
			
			//give the global gBody the gltf.scene after adding the tire and arm. Necessary to animate.
			gBody = gltf.scene;

			//gClaptrapModel.add(positionalSound); //Sound wird hinzugefügt
			//add claptrap to the scene
			scene.add( gClaptrapModel );
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

	// LIGHTS
    // directional lighting
    const color = 0xffffff;
    const intensity = 0.7;
    light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 30, 30);
    scene.add(light);
    // ambient lighting
    const ambientColor = 0xaaaaff;
    const ambientIntensity = 0.2;
    const ambientLight = new THREE.AmbientLight(ambientColor, ambientIntensity);
    scene.add(ambientLight);
} //end function init()

function animate() {
    gl.setAnimationLoop(draw);
} //end function animate()

//Settings for Claptrap Animation
var kmh = 0.05; //set pace
var borderLeft = -5.0; //set borderLeft
var borderRight = 5.0; //set borderRight

// DRAW
function draw(time) {
	time *= 0.001;  //convert time to seconds

	//Resize Display Size and update Projection Matrix
	if (resizeDisplay) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

	//Animation for Claptrap Body
	if (gBody) {
		//Initialize animation to move right
		gBody.position.x += kmh;
		//if Claptrap is at a certain x-Position, turn around
		if(gBody.position.x <= borderLeft ){
			kmh = Math.abs(kmh);
			gBody.rotation.y += Math.PI ;
			//changeLight(); //farbe wird zu zufälligen farbwert geändert
		} else if(gBody.position.x >= borderRight){ //if Claptrap is at a certain x-Position, turn around
			kmh = -Math.abs(kmh);
			gBody.rotation.y += Math.PI; //dreht um 180grad um
			//changeLight();//farbe wird zu zufälligen farbwert geändert
		}
		console.log(kmh);
	}
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

	//Render scene
    gl.render(scene, camera);
	//A Request to the browser, that you want to animate something
	 

    // light.position.x = 20*Math.cos(time);
    // light.position.y = 20*Math.sin(time);    
} //end function draw

// UPDATE RESIZE
function resizeDisplay() {
    const canvas = gl.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width != width || canvas.height != height;
    if (needResize) {
        gl.setSize(width, height, false);
    }
    return needResize;
} //end function resizeDisplay