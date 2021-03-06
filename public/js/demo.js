var gyro = [0, 0, 0, 0];
var degtorad = Math.PI / 180;

var refX = 0;
var distX = 0;


function inverseQuaternion(q)
{
	return {"x":q.x,"y":q.y,"z":q.z,"w": -q.w};
}

function computeOrientationQuaternion() {

	var quaternion = gyro;
	
	var invertedQ=inverseQuaternion(quaternion);
	return invertedQ;
}


function computeQuaternionFromEulers(alpha,beta,gamma)//Alpha around Z axis, beta around X axis and gamma around Y axis intrinsic local space in that order(each axis moves depending on how the other moves so processing order is important)
{

	
	var _x = beta * degtorad ; // beta value
	var _y = gamma * degtorad ; // gamma value
	var _z = alpha * degtorad ; // alpha value

	var cX = Math.cos( _x/2 );
	var cY = Math.cos( _y/2 );
	var cZ = Math.cos( _z/2 );
	var sX = Math.sin( _x/2 );
	var sY = Math.sin( _y/2 );
	var sZ = Math.sin( _z/2 );

	//
	// ZXY quaternion construction.
	//

	var w = cX * cY * cZ - sX * sY * sZ;
	var x = sX * cY * cZ - cX * sY * sZ;
	var y = cX * sY * cZ + sX * cY * sZ;
	var z = cX * cY * sZ + sX * sY * cZ;

	//return [ w, x, y, z ];
	return {"x":x,"y":y,"z":z,"w":w};//return a simple object with the four quaternion values
	
}

var DEMO = {

	ms_Canvas: null,
	ms_Renderer: null,
	ms_Camera: null, 
	ms_Scene: null, 
	ms_Plane: null,
	ms_Canoa: null,
	ms_Time: null,
	ms_stats: null,
	ms_socket: null,


    enable: (function enable() {
        try {
            var aCanvas = document.createElement('canvas');
            return !! window.WebGLRenderingContext && (aCanvas.getContext('webgl') || aCanvas.getContext('experimental-webgl'));
        }
        catch(e) {
            return false;
        }
    })(),

	
	initialize: function initialize(inIdCanvas) {
		this.ms_Canvas = $('#'+inIdCanvas);
		
		// Initialize Renderer, Camera and Scene
		this.ms_Renderer = this.enable? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.ms_Scene = new THREE.Scene();
		
		this.ms_Camera = new THREE.PerspectiveCamera(55.0, WINDOW.ms_Width / WINDOW.ms_Height, 0.5, 3000000);
		this.ms_Camera.position.set(0, 1000, 0);
		this.ms_Camera.lookAt(new THREE.Vector3(0, 0, 0));
		this.ms_Camera.rotation.z = Math.PI / 2;
	
		// Add light
		var directionalLight = new THREE.DirectionalLight(0xffff55, 1);
		directionalLight.position.set(0, 500, 1000);
		this.ms_Scene.add(directionalLight);
		
		// Create the water plane
		var planeTexture, planeMaterial;

		planeTexture = THREE.ImageUtils.loadTexture( "../img/fondo.png" )
		planeTexture.minFilter = THREE.NearestFilter;

		planeMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, map: planeTexture } );
		//planeMaterial = new THREE.MeshPhongMaterial({color: 'white'});

		//material = new THREE.MeshLambertMaterial({color: 0xffffff});
		this.ms_Plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1920, 1080), planeMaterial);
		// plane.position.x = 0;
		// plane.position.y = 0;
		// plane.position.z = 0;

		// rotation.z is rotation around the z-axis, measured in radians (rather than degrees)
		// Math.PI = 180 degrees, Math.PI / 2 = 90 degrees, etc.

		this.ms_Scene.add(this.ms_Plane);
		this.ms_Plane.rotation.y = Math.PI / 2;


		// create a cube
        var cubeGeometry = new THREE.BoxGeometry(1920, 1080, 2);
        var cubeMaterial = new THREE.MeshPhongMaterial({color: 'red'});
        this.ms_Canoa = new THREE.Mesh(cubeGeometry, cubeMaterial);

        this.ms_Canoa.castShadow = true;
        //this.ms_Canoa.rotation.z = - Math.PI * 0.5;

        // add the cube to the scene
        this.ms_Scene.add(this.ms_Canoa);

		this.ms_Time = 0;

		this.ms_socket = io();

  		this.ms_socket.on('acc', function(msg){
		    var acc =  [Math.floor(msg[0]), Math.floor(msg[1]), Math.floor(msg[2])];
		    gyro=computeQuaternionFromEulers(acc[0], acc[1], acc[2]);
	    });

        this.ms_stats = new Stats();
        this.ms_stats.setMode(0);

        this.ms_stats.domElement.style.position = 'absolute';
        this.ms_stats.domElement.style.left = '0px';
        this.ms_stats.domElement.style.top = '0px';

        document.body.appendChild( this.ms_stats.domElement );		

	},



    display: function display() {
		this.ms_Renderer.render(this.ms_Scene, this.ms_Camera);
		if (gyro != undefined) document.getElementById("Acceleration").innerHTML = "X: " + this.ms_Canoa.rotation.x + " Y: " + this.ms_Canoa.rotation.y + " Z: " + this.ms_Canoa.rotation.z;
	},
	
	update: function update() {
		this.ms_Time += 0.007;
		
		// var q=computeOrientationQuaternion(); //w,x,y,z
		// var quot = new THREE.Quaternion(); 
		// quot.set(q.x,q.y,q.z,q.w);//x,y,z,w

		// this.ms_Canoa.setRotationFromQuaternion(quot);

		// if (this.ms_Canoa.rotation.x > refX) {
		// 	distX = (this.ms_Canoa.rotation.x - refX) * 50;
		// 	console.log(this.ms_Canoa.position.z);
		// }
		// else distX = 0;
		// refX = this.ms_Canoa.rotation.x;



		// this.ms_Canoa.position.z = this.ms_Canoa.position.z + distX;

		// this.ms_Camera.position.z = this.ms_Canoa.position.z;

		this.ms_Plane.rotation.z += 1;


		this.display();
		this.ms_stats.update();

	},
	
	resize: function resize(inWidth, inHeight) {
		this.ms_Camera.aspect =  inWidth / inHeight;
		this.ms_Camera.updateProjectionMatrix();
		this.ms_Renderer.setSize(inWidth, inHeight);
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.display();
	}

};