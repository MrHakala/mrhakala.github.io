var VPAIDCreative = function() {};

VPAIDCreative.prototype.initAd = function (width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    console.log('initAd', width, height, viewMode, desiredBitrate, creativeData, environmentVars);
    // This method will be called by the video player.
    // Here you can initialize your ad.
    // slot is the div element where the ad is rendered
    this.slot = environmentVars.slot;
    // videoSlot is the object where any video element can be rendered
    this.videoSlot = environmentVars.videoSlot;
    if(this._videoSlot == null) {
        this._videoSlot = document.createElement('video');
        this._slot.appendChild(this._videoSlot);
    }

    this._videoSlot.setAttribute('src', 'https://v.adserve.tv/pg/24.mp4');

    // Let's create a simple anchor element as our "ad"
    this.anchor = document.createElement('a');
    this.anchor.href = 'https://example.com';
    this.anchor.target = '_blank';
    this.anchor.textContent = 'Visit our site!';
    this.anchor.style.display = 'block';
    this.anchor.style.width = width + 'px';
    this.anchor.style.height = height + 'px';
    this.anchor.style.lineHeight = height + 'px';
    this.anchor.style.backgroundColor = '#000';
    this.anchor.style.color = '#fff';
    this.anchor.style.textAlign = 'center';
    this.slot.appendChild(this.anchor);
}
// Method to skip the ad
VPAIDAd.prototype.skipAd = function() {
// implementation of skipping ad
console.log('Ad skipped.');
};

// Method to resize the ad
VPAIDAd.prototype.resizeAd = function(width, height, viewMode) {
// implementation of resizing ad
console.log(`Ad resized to ${width}x${height}, view mode: ${viewMode}.`);
};

// Method to stop the ad
VPAIDAd.prototype.stopAd = function() {
// implementation of stopping ad
console.log('Ad stopped.');
};

// Method to pause the ad
VPAIDAd.prototype.pauseAd = function() {
// implementation of pausing ad
console.log('Ad paused.');
};

// Method to resume the ad
VPAIDAd.prototype.resumeAd = function() {
// implementation of resuming ad
console.log('Ad resumed.');
};

function getVPAIDAd() {
    return new VPAIDCreative();
}

window.getVPAIDAd = getVPAIDAd;
