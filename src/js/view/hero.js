'use strict';

var Lib = require('Lib'),
    THREE = require('THREE'),
    KeyInput = require('../utils/key-input.js');

function Hero(materials) {
    var material = (materials instanceof Array) ? new THREE.MeshFaceMaterial(materials) : materials;
    if(!material) { material = new THREE.MeshLambertMaterial({ color: '#0000ff' }); }
    THREE.Mesh.call(this, new THREE.BoxGeometry(64, 64, 64), material);

    this.groundedY = 32;
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
    this.angle = -Math.PI / 4; // 45
    this.quaternion.setFromAxisAngle(this.up, this.angle);

    this.forward = new THREE.Vector3(0, 0, 1);
    this.forward.applyQuaternion(this.quaternion);

    this.velocity = new THREE.Vector3(0, 0, 0);

    this.raycaster = new THREE.Raycaster();
    this.rays = [this.front, this.back, this.left, this.right, this.up, this.down];
}

Hero.prototype = Object.create(THREE.Mesh.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.preUpdate = function(deltaTime, elapsedTime) {

    if(KeyInput.left()) {
        this.angle += this.rotSpeed;
    }
    else if(KeyInput.right()) {
        this.angle -= this.rotSpeed;
    }
    this.quaternion.setFromAxisAngle(this.up, this.angle);
    this.forward.set(0, 0, 1);
    this.forward.applyQuaternion(this.quaternion);

    if(KeyInput.up()) {
        this.velocity.z = Lib.MathUtils.lerp(this.velocity.z, this.maxSpeed, 0.2);
    }
    else if(KeyInput.down()) {
        this.velocity.z = Lib.MathUtils.lerp(this.velocity.z, -this.maxSpeed, 0.2);
    }
    else {
        this.velocity.z *= 0.5;
    }

    // strafe would be velocity x

    // jumping and gravity

    if(!this.jumping && KeyInput.space()) {
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

Hero.prototype.collide2 = function(collidableMeshList) {
    var bounce = 0;
    this.rays = [
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(1, 0, 1),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(1, 0, -1),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(-1, 0, -1),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(-1, 0, 1)
    ];
    var minDistance = this.groundedY;
    for (var i = 0; i < this.rays.length; i++) {
        this.rays[i].applyQuaternion(this.quaternion);
        //this.rays[i].setLength(minDistance);
        this.raycaster.set(this.position, this.rays[i]);
        var collisions = this.raycaster.intersectObjects(collidableMeshList);
        if(collisions.length > 0 && collisions[0].distance < minDistance) {
            console.log('hit 2');

            var object = collisions[0].object;
            var inFront = this.forward.dot(object.position) > 0;
            if(inFront && this.velocity.z > 0) {
                //this.velocity.z = 0;
                this.velocity.z *= -bounce;
            }
            else if(!inFront && this.velocity.z < 0) {
                //this.velocity.z = 0;
                this.velocity.z *= -bounce;
            }
            break;
        }
    }
};

Hero.prototype.collide3 = function(collidableMeshList) {
    for (var i = 0; i < collidableMeshList.length; i++) {
        this.isCollidingAabb(collidableMeshList[i]);
    }
};
 // simple sphere to sphere collision
Hero.prototype.isCollidingSphere = function(checkme) {
    var radius = this.groundedY;
    // never collide with yourself
    if (this === checkme) { return false; }
    // only check if these shapes are collidable
    if (!this.collidable || !checkme.collidable) { return false; }
    // don't check your own bullets
    if (checkme.owner === this) { return false; }
    // don't check if no radius
    if (this.radius === 0 || checkme.radius === 0) { return false; }
    
    var dist = this.position.distance(checkme.position);
        
    if (dist <= (radius+checkme.radius)) {
        // trace("Collision detected at distance="+dist);
        //touching = checkme; // remember who hit us
        return true;
    }

    // default: too far away
    // trace("No collision. Dist = "+dist);
    return false;
};

// axis-aligned bounding box collision detection
    // not used in the example game but here for convenience
Hero.prototype.aabbCollision = function(min1, max1, min2, max2 ) {
    if ( min1.x > max2.x || 
        min1.y > max2.y || 
        min1.z > max2.z || 
        max1.x < min2.x || 
        max1.y < min2.y || 
        max1.z < min2.z ) {
        return false;
    }   
    return true;
};

Hero.prototype.isCollidingAabb = function(checkme) {
    var aabbMin = new THREE.Vector3(1, 1, 1);
    var aabbMax = new THREE.Vector3(1, 1, 1);
    // never collide with yourself
    if (this === checkme) { return false; }
    // only check if these shapes are collidable
    //if (!this.collidable || !checkme.collidable) return false;
    // don't check your own bullets
    if (checkme.owner === this) { return false; }
    // don't check if no aabb data
    /*if (this.aabbMin == null || 
        this.aabbMax == null ||
        checkme.aabbMin == null || 
        checkme.aabbMax == null) {
        return false;
    }*/
    
    // FIXME: allocates new Vector3d instances!
    if (this.aabbCollision(
        this.position.clone().add(aabbMin),
        this.position.clone().add(aabbMax),
        checkme.position.clone().add(aabbMin), 
        checkme.position.clone().add(aabbMax)))
        //checkme.position.clone().add(checkme.aabbMin),
        //checkme.position.clone().add(checkme.aabbMax)))
    {
        //touching = checkme; // remember who hit us
        console.log('hit');
        return true;
    }
//      if (aabbCollision(
//          position + aabbMin, 
//          position + aabbMax, 
//          checkme.position + checkme.aabbMin, 
//          checkme.position + checkme.aabbMax))
//      {
//          touching = checkme; // remember who hit us
//          return true;
//      }

    // trace("No collision.");
    return false;
};


module.exports = Hero;
