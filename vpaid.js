//https://github.com/ryanthompson591/vpaidExamples/blob/master/playVideo/VpaidVideoAd.js

var VpaidAd = function () {
  // The slot is the div element on the main page that the ad is supposed to
  // occupy.
  this.slot_ = null;
  // The video slot is the video object that the creative can use to render the
  // video element it might have.
  this.videoSlot_ = null;
  // An object containing all registered events.  These events are all
  // callbacks from the vpaid ad.
  this.eventCallbacks_ = {};
  // A list of attributes getable and setable.
  this.attributes_ = {};
  this.adParameters_ = {};
};


/**
 * VPAID defined init ad, initializes all attributes in the ad.  Ad will
 * not start until startAd is called.
 *
 * @param {number} width The ad width.
 * @param {number} height The ad heigth.
 * @param {string} viewMode The ad view mode.
 * @param {number} desiredBitrate The desired bitrate.
 * @param {Object} creativeData Data associated with the creative.
 * @param {Object} environmentVars Variables associated with the creative like
 *     the slot and video slot.
 */
VpaidAd.prototype.initAd = function(
    width,
    height,
    viewMode,
    desiredBitrate,
    creativeData,
    environmentVars) {
  this.attributes_['width'] = width;
  this.attributes_['height'] = height;
  this.slot_ = environmentVars.slot;
  this.videoSlot_ = environmentVars.videoSlot;
  try { this.adParameters_ = JSON.parse(creativeData.AdParameters); } catch(e){}

  this.log('initAd ' + this.attributes_['width'] + 'x' + height +
    ' ' + viewMode + ' ' + desiredBitrate);

  this.renderSlot_();
  this.eventCallbacks_['AdLoaded']();
  this.log('LOADED!');
  this.log(this.adParameters_);
  this.log(environmentVars);
  this.log(`initAd ${this.attributes_['width']}`);

};

/**
 * Populates the inner html of the slot.
 * @private
 */
VpaidAd.prototype.renderSlot_ = function() {
  var slotExists = this.slot_ && this.slot_.tagName === 'DIV';
  if (!slotExists) {
    this.slot_ = document.createElement('div');
    if (!document.body) {
      document.body = /**@type {HTMLDocument}*/ document.createElement('body');
    }
    document.body.appendChild(this.slot_);
  }
  var s   = document.createElement('script');
  s.src   = this.adParameters_.CREATIVE_SRC+'?bust='+Date.now();
  s.async = true;
  s.setAttribute('data-click-macro', 'MACRO_PLACEHOLDER');
  s.setAttribute('data-domain', 'DOMAIN_PLACEHOLDER');
  s.setAttribute('data-dsp', 'DSP_PLACEHOLDER');
  this.slot_.appendChild(s);
  alert('added');
};

/**
 * Returns the versions of vpaid ad supported.
 * @param {string} version
 * @return {string}
 */
VpaidAd.prototype.handshakeVersion = function(version) {
  return ('2.0');
};


/**
 * Called by the wrapper to start the ad.
 */
VpaidAd.prototype.startAd = function() {
  this.log('Starting ad');
  if ('AdStart' in this.eventCallbacks_) {
    this.eventCallbacks_['AdStarted']();
  }
};


/**
 * Called by the wrapper to stop the ad.
 */
VpaidAd.prototype.stopAd = function() {
  this.log('Stopping ad');
  if ('AdStop' in this.eventCallbacks_) {
    this.eventCallbacks_['AdStopped']();
  }
};


/**
 * @param {number} width The new width.
 * @param {number} height A new height.
 * @param {string} viewMode A new view mode.
 */
VpaidAd.prototype.resizeAd = function(width, height, viewMode) {
  this.log('resizeAd ' + width + 'x' + height + ' ' + viewMode);
  if ('AdSizeChange' in this.eventCallbacks_) {
    this.eventCallbacks_['AdSizeChange']();
  }
};


/**
 * Pauses the ad.
 */
VpaidAd.prototype.pauseAd = function() {
  this.log('pauseAd');
  if ('AdPaused' in this.eventCallbacks_) {
    this.eventCallbacks_['AdPaused']();
  }
};


/**
 * Resumes the ad.
 */
VpaidAd.prototype.resumeAd = function() {
  this.log('resumeAd');
  if ('AdResumed' in this.eventCallbacks_) {
    this.eventCallbacks_['AdResumed']();
  }
};


/**
 * Registers a callback for an event.
 * @param {Function} aCallback The callback function.
 * @param {string} eventName The callback type.
 * @param {Object} aContext The context for the callback.
 */
VpaidAd.prototype.subscribe = function(aCallback, eventName, aContext) {
  this.log('Subscribe ' + aCallback);
  var callBack = aCallback.bind(aContext);
  this.eventCallbacks_[eventName] = callBack;
};


/**
 * Removes a callback based on the eventName.
 *
 * @param {string} eventName The callback type.
 */
VpaidAd.prototype.unsubscribe = function(eventName) {
  this.log('unsubscribe ' + eventName);
  this.eventCallbacks_[eventName] = null;
};

VpaidAd.prototype.setAdVolume = function (value) { };
VpaidAd.prototype.getAdVolume = function() {};
VpaidAd.prototype.expandAd = function() {};
VpaidAd.prototype.getAdExpanded = function() {};
VpaidAd.prototype.getAdSkippableState = function() {};
VpaidAd.prototype.collapseAd = function() {};
VpaidAd.prototype.skipAd = function() {};
VpaidAd.prototype.getAdWidth = function() {return 0;};
VpaidAd.prototype.getAdHeight = function() {};
VpaidAd.prototype.getAdRemainingTime = function() {};
VpaidAd.prototype.getAdDuration = function() {};
VpaidAd.prototype.getAdCompanions = function() {};
VpaidAd.prototype.getAdIcons = function() {};
VpaidAd.prototype.getAdLinear = function() {};

VpaidAd.prototype.log = function (message) {
  console.log(message);
};

var getVPAIDAd = function() {
  return new VpaidAd();
};

window.getVPAIDAd = getVPAIDAd;
