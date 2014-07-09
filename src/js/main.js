'use strict';

var THREE = require('THREE'),
    ThreeBase = require('./utils/three-base.js'),
    AssetLoader = require('Lib').AssetLoader,
    WebAudio = require('./utils/web-audio.js'),
    Room = require('./view/room.js'),
    Hero = require('./view/hero.js'),
    ready = require('Lib').ready;

function AudioRoom() {
    ThreeBase.call(this, 45);

    this.createScene();
    this.createLights();

    this.camera.position.set(0, 80, 400);

    this.render();

    this.addAudio();
}

AudioRoom.prototype = Object.create(ThreeBase.prototype);
AudioRoom.prototype.constructor = AudioRoom;

AudioRoom.prototype.update = function(deltaTime, elapsedTime) {
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

AudioRoom.prototype.createScene = function() {
    this.room = new Room(512, 2048, 256);
    this.scene.add(this.room);

    var materials = [];
    var faces = ['left', 'right', 'top', 'bottom', 'front', 'back'];
    for ( var i = 0; i < faces.length; i ++ ) {
        materials.push( new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture( 'img/' + faces[i] + '.png') } ) );
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

AudioRoom.prototype.createLights = function() {
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

AudioRoom.prototype.updateAudio = function() {
    if(this.panner) {
        this.audio.helpers.setListenerOrientation(this.hero.forward);
        this.audio.helpers.setListenerPosition(this.hero.position);
        //console.log(this.hero.position.distanceTo(this.speaker.position));
    }
};

AudioRoom.prototype.addAudio = function() {
    this.audio = new WebAudio();
    this.loader = new AssetLoader();
    this.loader.webAudioContext = this.audio.context;
    this.loader.add('./audio/DRUMS' + WebAudio.getExtension());
    this.loader.onChildComplete.add(this.audioLoaded, this);
    this.loader.start();
};

AudioRoom.prototype.audioLoaded = function(file) {
    this.audio.add(file.data);

    this.panner = this.audio.addNode(this.audio.nodeFactory.pan());
    this.panner.distanceModel = 'linear'; // 'linear' 'inverse' 'exponential'
    this.panner.refDistance = 1;
    this.panner.maxDistance = 1000;
    this.panner.rolloffFactor = 1;

    /*this.panner.coneOuterGain = 0.5;
    this.panner.coneOuterAngle = 180;
    this.panner.coneInnerAngle = 0;*/

    // set the audio position to the speaker
    var p = this.speaker.position.clone().normalize();
    this.audio.helpers.setSourcePosition(this.panner, this.speaker.position);
    this.audio.helpers.setSourceOrientation(this.panner, p);

    this.audio.play();
};

ready(function() {
    new AudioRoom();
});
