'use strict';

var Sono = require('../lib/sono.min.js'),
    THREE = require('three'),
    usfl = require('usfl');

function Speaker(scene, x, y, z, color, closeId, ambienceId, cbId) {

    // mesh
    var speaker = new THREE.Mesh(new THREE.SphereGeometry(16, 16, 16), new THREE.MeshPhongMaterial({ color: color }));
    speaker.position.set(x, y, z);
    scene.add(speaker);

    // light
    var light = new THREE.PointLight(0xffffff, 1, 900);
    light.position.set(x, y - 150, z);
    scene.add(light);

    var lightB = new THREE.PointLight(0xffffff, 1, 300);
    lightB.position.set(x, y + 150, z);
    scene.add(lightB);

    // close
    var close = Sono.getById(closeId);
    close.loop = true;
    var pan = close.node.panner();
    // set the audio position and orientation to forward vec of speaker
    pan.setSourcePosition(speaker.position);
    pan.setSourceOrientation(speaker.position.clone().normalize());
    // play
    close.play();

    var ambience = Sono.getById(ambienceId);
    ambience.loop = true;
    var panB = ambience.node.panner();
    // set the audio position and orientation to forward vec of speaker
    panB.setSourcePosition(speaker.position);
    panB.setSourceOrientation(speaker.position.clone().normalize());
    // play
    ambience.play();

    close.volume = 0;
    ambience.volume = 0;

    var cb = document.getElementById(cbId);
    cb.addEventListener('click', function() {
        if(!this.checked) {
            close.pause();
            ambience.pause();
        } else {
            close.play();
            ambience.play();
        }
    });

    function update(elapsedTime) {
        speaker.scale.x = speaker.scale.y = speaker.scale.z = 2 + Math.sin(elapsedTime * 12)/4;
    }

    function toggleNear(distance) {
        var x = usfl.math.map(distance, 400, 1000, 0, 1);
        x = usfl.math.clamp(x, 0, 1);
        close.volume = 1 - x;
        ambience.volume = x;
    }

    return Object.freeze({
        update: update,
        position: speaker.position,
        toggleNear: toggleNear
    });
}

module.exports = Speaker;
