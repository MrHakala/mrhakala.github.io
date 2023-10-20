var VpaidAd = function() {
  this.slot_ = null;
  this.videoSlot_ = null;
  this.eventCallbacks_ = {};
  this.attributes_ = {};
};

VpaidAd.HTML_TEMPLATE =
    '<div style="background:#108ccd; width:100%; height:100%">' +
    '<div style="height: 100%;' +
    '    display: inline-block; float:left;">' +
    '</div>' +
    '<iframe src="https://campaign.site/mrsdoubtfiremusical" style="absolute;z-index:99999; width:100%; height:100%"></iframe>'+
    '</div>';


VpaidAd.prototype.initAd = function(
    width,
    height,
    viewMode,
    desiredBitrate,
    creativeData,
    environmentVars) {
  // slot and videoSlot are passed as part of the environmentVars
  this.slot_ = environmentVars.slot;
  this.videoSlot_ = environmentVars.videoSlot;
  this.renderSlot_();
  this.emit('AdLoaded');
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
  this.slot_.innerHTML = VpaidAd.HTML_TEMPLATE;
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

VpaidAd.prototype.subscribe = function(aCallback, eventName, aContext) {
  this.log('Subscribe ' + aCallback);
  var callBack = aCallback.bind(aContext);
  this.eventCallbacks_[eventName] = callBack;
};

VpaidAd.prototype.unsubscribe = function(eventName) {
  this.log('unsubscribe ' + eventName);
  this.eventCallbacks_[eventName] = null;
};

VpaidAd.prototype.addButtonListeners_ = function() {};
VpaidAd.prototype.triggerEvent_ = function () { };
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
VpaidAd.prototype.log = function(message) {};
VpaidAd.prototype.eventSelected_ = function() {};
VpaidAd.prototype.adClickThruHandler_ = function() {};
VpaidAd.prototype.adErrorHandler_ = function() {};
VpaidAd.prototype.adLogHandler_ = function() {};
VpaidAd.prototype.adInteractionHandler_ = function () {};

VpaidAd.prototype.isEventSubscribed_ = function (eventName) {
  return typeof(this.eventCallbacks_[eventName]) === 'function';
};

var getVPAIDAd = function() {
  return new VpaidAd();
};

window.getVPAIDAd = getVPAIDAd;
