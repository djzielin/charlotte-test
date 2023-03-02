const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

var asRadians = function(degree){
    return degree*Math.PI/180.0;
}

var createPictureHotspot = function(position, scene, pictureURL){
    var plane = BABYLON.MeshBuilder.CreatePlane("hotspot_plane", {height: 0.5, width: 0.5}, scene);                
    plane.position=position;
    plane.billboardMode=BABYLON.TransformNode.BILLBOARDMODE_Y;                 
    const floatingAdvancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);

    button = BABYLON.GUI.Button.CreateImageOnlyButton("hotspot_icon", "assets/image.svg");
    button.width = "100%";
    button.height = "100%";

     button.onPointerClickObservable.add(() => {
        console.log("user clicked on picture hotspot");

        var plane2 = BABYLON.MeshBuilder.CreatePlane("hotspot_plane", {height: 3, width: 3}, scene);                
        plane2.position=position.add(new BABYLON.Vector3(0,0,1));
        //plane2.rotation=new BABYLON.Vector3(0,asRadians(180),0);
        plane2.billboardMode=BABYLON.TransformNode.BILLBOARDMODE_Y;                 
        const floatingAdvancedTexture2 = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane2);
        
        button2 = BABYLON.GUI.Button.CreateImageOnlyButton("hotspot_picture", pictureURL);
        button2.width = "100%";
        button2.height = "100%";
        floatingAdvancedTexture2.addControl(button2);

          button2.onPointerClickObservable.add(() => {              
              plane2.dispose();
          });
    });     

   floatingAdvancedTexture.addControl(button);
   plane.setEnabled(false);
   return plane;
}

var createMovieHotspot = function(position, scene, movieURL){
    var plane = BABYLON.MeshBuilder.CreatePlane("hotspot_plane", {height: 0.5, width: 0.5}, scene);                
    plane.position=position;
    plane.billboardMode=BABYLON.TransformNode.BILLBOARDMODE_Y;                 
    const floatingAdvancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);

    button = BABYLON.GUI.Button.CreateImageOnlyButton("hotspot_icon", "assets/film.svg");
    button.width = "100%";
    button.height = "100%";

     button.onPointerClickObservable.add(() => {
        console.log("user clicked on movie hotspot");

        var plane2 = BABYLON.MeshBuilder.CreatePlane("hotspot_plane", {height: 3, width: 3}, scene);          
        var vidmat = new BABYLON.StandardMaterial("vidmat", scene);
        vidmat.roughness = 1;
	    vidmat.emissiveColor = new BABYLON.Color3.White();
              
        plane2.position=position.add(new BABYLON.Vector3(0,0,1));
        //plane2.rotation=new BABYLON.Vector3(0,asRadians(180),0);
        plane2.billboardMode=BABYLON.TransformNode.BILLBOARDMODE_Y;                 

        videoTexture = new BABYLON.VideoTexture("vidtex",movieURL, scene);
        vidmat.diffuseTexture=videoTexture;
        videoTexture.video.play();
        plane2.material=vidmat;


        plane2.isPickable = true;
        plane2.actionManager = new BABYLON.ActionManager(scene);
        plane2.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnPickTrigger //OnPointerOverTrigger
                },
                () => {
                    console.log("user clicked the movie plane");

                    plane2.dispose();
                }
            )
        );                             
    });     

   floatingAdvancedTexture.addControl(button);
   

   plane.setEnabled(false);
   return plane;
}

var createAudioHotspot = function(position, scene, audioURL){
    var plane = BABYLON.MeshBuilder.CreatePlane("hotspot_plane", {height: 0.5, width: 0.5}, scene);                
    plane.position=position;
    plane.billboardMode=BABYLON.TransformNode.BILLBOARDMODE_Y;                 
    const floatingAdvancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);

    button = BABYLON.GUI.Button.CreateImageOnlyButton("hotspot_icon", "assets/headphones.svg");
    button.width = "100%";
    button.height = "100%";

    const music = new BABYLON.Sound("audio_for_hotspot", audioURL, scene, function () {
        // Sound has been downloaded & decoded     
        console.log("sound has been downloaded and decoded");     
    });                

    button.onPointerClickObservable.add(() => {
        BABYLON.Engine.audioEngine.unlock();
        console.log("user clicked on audio hotspot");
        music.stop();
        music.play();     
    });     

   floatingAdvancedTexture.addControl(button);
   plane.setEnabled(false);
   return plane;
}

