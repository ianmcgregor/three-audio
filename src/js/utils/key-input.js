'use strict';

var usfl = require('usfl');

var key = new usfl.KeyInput();
var pointer = new usfl.InputCoords();

var input = {
    key: key,
    left: function() {
        return key.left() || (pointer.isListening && pointer.percentX < 0.4);
    },
    right: function() {
        return key.right() || (pointer.isListening && pointer.percentX > 0.6);
    },
    up: function() {
        return key.up() || (pointer.isListening && pointer.percentY < 0.4);
    },
    down: function() {
        return key.down() || (pointer.isListening && pointer.percentY > 0.6);
    }
};

document.body.addEventListener('touchstart', function() {
    pointer.on();
});
document.body.addEventListener('touchend', function() {
    pointer.off();
});

module.exports = input;
