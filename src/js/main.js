'use strict';

var Sono = require('./lib/sono.min.js'),
    THREE = require('three'),
    ThreeBase = require('./utils/three-base.js'),
    Room = require('./view/room.js'),
    Hero = require('./view/hero.js'),
    Speaker = require('./view/speaker.js'),
    ready = require('usfl').ready;

function ThreeAudio() {
    ThreeBase.call(this, 45);

    //Sono.mute();

    Sono.node.panning.setDefaults({
        distanceModel: 'linear',
        refDistance: 1,
        maxDistance: 1000,
        rolloffFactor: 1
    });

    Sono.load([
        { id: 'close0', url: ['audio/kick-and-snare-close.ogg', 'audio/kick-and-snare-close.mp3'] },
        { id: 'ambience0', url: ['audio/kick-and-snare-ambience.ogg', 'audio/kick-and-snare-ambience.mp3'] },
        { id: 'close1', url: ['audio/mirror-room-close.ogg', 'audio/mirror-room-close.mp3'] },
        { id: 'ambience1', url: ['audio/mirror-room-ambience.ogg', 'audio/mirror-room-ambience.mp3'] },
        { id: 'close2', url: ['audio/piano-close.ogg', 'audio/piano-close.mp3'] },
        { id: 'ambience2', url: ['audio/piano-ambience.ogg', 'audio/piano-ambience.mp3'] }
    ], this.init, null, this);
}

ThreeAudio.prototype = Object.create(ThreeBase.prototype);
ThreeAudio.prototype.constructor = ThreeAudio;

ThreeAudio.prototype.update = function(deltaTime, elapsedTime) {
    this.hero.preUpdate(deltaTime, elapsedTime);

    //var collision = 
    this.hero.collide(this.room.walls);
    /*if(collision) {
        console.log('collide with right wall:', collision === this.room.rightWall);
    }*/
    /*var overlap = this.hero.overlap([this.speaker]);
    if(overlap) {
        //this.room.remove(this.speaker);
        console.log('overlap speaker');
    }*/

    // set listener position and orientation to hero vec
    Sono.node.panning.setListenerOrientation(this.hero.forward);
    Sono.node.panning.setListenerPosition(this.hero.position);

    //this.speaker.scale.x = this.speaker.scale.y = 2 + Math.sin(elapsedTime * 12)/4;
    this.speakers.forEach(function(item) {
        item.update(elapsedTime);
        var distance = item.position.distanceTo(this.hero.position);
        item.toggleNear(distance);
    }, this);

    this.hero.update();
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
    this.room.add(this.hero);
    this.camera.position.set(0, 40, 100);
    this.hero.add(this.camera);
    this.hero.position.set(700, 64, -700);
    this.hero.visible = false;

    var ambientLight = new THREE.AmbientLight(0x222200);
    this.scene.add(ambientLight);

    var light = new THREE.PointLight(0xffffff, 1, 400);
    light.position.set(600, 300, -600);
    this.scene.add(light);

    var x = 500,
        y = 200,
        z = 500;

    this.speakers = [];

    this.speakers[0] = new Speaker(this.scene, x, y, z, 0xFF0000, 'close0', 'ambience0', 'cb0');

    this.speakers[1] = new Speaker(this.scene, -x, y, -z, 0x00FF00, 'close1', 'ambience1', 'cb1');

    this.speakers[2] = new Speaker(this.scene, -x, y, z, 0x0000FF, 'close2', 'ambience2', 'cb2');
    
    var info = document.createElement('p');
    info.innerHTML = 'Use the arrow keys or WASD to move around the room. Space to jump.';
    document.body.appendChild(info);
};

ThreeAudio.prototype.init = function() {
    this.createScene();
    this.render();
};

ready(function() {
    new ThreeAudio();
});
