"use strict";

const util = require('util');
const Instance = require('./Instance');

/**
 * The bitmap object
 * @class ContainerInstance
 * @extends Instance
 * @constructor
 * @param {LibraryItem} libraryItem The bitmap data
 * @param {int} id
 */
const ContainerInstance = function(libraryItem, id)
{
    Instance.call(this, libraryItem, id);
};

// Extends the prototype
util.inherits(ContainerInstance, Instance);
const p = ContainerInstance.prototype;

/**
 * Render the element
 * @method render
 * @param {Renderer} renderer
 * @return {string} Buffer of object
 */
p.renderContent = function(renderer)
{
    return renderer.template('container-instance', {
        id: this.libraryItem.name
    });
};

module.exports = ContainerInstance;