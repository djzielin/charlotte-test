/* Web-Based-VR-Tutorial Project Template
* Author: Evan Suma Rosenberg <suma@umn.edu> and Blair MacIntyre <blair@cc.gatech.edu>
* License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
*/

// Extended by David J. Zielinski

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core";
import { ArcRotateCamera } from "@babylonjs/core";
import { TransformNode } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Color3 } from "@babylonjs/core/Maths/math";
import { Color4 } from "@babylonjs/core/Maths/math";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { AdvancedDynamicTexture } from "@babylonjs/gui";
import { Control } from "@babylonjs/gui";
import { Sound } from "@babylonjs/core";
import { SceneLoader } from "@babylonjs/core";
import { StandardMaterial } from "@babylonjs/core";
import { VideoTexture } from "@babylonjs/core";
import { CubeTexture } from "@babylonjs/core";
import { Texture } from "@babylonjs/core";
import { ActionManager } from "@babylonjs/core";
import { ExecuteCodeAction } from "@babylonjs/core";

import "@babylonjs/core/Materials/standardMaterial"
import "@babylonjs/inspector";

import TileSet from "babylonjs-mapping";
import BuildingsOSM from "babylonjs-mapping/lib/BuildingsOSM";

class Game {
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    private scene: Scene;

    private assetRootURL="https://virtualblackcharlotte.com/dev/babylonjs/savoy/assets/";

    asRadians(degree: number): number {
        return degree * Math.PI / 180.0;
    }

