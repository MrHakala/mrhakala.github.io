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
 * Html to populate into the ad.  This provides all UI elements for the ad.
 */
VpaidAd.HTML_TEMPLATE =
    '<div style="width:100%; height:100%">' +
    '<iframe src="https://campaign.site/travel-spike" style="z-index:99999; width:100%; height:100%;"></iframe>'+
    '</div>';

VpaidAd.CREATIVE =
`
<div style="width:100%; height:100%">
<script
  data-creative-id='50271-50352-50421-53802'
  data-timestamp='2023-05-24T08:09:14.135Z'
>
(function() {
  var s   = document.createElement('script');
  s.src   = '{CREATIVE_SRC}?bust='+Date.now();
  s.async = true;
  s.setAttribute('data-click-macro', 'MACRO_PLACEHOLDER');
  s.setAttribute('data-domain', 'DOMAIN_PLACEHOLDER');
  s.setAttribute('data-dsp', 'DSP_PLACEHOLDER');
  document.head.appendChild(s);
})();
</script>
</div>
`

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
  // slot and videoSlot are passed as part of the environmentVars
  this.slot_ = environmentVars.slot;
  this.videoSlot_ = environmentVars.videoSlot;
  this.adParameters_ = JSON.parse(creativeData.AdParameters);

  this.log('initAd ' + width + 'x' + height +
      ' ' + viewMode + ' ' + desiredBitrate);
  this.renderSlot_();
  this.addButtonListeners_();
  this.fillProperties_();
  this.eventCallbacks_['AdLoaded']();
  this.log('LOADED!');
  this.log(creativeData);
  this.log(this.adParameters_);
  this.log(this.adParameters_.CREATIVE_SRC);
  this.log(environmentVars);
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
  this.slot_.innerHTML = VpaidAd.CREATIVE.replace('{CREATIVE_SRC}', this.adParameters_.CREATIVE_SRC);
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

VpaidAd.prototype.addButtonListeners_ = function() {};
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
VpaidAd.prototype.eventSelected_ = function() {};
VpaidAd.prototype.adClickThruHandler_ = function() {};

VpaidAd.prototype.log = function (message) {
  console.log(message);
};


/**
 * Callback for AdError button.
 *
 * @private
 */
VpaidAd.prototype.adErrorHandler_ = function() {
  if (!this.isEventSubscribed_('AdError')) {
    this.log('AdError function callback not subscribed.');
    return;
  }
  var adError = document.getElementById('adErrorMsg').value;
  this.log('adError(' + adError + ')');
  this.eventCallbacks_['AdError'](adError);
};


/**
 * Callback for AdLogMsg button.
 *
 * @private
 */
VpaidAd.prototype.adLogHandler_ = function() {
  if (!this.isEventSubscribed_('AdLog')) {
    this.log('Error: AdLog function callback not subscribed.');
    return;
  }
  var adLogMsg = document.getElementById('adLogMsg').value;
  this.log('adLog(' + adLogMsg + ')');
  this.eventCallbacks_['AdLog'](adLogMsg);
};


/**
 * Callback for AdInteraction button.
 *
 * @private
 */
VpaidAd.prototype.adInteractionHandler_ = function() {
  if (!this.isEventSubscribed_('AdInteraction')) {
    this.log('Error: AdInteraction function callback not subscribed.');
    return;
  }
  var adInteraction = document.getElementById('adInteractionId').value;
  this.log('adLog(' + adInteraction + ')');
  this.eventCallbacks_['AdInteraction'](adInteraction);
};

/**
 * @param {string} eventName
 * @return {Boolean} True if this.eventCallbacks_ contains the callback.
 * @private
 */
VpaidAd.prototype.isEventSubscribed_ = function(eventName) {
  return typeof(this.eventCallbacks_[eventName]) === 'function';
};


/**
 * Populates all of the vpaid ad properties.
 *
 * @private
 */
VpaidAd.prototype.fillProperties_ = function() {
  for (var key in this.attributes_) {
    var span = document.getElementById(key);
    span.textContent = this.attributes_[key];
  }
};

var getVPAIDAd = function() {
  return new VpaidAd();
};

window.getVPAIDAd = getVPAIDAd;
