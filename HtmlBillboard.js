'use strict';

/**
 * An HTML element which is positioned with Cesium.Cartesian3 coordinates.
 */
function HtmlBillboard(collection) {

    this._show = true;
    this._position = null;
    this._container = collection.childContainer;
    this._collection = collection;
    this._isVisible = false;

    /**
     * Display based on distance from the camera.
     */
    this.distanceDisplayCondition = null;

    /**
     * The offset (in pixels), to apply to the left of the elements position.
     */
    this.offsetLeft = 0;

    /**
     * The offset (in pixels), to apply to the top of the element.
     */
    this.offsetTop = 0;

    /**
     * element is the HTML container which is used as the base for modification or storing
     * child elements.
     */
    this.element = document.createElement('div');
    this.element.style.position = 'absolute';
    this.element.style.top = '0';
    this.element.style.left = '0';
}

Cesium.defineProperties(HtmlBillboard.prototype, {
     /**
     * The Cesium.Cartesian3 position of the element.
     */
    position: {
        get: function () {
            return this._position;
        },
        set: function (value) {
            this._position = value;
            this._collection._markDirty();
        },
    },

    /**
     * Whether or not to show the billboard
     */
    show: {
        get: function () {
            return this._show;
        },
        set: function (value) {
            this._show = value;
            this._collection._markDirty();
        },
    },
});

/**
 * Internal - Control element visibility
 */
HtmlBillboard.prototype._setVisible = function (value) {
    if (this._isVisible === value) {
        return;
    }

    this._isVisible = value;

    // Visibility of the element controls whether or not it is in the DOM.
    // Another approach is to leave the element in the DOM and set the
    // 'visibility' style as 'hidden' or 'visible'. This can have advantages
    // depending on your needs.
    if (this._isVisible) {
        this._container.appendChild(this.element);
    } else {
        this._container.removeChild(this.element);
    }
};

/**
 * Internal - Update the element's view.
 */
HtmlBillboard.prototype._updateView = function (scene, camera, occluder) {
    var newViewPos = null;

    // Check if the element is currently showing and has a valid position specified.
    if (!this._show || !this._position) {
        this._setVisible(false);
        return;
    }

    // Check horizon occlusion
    if (!occluder.isPointVisible(this._position)) {
        this._setVisible(false);
        return;
    }

    // Check position
    newViewPos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, this._position, {});
    if (!newViewPos) {
        this._setVisible(false);
        return;
    }

    // Check visibility by distance
    if (this.distanceDisplayCondition) {
        var dist = Cesium.Cartesian3.distance(this._position, camera.positionWC);

        if (dist < this.distanceDisplayCondition.near || dist > this.distanceDisplayCondition.far) {
            this._setVisible(false);
            return;
        }
    }

    this._setVisible(true);

    // Update the element's position.
    this._currentViewPos = newViewPos;

    var nx = newViewPos.x + this.offsetLeft;
    var ny = newViewPos.y + this.offsetTop;

    // CSS transform - possible promotion to another rendering layer
    // this.element.style.transform = 'translate('+nx+'px, '+ny+'px)';

    // HTML positioning - many elements, one layer. Feels jankier but many elements aren't
    // going to create 1000 layers and turn your computer into a  small sun during compositing.
    this.element.style.left = nx + 'px';
    this.element.style.top  = ny + 'px';
};