    createPictureHotspot(position: Vector3, scene: Scene, pictureURL: string): Mesh {
        var plane = MeshBuilder.CreatePlane("hotspot_plane", { height: 0.5, width: 0.5 }, scene);
        plane.position = position;
        plane.billboardMode = TransformNode.BILLBOARDMODE_Y;
        const floatingAdvancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

        var button = Button.CreateImageOnlyButton("hotspot_icon", this.assetRootURL+"image.svg");
        button.width = "100%";
        button.height = "100%";

        button.onPointerClickObservable.add(() => {
            console.log("user clicked on picture hotspot");

            var plane2 = MeshBuilder.CreatePlane("hotspot_plane", { height: 3, width: 3 }, scene);
            plane2.position = position.add(new Vector3(0, 0, 1));
            //plane2.rotation=new Vector3(0,asRadians(180),0);
            plane2.billboardMode = TransformNode.BILLBOARDMODE_Y;
            const floatingAdvancedTexture2 = AdvancedDynamicTexture.CreateForMesh(plane2);

            var button2 = Button.CreateImageOnlyButton("hotspot_picture", pictureURL);
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

    createMovieHotspot(position: Vector3, scene: Scene, movieURL: string): Mesh {
        var plane = MeshBuilder.CreatePlane("hotspot_plane", { height: 0.5, width: 0.5 }, scene);
        plane.position = position;
        plane.billboardMode = TransformNode.BILLBOARDMODE_Y;
        const floatingAdvancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

        var button = Button.CreateImageOnlyButton("hotspot_icon", this.assetRootURL+"film.svg");
        button.width = "100%";
        button.height = "100%";

        button.onPointerClickObservable.add(() => {
            console.log("user clicked on movie hotspot");

            var plane2 = MeshBuilder.CreatePlane("hotspot_plane", { height: 3, width: 3 }, scene);
            var vidmat = new StandardMaterial("vidmat", scene);
            vidmat.roughness = 1;
            vidmat.emissiveColor = Color3.White();

            plane2.position = position.add(new Vector3(0, 0, 1));
            //plane2.rotation=new Vector3(0,asRadians(180),0);
            plane2.billboardMode = TransformNode.BILLBOARDMODE_Y;

            var videoTexture = new VideoTexture("vidtex", movieURL, scene);
            vidmat.diffuseTexture = videoTexture;
            videoTexture.video.play();
            plane2.material = vidmat;


            plane2.isPickable = true;
            plane2.actionManager = new ActionManager(scene);
            plane2.actionManager.registerAction(
                new ExecuteCodeAction(
                    {
                        trigger: ActionManager.OnPickTrigger //OnPointerOverTrigger
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

    createAudioHotspot(position: Vector3, scene: Scene, audioURL: string): Mesh {
        var plane = MeshBuilder.CreatePlane("hotspot_plane", { height: 0.5, width: 0.5 }, scene);
        plane.position = position;
        plane.billboardMode = TransformNode.BILLBOARDMODE_Y;
        const floatingAdvancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

        var button = Button.CreateImageOnlyButton("hotspot_icon", this.assetRootURL+"headphones.svg");
        button.width = "100%";
        button.height = "100%";

        const music = new Sound("audio_for_hotspot", audioURL, scene, function () {
            // Sound has been downloaded & decoded     
            console.log("sound has been downloaded and decoded");
        });

        button.onPointerClickObservable.add(() => {
            console.log("user clicked on audio hotspot");
            music.stop();
            music.play();
        });

        floatingAdvancedTexture.addControl(button);
        plane.setEnabled(false);
        return plane;
    }

    constructor() {
        // Get the canvas element 
        this.canvas = document.getElementById("renderCanvas2") as HTMLCanvasElement;

        // Generate the BABYLON 3D engine
        this.engine = new Engine(this.canvas, true);

        // Creates a basic Babylon Scene object
        this.scene = new Scene(this.engine);
    }

    start(): void {
        // Create the scene and then execute this function afterwards
        this.createScene().then(() => {

            // Register a render loop to repeatedly render the scene
            this.engine.runRenderLoop(() => {
                this.update();
                this.scene.render();
            });

            // Watch for browser/canvas resize events
            window.addEventListener("resize", () => {
                this.engine.resize();
            });
        });
    }

    private async createScene() {
        // Create a scene.
        this.scene = new Scene(this.engine);

        ///////////////////////////////////
        // CAMERA
        ///////////////////////////////////
        var camera = new ArcRotateCamera("Camera", this.asRadians(60), this.asRadians(90), 15, new Vector3(-5, 2, 0), this.scene);
        camera.attachControl(this.canvas, true);
        camera.lowerRadiusLimit = 5;           //zoom ranges 
        camera.upperRadiusLimit = 30;
        camera.lowerBetaLimit = this.asRadians(45); //up,down limits
        camera.upperBetaLimit = this.asRadians(90);
        camera.lowerAlphaLimit = this.asRadians(30); //left,right limits
        camera.upperAlphaLimit = this.asRadians(150);
        camera.angularSensibilityX = 6000;
        camera.angularSensibilityY = 6000;


        ///////////////////////////////////
        // LIGHTING
        ///////////////////////////////////
        //var light = new HemisphericLight("hemiLight", new Vector3(-1, 1, 0), scene);
        //var light = new SpotLight("spotLight", new Vector3(-5, 10, 0), new Vector3(0, -1, -1), Math.PI / 2, 30, scene);
        //var light = new PointLight("pointLight", new Vector3(0, 0, 0), scene);
        var light = new DirectionalLight("DirectionalLight", new Vector3(-0.3, -0.5, -0.8), this.scene);

        ///////////////////////////////////
        // SKYBOX
        ///////////////////////////////////
        var skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, this.scene);
        var skyboxMaterial = new StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new CubeTexture(this.assetRootURL+"textures/TropicalSunnyDay", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
        skybox.setEnabled(false);

        //////////////////////////////////
        // SKYBOX BUTTON
        /////////////////////////////////
        var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        var button = Button.CreateSimpleButton("skybutton", "Toggle Skybox");
        button.width = 0.1;
        button.height = "40px";
        button.color = "white";
        button.background = "green";
        button.cornerRadius = 20;
        button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        button.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        advancedTexture.addControl(button);

        button.onPointerUpObservable.add(function () {
            var currentStatus = skybox.isEnabled();
            skybox.setEnabled(!currentStatus);
        });

        ///////////////////////////////////
        // GROUND
        ///////////////////////////////////
        const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100, subdivisions: 10 }, this.scene);
        var groundMaterial = new StandardMaterial("groundMat", this.scene);
        groundMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
        ground.material = groundMaterial;

        ///////////////////////////////////
        // MODEL
        ///////////////////////////////////

        SceneLoader.Append(this.assetRootURL, "savoy.glb", this.scene,
            (scene) => {
                //do any post-load actions here
                /*var mat = new StandardMaterial("mat2", scene);
                mat.diffuseColor=new Color3(0.5,0.5,0.5);
                mat.emissiveColor=new Color3(0.3,0.3,0.3);
        
                var ourModel=scene.getMeshByName("__root__"); //overwrite all textures
                if(ourModel){
                    console.log("found the sketchup model");
                    var children=ourModel.getChildMeshes();
                    console.log("number of children: " + children.length);
        
                    for(const child of children){
                        console.log("child: " + child.name);
                        child.material=mat;
                    }
                }*/
            });


        let hotspotArray: Mesh[] = [];
        hotspotArray.push(this.createPictureHotspot(new Vector3(-1, 5, 0.25), this.scene, this.assetRootURL+"savoy.jpg"));
        hotspotArray.push(this.createAudioHotspot(new Vector3(-2, 5, 0.25), this.scene, this.assetRootURL+"place_holder.mp3"));
        hotspotArray.push(this.createMovieHotspot(new Vector3(-3, 5, 0.25), this.scene, this.assetRootURL+"bunny.mp4"));


        //////////////////////////////////
        // SKYBOX BUTTON
        /////////////////////////////////
        var button2 = Button.CreateSimpleButton("hotbutton", "Toggle Hotspots");
        button2.width = 0.1;
        button2.top = "-50px";
        button2.height = "40px";
        button2.color = "white";
        button2.background = "green";
        button2.cornerRadius = 20;
        button2.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        button2.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        advancedTexture.addControl(button2);

        button2.onPointerUpObservable.add(function () {
            Engine.audioEngine?.unlock();

            var currentStatus = hotspotArray[0].isEnabled();
            for (const hs of hotspotArray) {
                hs.setEnabled(!currentStatus);
            }
        });

        //
    }

    private update(): void {

    }

}
/******* End of the Game class ******/

// start the game
var game = new Game();
game.start();


