'use strict';

var Sono = require('./lib/sono.js'),
    THREE = require('THREE'),
    ThreeBase = require('./utils/three-base.js'),
    Room = require('./view/room.js'),
    Hero = require('./view/hero.js'),
    ready = require('Lib').ready;

function ThreeAudio() {
    ThreeBase.call(this, 45);

    this.createScene();
    this.createLights();
    this.createAudio();

    this.camera.position.set(0, 80, 400);

    this.render();
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

    this.speaker.scale.x = this.speaker.scale.y = 2 + Math.sin(elapsedTime * 12)/4;

    this.hero.update();
};

ThreeAudio.prototype.createScene = function() {
    this.room = new Room(512, 2048, 256);
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

    this.speaker = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 16), new THREE.MeshPhongMaterial({ color: 0x22ee22 }));
    this.speaker.position.set(-100, 24, 200);
    this.room.add(this.speaker);

    var info = document.createElement('p');
    info.innerHTML = 'Use the arrow keys or WASD to move around the room. Space to jump.';
    document.body.appendChild(info);
};

ThreeAudio.prototype.createLights = function() {
    this.light = new THREE.PointLight(0xffffff, 1, 2000);
    this.light.position.set(50, 64, 1024);
    this.scene.add(this.light);

    this.scene.add(new THREE.PointLightHelper(this.light, 30));

    this.ambientLight = new THREE.AmbientLight(0x222200);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0x444444);
    this.directionalLight.position.set(1, 0, 1).normalize();
    this.scene.add(this.directionalLight);
};

ThreeAudio.prototype.createAudio = function() {
    this.sound = Sono.load('drums', ['audio/DRUMS.ogg', 'audio/DRUMS.mp3'], true);
    // add a panner node
    var panner = this.sound.addNode(Sono.create.pan());
    panner.distanceModel = 'linear'; // 'linear' 'inverse' 'exponential'
    panner.refDistance = 1;
    panner.maxDistance = 1000;
    panner.rolloffFactor = 1;
    /*panner.coneOuterGain = 0.5;
    panner.coneOuterAngle = 180;
    panner.coneInnerAngle = 0;*/
    // get pan helper util
    this.pan = Sono.utils.panHandler(panner);
    // set the audio position and orientation to forward vec of speaker
    var p = this.speaker.position.clone().normalize();
    this.pan.setSourcePosition(this.speaker.position);
    this.pan.setSourceOrientation(p);
    // play
    this.sound.play();
};

ThreeAudio.prototype.updateAudio = function() {
    // set listener position and orientation to hero vec
    this.pan.setListenerOrientation(this.hero.forward);
    this.pan.setListenerPosition(this.hero.position);
};

ready(function() {
    new ThreeAudio();
});
