'use strict';

var THREE = require('THREE');

function Room(width, depth, height) {
    THREE.Object3D.call(this);

    width = width || 512;
    depth = depth || 1024;
    height = height || 256;

    var material = new THREE.MeshPhongMaterial({ color: '#ffffff' });

    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), material);
    this.ground.rotation.x = -Math.PI / 2;
    this.add(this.ground);

    this.leftWall = this.createWall(material, depth, height);
    this.leftWall.rotation.y = Math.PI / 2; // 90
    this.leftWall.position.x = -width / 2;
    this.add(this.leftWall);

    this.rightWall = this.createWall(material, depth, height);
    this.rightWall.rotation.y = -Math.PI / 2; // -90
    this.rightWall.position.x = width / 2;
    this.add(this.rightWall);

    this.nearWall = this.createWall(material, width, height);
    this.nearWall.rotation.y = Math.PI; // 180
    this.nearWall.position.z = depth / 2;
    this.add(this.nearWall);

    this.farWall = this.createWall(material, width, height);
    this.farWall.position.z = -depth / 2;
    this.add(this.farWall);

    this.roof = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), material);
    this.roof.rotation.x = Math.PI / 2;
    this.roof.position.y = height;
    this.add(this.roof);

    this.walls = [this.leftWall, this.rightWall, this.nearWall, this.farWall];
}

Room.prototype = Object.create(THREE.Object3D.prototype);
Room.prototype.constructor = Room;

Room.prototype.createWall = function(material, length, height) {
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(length, height), material);
    mesh.position.y = height / 2;
    return mesh;
};

module.exports = Room;
