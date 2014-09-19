'use strict';

var usfl = require('usfl'),
    THREE = require('three'),
    Input = require('../utils/key-input.js');

function Hero(materials) {
    var material = (materials instanceof Array) ? new THREE.MeshFaceMaterial(materials) : materials;
    if(!material) { material = new THREE.MeshLambertMaterial({ color: '#0000ff' }); }
    THREE.Mesh.call(this, new THREE.BoxGeometry(64, 64, 64), material);

    this.groundedY = 64;
    this.position.y = this.groundedY;

    this.maxSpeed = 10;
    this.rotSpeed = 0.05;

    this.front = new THREE.Vector3(0, 0, 1);
    this.back = new THREE.Vector3(0, 0, -1);
    this.left = new THREE.Vector3(-1, 0, 0);
    this.right = new THREE.Vector3(1, 0, 0);
    this.up = new THREE.Vector3(0, 1, 0);
    this.down = new THREE.Vector3(0, -1, 0);

    this.angleOffset = Math.PI;
    this.angle = Math.PI * 0.75; // 45
    this.quaternion.setFromAxisAngle(this.up, this.angle);

    this.forward = new THREE.Vector3(0, 0, -1);
    this.forward.applyQuaternion(this.quaternion);

    this.velocity = new THREE.Vector3(0, 0, 0);

    this.raycaster = new THREE.Raycaster();
    this.rays = [this.front, this.back, this.left, this.right, this.up, this.down];
}

Hero.prototype = Object.create(THREE.Mesh.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.preUpdate = function(deltaTime, elapsedTime) {

    if(Input.left()) {
        this.angle += this.rotSpeed;
    }
    else if(Input.right()) {
        this.angle -= this.rotSpeed;
    }
    this.quaternion.setFromAxisAngle(this.up, this.angle);
    this.forward.set(0, 0, -1);
    this.forward.applyQuaternion(this.quaternion);

    if(Input.up()) {
        this.velocity.z = usfl.math.lerp(this.velocity.z, this.maxSpeed, 0.2);
    }
    else if(Input.down()) {
        this.velocity.z = usfl.math.lerp(this.velocity.z, -this.maxSpeed, 0.2);
    }
    else {
        this.velocity.z *= 0.5;
    }

    // strafe would be velocity x

    // jumping and gravity

    if(!this.jumping && Input.key.space()) {
        this.velocity.y = 10;
        this.jumping = true;
        this.jumpedAt = elapsedTime;
    }

    if(this.jumping && elapsedTime - this.jumpedAt > 1) {
        this.jumping = false;
    }
    var gravity = -400;
    var step = deltaTime * 0.05;
    this.velocity.y += gravity * step;
};

Hero.prototype.update = function() {
    this.forward.x *= this.velocity.z;
    this.forward.z *= this.velocity.z;

    this.forward.y = this.velocity.y;
    this.position.add(this.forward);

    // quick collide with floor
    if(this.position.y < this.groundedY) {
        this.position.y = this.groundedY;
        this.velocity.y = 0;
    }
};

Hero.prototype.collide = function(collidableMeshList) {
    var bounce = 2;

    var object = this.overlap(collidableMeshList);
    if(object) {
        var inFront = this.forward.dot(object.position) > 0;
        if(inFront && this.velocity.z > 0) {
            //this.velocity.z = 0;
            this.velocity.z *= -bounce;
        }
        else if(!inFront && this.velocity.z < 0) {
            //this.velocity.z = 0;
            this.velocity.z *= -bounce;
        }
        return object;
    }

    return null;
};

Hero.prototype.overlap = function(overlapMeshList) {
    for (var i = 0; i < this.geometry.vertices.length; i++) {
        var localVertex = this.geometry.vertices[i].clone();
        var globalVertex = localVertex.applyMatrix4(this.matrix);
        var directionVector = globalVertex.sub(this.position);
        var minDistance = directionVector.length();

        this.raycaster.set(this.position, directionVector.normalize());
        var collisions = this.raycaster.intersectObjects(overlapMeshList);
        if(collisions.length > 0 && collisions[0].distance < minDistance) {
            var object = collisions[0].object;
            return object;
        }
    }
    return null;
};


module.exports = Hero;
