'use strict';

var THREE = require('three');

function ThreeBase(fov, near, far) {
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.deltaTime = 0;
    this.elapsedTime = 0;
    this.fov = fov || 45;
    this.aspectRatio = 2;
    this.near = near || 0.1;
    this.far = far || 10000;

    // camera
    this.camera = new THREE.PerspectiveCamera(this.fov, this.aspectRatio, this.near, this.far);
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 0;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // renderer
    if (window.WebGLRenderingContext) {
      this.renderer = new THREE.WebGLRenderer();
    } else {
      this.renderer = new THREE.CanvasRenderer();
    }
    document.body.appendChild(this.renderer.domElement);
    this.size();
    //this.render();

    // resize
    window.addEventListener( 'resize', this.size.bind(this), false );
}

ThreeBase.prototype.render = function() {
    window.requestAnimationFrame(this.render.bind(this));
    this.deltaTime = this.clock.getDelta();
    this.elapsedTime = this.clock.getElapsedTime();
    this.update(this.deltaTime, this.elapsedTime);
    this.renderer.render(this.scene, this.camera);
};

ThreeBase.prototype.update = function(deltaTime, elapsedTime) {
    console.log('update', deltaTime, elapsedTime);
};

ThreeBase.prototype.size = function(width, height) {
    this.width = isNaN(width) ? window.innerWidth : width;
    this.height = this.width / 2;
    this.aspectRatio = this.width / this.height;
    this.camera.aspect = this.aspectRatio;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
};

module.exports = ThreeBase;