const createScene = function () {
    console.log("trying to create the scene!");

    // Create a scene.
    const scene = new BABYLON.Scene(engine);

    ///////////////////////////////////
    // CAMERA
    ///////////////////////////////////
    const camera = new BABYLON.ArcRotateCamera("Camera", asRadians(60), asRadians(90), 15, new BABYLON.Vector3(-5, 2, 0), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit=5;           //zoom ranges 
    camera.upperRadiusLimit=30;
    camera.lowerBetaLimit=asRadians(45); //up,down limits
    camera.upperBetaLimit=asRadians(90);
    camera.lowerAlphaLimit=asRadians(30); //left,right limits
    camera.upperAlphaLimit=asRadians(150);
    camera.angularSensibilityX=4000;
    camera.angularSensibilityY=4000;

    ///////////////////////////////////
    // LIGHTING
    ///////////////////////////////////
    //var light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(-1, 1, 0), scene);
    //var light = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(-5, 10, 0), new BABYLON.Vector3(0, -1, -1), Math.PI / 2, 30, scene);
    //var light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 0, 0), scene);
    const light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-0.3, -0.5, -0.8), scene);   

    ///////////////////////////////////
    // SKYBOX
    ///////////////////////////////////
	const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
	const skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
	skyboxMaterial.backFaceCulling = false;
	skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/textures/TropicalSunnyDay", scene);
	skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
	skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
	skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
	skybox.material = skyboxMaterial;	
    skybox.setEnabled(false);

    //////////////////////////////////
    // SKYBOX BUTTON
    /////////////////////////////////
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const button = BABYLON.GUI.Button.CreateSimpleButton("skybutton", "Toggle Skybox");
    button.width = 0.2;
    button.height = "40px";
    button.color = "white";
    button.background = "green";
    button.cornerRadius = 20;
    button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    advancedTexture.addControl(button);    

    button.onPointerUpObservable.add(function() {
        var currentStatus=skybox.isEnabled();
        skybox.setEnabled(!currentStatus);  
    });

    ///////////////////////////////////
    // GROUND
    ///////////////////////////////////
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100, subdivisions:10  }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
    groundMaterial.diffuseColor=new BABYLON.Color3(0.5,0.5,0.5);
    ground.material=groundMaterial;

    ///////////////////////////////////
    // MODEL
    ///////////////////////////////////
    BABYLON.SceneLoader.Append("assets/", 
        "savoy.glb", scene, function (scene) {
       
        //do any post-load actions here
    });    

    const hotspotArray=[];
    hotspotArray.push(createPictureHotspot(new BABYLON.Vector3(-1,5,0.25),scene,"assets/savoy.jpg"));
    hotspotArray.push(createAudioHotspot(new BABYLON.Vector3(-2,5,0.25), scene,"assets/place_holder.mp3"));
    hotspotArray.push(createMovieHotspot(new BABYLON.Vector3(-3,5,0.25), scene,"assets/bunny.mp4"));

    //////////////////////////////////
    // SKYBOX BUTTON
    /////////////////////////////////
    const button2 = BABYLON.GUI.Button.CreateSimpleButton("hotbutton", "Toggle Hotspots");
    button2.width = 0.2;
    button2.top = "-50px";
    button2.height = "40px";
    button2.color = "white";
    button2.background = "green";
    button2.cornerRadius = 20;
    button2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    button2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    advancedTexture.addControl(button2);  

    button2.onPointerUpObservable.add(function() {
        const currentStatus=hotspotArray[0].isEnabled();
        for(const hs of hotspotArray){
            hs.setEnabled(!currentStatus);
        }  
    });  

    return scene;
};

const scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
        scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});