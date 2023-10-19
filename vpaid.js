var VPAIDCreative = function() {};

VPAIDCreative.prototype.initAd = function (width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    console.log('initAd', width, height, viewMode, desiredBitrate, creativeData, environmentVars);
    // This method will be called by the video player.
    // Here you can initialize your ad.
    // slot is the div element where the ad is rendered
    this.slot = environmentVars.slot;
    // videoSlot is the object where any video element can be rendered
    this.videoSlot = environmentVars.videoSlot;

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

function getVPAIDAd() {
    return new VPAIDCreative();
}

window.getVPAIDAd = getVPAIDAd;
