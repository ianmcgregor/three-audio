'use strict';

var Sono = require('./lib/sono.min.js'),
    THREE = require('THREE'),
    ThreeBase = require('./utils/three-base.js'),
    Room = require('./view/room.js'),
    Hero = require('./view/hero.js'),
    Speaker = require('./view/speaker.js'),
    ready = require('Lib').ready;

function ThreeAudio() {
    ThreeBase.call(this, 45);

    this.createScene();
    //this.createLights();
    //this.createAudio();

    this.camera.position.set(0, 40, 100);

    this.render();

    //Sono.mute();

    Sono.node.panning.setDefaults({
        distanceModel: 'linear',
        refDistance: 1,
        maxDistance: 1000,
        rolloffFactor: 1
    });
}

ThreeAudio.prototype = Object.create(ThreeBase.prototype);
ThreeAudio.prototype.constructor = ThreeAudio;

ThreeAudio.prototype.update = function(deltaTime, elapsedTime) {
    this.hero.preUpdate(deltaTime, elapsedTime);

    var collision = this.hero.collide(this.room.walls);
    if(collision) {
        console.log('collide with right wall:', collision === this.room.rightWall);
    }
    var overlap = this.hero.overlap([this.speaker]);
    if(overlap) {
        //this.room.remove(this.speaker);
        console.log('overlap speaker');
    }

    this.updateAudio();

    //this.speaker.scale.x = this.speaker.scale.y = 2 + Math.sin(elapsedTime * 12)/4;
    this.speakers.forEach(function(item) {
        item.update(elapsedTime);
    });

    this.hero.update();

    this.hero.add(this.camera);

    this.hero.visible = false;

    //this.camera.quaternion.copy(this.hero.quaternion);
    //this.camera.position.set(this.hero.position.x, this.hero.position.y + 128, this.hero.position.z - 256);
    //this.camera.lookAt(this.hero.position);
    ////this.camera.quaternion.inverse();
};

ThreeAudio.prototype.createScene = function() {
    this.room = new Room(2048, 2048, 512);
    this.scene.add(this.room);

    var materials = [];
    var faces = ['left', 'right', 'top', 'bottom', 'front', 'back'];
    for ( var i = 0; i < faces.length; i ++ ) {
        var tex = THREE.ImageUtils.loadTexture( 'img/' + faces[i] + '.png');
        var mat = new THREE.MeshPhongMaterial({ map: tex });
        materials.push(mat);
    }

    this.hero = new Hero(materials);
    this.hero.position.z = 64;
    this.room.add(this.hero);

    this.ambientLight = new THREE.AmbientLight(0x222200);
    this.scene.add(this.ambientLight);

    var x = 500,
        y = 200,
        z = 500;

    this.speakers = [
        new Speaker(this.scene, ['audio/DRUMS.ogg', 'audio/DRUMS.mp3'], x, y, z),
        new Speaker(this.scene, ['audio/DRUMS.ogg', 'audio/DRUMS.mp3'], -x, y, -z),
        new Speaker(this.scene, ['audio/DRUMS.ogg', 'audio/DRUMS.mp3'], -x, y, z),
        new Speaker(this.scene, ['audio/DRUMS.ogg', 'audio/DRUMS.mp3'], x, y, -z)
    ];

    /*this.speaker = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 16), new THREE.MeshPhongMaterial({ color: 0x22ee22 }));
    this.speaker.position.set(-100, 24, 200);
    this.room.add(this.speaker);
*/
    var info = document.createElement('p');
    info.innerHTML = 'Use the arrow keys or WASD to move around the room. Space to jump.';
    document.body.appendChild(info);
};

ThreeAudio.prototype.createLights = function() {
    /*var lightY = 200,
        lightPos = 500,
        lightAmt = 900,
        lightCol = 0xffffff;

    var light = new THREE.PointLight(lightCol, 1, lightAmt);
    light.position.set(lightPos, lightY, lightPos);
    this.scene.add(light);

    var lightB = new THREE.PointLight(lightCol, 1, lightAmt);
    lightB.position.set(-lightPos, lightY, -lightPos);
    this.scene.add(lightB);

    var lightC = new THREE.PointLight(lightCol, 1, lightAmt);
    lightC.position.set(-lightPos, lightY, lightPos);
    this.scene.add(lightC);

    var lightD = new THREE.PointLight(lightCol, 1, lightAmt);
    lightD.position.set(lightPos, lightY, -lightPos);
    this.scene.add(lightD);

    this.ambientLight = new THREE.AmbientLight(0x222200);
    this.scene.add(this.ambientLight);
    
    this.scene.add(new THREE.PointLightHelper(light, 30));
    this.scene.add(new THREE.PointLightHelper(lightB, 30));
    this.scene.add(new THREE.PointLightHelper(lightC, 30));
    this.scene.add(new THREE.PointLightHelper(lightD, 30));*/

    /*this.directionalLight = new THREE.DirectionalLight(0x444444);
    this.directionalLight.position.set(1, 1, 0).normalize();
    this.scene.add(this.directionalLight);*/
};

ThreeAudio.prototype.createAudio = function() {
/*    this.sound = Sono.createSound(['audio/DRUMS.ogg', 'audio/DRUMS.mp3']);
    this.sound.loop = true;
    // add a panner node
    this.pan = this.sound.node.panner();
    this.pan.node.distanceModel = 'linear'; // 'linear' 'inverse' 'exponential'
    this.pan.node.refDistance = 1;
    this.pan.node.maxDistance = 1000;
    this.pan.node.rolloffFactor = 1;
    
    // get pan helper util
    //this.pan = Sono.utils.pan(panner);
    // set the audio position and orientation to forward vec of speaker
    this.pan.setSourcePosition(this.speaker.position);
    var o = this.speaker.position.clone().normalize();
    this.pan.setSourceOrientation(o);
    // play
    this.sound.play();
    */
};

ThreeAudio.prototype.updateAudio = function() {
    // set listener position and orientation to hero vec
    console.log(Sono.node.panning);
    Sono.node.panning.setListenerOrientation(this.hero.forward);
    Sono.node.panning.setListenerPosition(this.hero.position);
};

ready(function() {
    new ThreeAudio();
});
