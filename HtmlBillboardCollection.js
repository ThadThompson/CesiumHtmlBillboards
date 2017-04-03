'use strict';

/**
 * @param {Cesium.Scene} scene The Cesium Scene that we're tracking.
 */
function HtmlBillboardCollection(scene, container) {
    this.scene = scene;
    this.children = [];

    this.childContainer = document.createElement('div');
    this.childContainer.className = 'cesium-html-layer';

    this.lastViewMatrix = null;
    this.lastBounds = null;
    this.isDirty = false;

    // If a container is specified, then use it.
    if (container) {
        container.appendChild(this.childContainer);
    } else {
        // Otherwise, try to find a good place.
        // If we're using the Cesium Viewer widget, a 'good place'
        // to have our layer is on top of the widget container
        // (which is rendering the map), but under the other controls.

        var cswidget = document.getElementsByClassName('cesium-viewer-cesiumWidgetContainer')[0];
        if (cswidget) {
            cswidget.parentNode.insertBefore(this.childContainer, cswidget.nextSibling);
        } else {
            throw new Cesium.DeveloperError('container is required.');
        }
    }

    // Register layer position updates to run after Cesium has done rendering.
    scene.postRender.addEventListener(this._updateTracking, this);
}

/**
 * Create a new HtmlBillboard
 */
HtmlBillboardCollection.prototype.add = function () {
    var child = new HtmlBillboard(this);
    this.children.push(child);
    return child;
};

/**
 * Remove an HtmlBillboard
 */
HtmlBillboardCollection.prototype.remove = function (value) {
    value._setVisible(false);
    var index = this.children.indexOf(value);
    if (index >= 0) {
        this.children.splice(index, 1);
    }
};

HtmlBillboardCollection.prototype._markDirty = function () {
    this.isDirty = true;
};

/**
 * Internal - Update the position and visibility of children.
 */
HtmlBillboardCollection.prototype._updateTracking = function () {

    // Check to see if we need to update the position of our children.
    // If the view hasn't changed, then they shouldn't need to be moved.
    var newViewMatrix = this.scene.camera.viewMatrix;
    var newBounds = { width: this.scene.canvas.width, height: this.scene.canvas.height };

    if (!this.isDirty &&
        newViewMatrix.equals(this.lastViewMatrix) &&
        this.lastBounds &&
        newBounds.width  === this.lastBounds.width &&
        newBounds.height === this.lastBounds.height) {
        return;
    }

    this.lastViewMatrix = newViewMatrix.clone();
    this.lastBounds = newBounds;

    var cameraPosition = this.scene.camera.positionWC;
    var ellipsoid = this.scene.mapProjection.ellipsoid;
    var occluder = new Cesium.EllipsoidalOccluder(ellipsoid, cameraPosition);
    var i;

    // Update each entity individually.
    for (i = 0; i < this.children.length; i++) {
        this.children[i]._updateView(this.scene, this.scene.camera, occluder);
    }

    this.isDirty = false;
};
