'use strict';

var Sono = require('../lib/sono.min.js'),
    THREE = require('THREE');

function Speaker(scene, sounds, x, y, z) {

    // mesh
    var speaker = new THREE.Mesh(new THREE.SphereGeometry(16, 16, 16), new THREE.MeshPhongMaterial({ color: 0x22ee22 }));
    speaker.position.set(x, y, z);
    scene.add(speaker);

    // light
    var light = new THREE.PointLight(0xffffff, 1, 900);
    light.position.set(x, y - 150, z);
    scene.add(light);

    // sound
    var sound = Sono.createSound(sounds);
    sound.loop = true;
    // add a panner node
    var pan = sound.node.panner();
    // set the audio position and orientation to forward vec of speaker
    pan.setSourcePosition(speaker.position);
    pan.setSourceOrientation(speaker.position.clone().normalize());
    // play
    sound.play();

    function update(elapsedTime) {
        speaker.scale.x = speaker.scale.y = 2 + Math.sin(elapsedTime * 12)/4;
    }

    return Object.freeze({
        update: update
    });
}

module.exports = Speaker;
