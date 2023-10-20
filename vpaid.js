var VPAIDCreative = function() {};

VPAIDCreative.prototype.initAd = function (width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    console.log('initAd', width, height, viewMode, desiredBitrate, creativeData, environmentVars);
    // This method will be called by the video player.
    // Here you can initialize your ad.
    // slot is the div element where the ad is rendered
    this.slot = environmentVars.slot;
    // videoSlot is the object where any video element can be rendered
    this.videoSlot = environmentVars.videoSlot;
    //this._videoSlot.setAttribute('src', 'https://v.adserve.tv/pg/24.mp4');

  this.eventCallbacks_ = {};
  // A list of attributes getable and setable.
  this.attributes_ = {
    'companions' : '',
    'desiredBitrate' : 256,
    'duration' : 30,
    'expanded' : false,
    'height' : 0,
    'icons' : '',
    'linear' : true,
    'remainingTime' : 10,
    'skippableState' : false,
    'viewMode' : 'normal',
    'width' : 0,
    'volume' : 50
  };
  
  this.HTML_TEMPLATE =
    '<div style="background:#f5f5f5; width:100%; height:100%">' +
    '<div style="height: 100%;' +
    '    display: inline-block; float:left;">' +
    '<select id="eventSelect" size="10">' +
    '  <option value="AdStarted">AdStarted</option>' +
    '  <option value="AdStopped">AdStopped</option>' +
    '  <option value="AdLoaded">AdLoaded</option>' +
    '  <option value="AdLinearChange">AdLinearChange</option>' +
    '  <option value="AdSizeChange">AdSizeChange</option>' +
    '  <option value="AdExpandedChange">AdExpandedChange</option>' +
    '  <option value="AdSkippableStateChange">AdSkippableStateChange</option>' +
    '  <option value="AdDurationChange">AdDurationChange</option>' +
    '  <option value="AdRemainingTimeChange">AdRemainingTimeChange</option>' +
    '  <option value="AdVolumeChange">AdVolumeChange</option>' +
    '  <option value="AdImpression">AdImpression</option>' +
    '  <option value="AdVideoStart">AdVideoStart</option>' +
    '  <option value="AdVideoFirstQuartile">AdVideoFirstQuartile</option>' +
    '  <option value="AdVideoMidpoint">AdVideoMidpoint</option>' +
    '  <option value="AdVideoThirdQuartile">AdVideoThirdQuartile</option>' +
    '  <option value="AdVideoComplete">AdVideoComplete</option>' +
    '  <option value="AdUserAcceptInvitation">AdUserAcceptInvitation</option>' +
    '  <option value="AdUserMinimize">AdUserMinimize</option>' +
    '  <option value="AdUserClose">AdUserClose</option>' +
    '  <option value="AdPaused">AdPaused</option>' +
    '  <option value="AdPlaying">AdPlaying</option>' +
    '  <option value="AdClickThru">AdClickThru</option>' +
    '  <option value="AdError">AdError</option>' +
    '  <option value="AdLog">AdLog</option>' +
    '  <option value="AdInteraction">AdInteraction</option>' +
    '</select>' +
    '</div>' +
    '<div>' +
    '<table>' +
    '  <tr>' +
    '    <td><b>companions</b><br><span id="companions">None</span></td>' +
    '    <td><b>desired bitrate</b><br>' +
    '       <span id="desiredBitrate">-1</span></td>' +
    '    <td><b>duration</b><br><span id="duration">-1</span></td>' +
    '  </tr>' +
    '  <tr>' +
    '    <td><b>expanded</b><br><span id="expanded">false</span></td>' +
    '    <td><b>height</b><br><span id="height">-1</span></td>' +
    '    <td><b>icons</b><br><span id="icons">None</span></td>' +
    '  </tr>' +
    '  <tr>' +
    '    <td><b>linear</b><br><span id="linear">True</span></td>' +
    '    <td><b>remaining time</b><br><span id="remainingTime">-1</span></td>' +
    '    <td><b>skippable state</b><br>' +
    '         <span id="skippableState">False</span></td>' +
    '  </tr>' +
    '  <tr>' +
    '    <td><b>volume</b><br><span id="volume">1.0</span></td>' +
    '    <td><b>view mode</b><br><span id="viewMode">normal</span></td>' +
    '    <td><b>width</b><br><span id="width">5</span></td>' +
    '  </tr>' +
    '</table>' +
    '<div>';
  
    var slotExists = this.slot && this.slot.tagName === 'DIV';
    if (!slotExists) {
      this.slot = document.createElement('div');
      if (!document.body) {
        document.body = /**@type {HTMLDocument}*/ document.createElement('body');
      }
      document.body.appendChild(this.slot);
    }
    this.slot_.innerHTML = this.HTML_TEMPLATE;

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


/**
 * Adds all listeners to buttons.
 * @private
 */
VPAIDCreative.prototype.addButtonListeners_ = function() {
  var eventSelect = document.getElementById('eventSelect');
  eventSelect.addEventListener('change', this.eventSelected_.bind(this));

  var triggerEvent = document.getElementById('triggerEvent');
  triggerEvent.addEventListener('click', this.triggerEvent_.bind(this));
};


/**
 * Triggers an event.
 * @private
 */
VPAIDCreative.prototype.triggerEvent_ = function() {
  var eventSelect = document.getElementById('eventSelect');
  var value = eventSelect.value;
  if (value == 'AdClickThru') {
    this.adClickThruHandler_();
  } else if (value == 'AdError') {
    this.adErrorHandler_();
  } else if (value == 'AdLog') {
    this.adLogHandler_();
  } else if (value == 'AdInteraction') {
    this.adInteractionHandler_();
  } else if (value in this.eventCallbacks_) {
    this.eventCallbacks_[value]();
  }
};


/**
 * Returns the versions of vpaid ad supported.
 * @param {string} version
 * @return {string}
 */
VPAIDCreative.prototype.handshakeVersion = function(version) {
  return ('2.0');
};


/**
 * Called by the wrapper to start the ad.
 */
VPAIDCreative.prototype.startAd = function() {
  this.log('Starting ad');
  if ('AdStart' in this.eventCallbacks_) {
    this.eventCallbacks_['AdStarted']();
  }
};


/**
 * Called by the wrapper to stop the ad.
 */
VPAIDCreative.prototype.stopAd = function() {
  this.log('Stopping ad');
  if ('AdStop' in this.eventCallbacks_) {
    this.eventCallbacks_['AdStopped']();
  }
};


/**
 * @param {number} value The volume in percentage.
 */
VPAIDCreative.prototype.setAdVolume = function(value) {
  this.attributes_['volume'] = value;
  this.log('setAdVolume ' + value);
  if ('AdVolumeChange' in this.eventCallbacks_) {
    this.eventCallbacks_['AdVolumeChange']();
  }
};


/**
 * @return {number} The volume of the ad.
 */
VPAIDCreative.prototype.getAdVolume = function() {
  this.log('getAdVolume');
  return this.attributes_['volume'];
};


/**
 * @param {number} width The new width.
 * @param {number} height A new height.
 * @param {string} viewMode A new view mode.
 */
VPAIDCreative.prototype.resizeAd = function(width, height, viewMode) {
  this.log('resizeAd ' + width + 'x' + height + ' ' + viewMode);
  this.attributes_['width'] = width;
  this.attributes_['height'] = height;
  this.attributes_['viewMode'] = viewMode;
  if ('AdSizeChange' in this.eventCallbacks_) {
    this.eventCallbacks_['AdSizeChange']();
  }
};


/**
 * Pauses the ad.
 */
VPAIDCreative.prototype.pauseAd = function() {
  this.log('pauseAd');
  if ('AdPaused' in this.eventCallbacks_) {
    this.eventCallbacks_['AdPaused']();
  }
};


/**
 * Resumes the ad.
 */
VPAIDCreative.prototype.resumeAd = function() {
  this.log('resumeAd');
  if ('AdResumed' in this.eventCallbacks_) {
    this.eventCallbacks_['AdResumed']();
  }
};


/**
 * Expands the ad.
 */
VPAIDCreative.prototype.expandAd = function() {
  this.log('expandAd');
  this.attributes_['expanded'] = true;
  if ('AdExpanded' in this.eventCallbacks_) {
    this.eventCallbacks_['AdExpanded']();
  }
};


/**
 * Returns true if the ad is expanded.
 *
 * @return {boolean}
 */
VPAIDCreative.prototype.getAdExpanded = function() {
  this.log('getAdExpanded');
  return this.attributes_['expanded'];
};


/**
 * Returns the skippable state of the ad.
 *
 * @return {boolean}
 */
VPAIDCreative.prototype.getAdSkippableState = function() {
  this.log('getAdSkippableState');
  return this.attributes_['skippableState'];
};


/**
 * Collapses the ad.
 */
VPAIDCreative.prototype.collapseAd = function() {
  this.log('collapseAd');
  this.attributes_['expanded'] = false;
};


/**
 * Skips the ad.
 */
VPAIDCreative.prototype.skipAd = function() {
  this.log('skipAd');
  var skippableState = this.attributes_['skippableState'];
  if (skippableState) {
    if ('AdSkipped' in this.eventCallbacks_) {
      this.eventCallbacks_['AdSkipped']();
    } else {
      this.log('Error: Invalid ad skip request.');
    }
  }
};


/**
 * Registers a callback for an event.
 * @param {Function} aCallback The callback function.
 * @param {string} eventName The callback type.
 * @param {Object} aContext The context for the callback.
 */
VPAIDCreative.prototype.subscribe = function(aCallback, eventName, aContext) {
  this.log('Subscribe ' + aCallback);
  var callBack = aCallback.bind(aContext);
  this.eventCallbacks_[eventName] = callBack;
};


/**
 * Removes a callback based on the eventName.
 *
 * @param {string} eventName The callback type.
 */
VPAIDCreative.prototype.unsubscribe = function(eventName) {
  this.log('unsubscribe ' + eventName);
  this.eventCallbacks_[eventName] = null;
};


/**
 * @return {number} The ad width.
 */
VPAIDCreative.prototype.getAdWidth = function() {
  return this.attributes_['width'];
};


/**
 * @return {number} The ad height.
 */
VPAIDCreative.prototype.getAdHeight = function() {
  return this.attributes_['height'];
};


/**
 * @return {number} The time remaining in the ad.
 */
VPAIDCreative.prototype.getAdRemainingTime = function() {
  return this.attributes_['remainingTime'];
};


/**
 * @return {number} The duration of the ad.
 */
VPAIDCreative.prototype.getAdDuration = function() {
  return this.attributes_['duration'];
};


/**
 * @return {string} List of companions in vast xml.
 */
VPAIDCreative.prototype.getAdCompanions = function() {
  return this.attributes_['companions'];
};


/**
 * @return {string} A list of icons.
 */
VPAIDCreative.prototype.getAdIcons = function() {
  return this.attributes_['icons'];
};


/**
 * @return {boolean} True if the ad is a linear, false for non linear.
 */
VPAIDCreative.prototype.getAdLinear = function() {
  return this.attributes_['linear'];
};


/**
 * Logs events and messages.
 *
 * @param {string} message
 */
VPAIDCreative.prototype.log = function(message) {
  var logTextArea = document.getElementById('lastVpaidEvent');
  if (logTextArea != null) {
    logTextArea.value = message;
  }
};


/**
 * Callback for AdClickThru button.
 *
 * @private
 */
VPAIDCreative.prototype.adClickThruHandler_ = function() {
  if (!this.isEventSubscribed_('AdClickThru')) {
    this.log('Error: AdClickThru function callback not subscribed.');
    return;
  }
  var clickThruUrl = document.getElementById('clickThruUrl').value;
  var clickThruId = document.getElementById('clickThruId').value;
  var clickThruPlayerHandles =
      document.getElementById('clickThruPlayerHandels').value;
  this.log('AdClickThu(' + clickThruUrl + ',' +
      clickThruId + ',' + clickThruPlayerHandles + ')');
  this.eventCallbacks_['AdClickThru'](
      clickThruUrl,
      clickThruId,
      clickThruPlayerHandles);
};


/**
 * Callback for AdError button.
 *
 * @private
 */
VPAIDCreative.prototype.adErrorHandler_ = function() {
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
VPAIDCreative.prototype.adLogHandler_ = function() {
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
VPAIDCreative.prototype.adInteractionHandler_ = function() {
  if (!this.isEventSubscribed_('AdInteraction')) {
    this.log('Error: AdInteraction function callback not subscribed.');
    return;
  }
  var adInteraction = document.getElementById('adInteractionId').value;
  this.log('adLog(' + adInteraction + ')');
  this.eventCallbacks_['AdInteraction'](adInteraction);
};


/**
 * Callback function when an event is selected from the dropdown.
 *
 * @private
 */
VPAIDCreative.prototype.eventSelected_ = function() {
  var clickThruParams = document.getElementById('AdClickThruOptions');
  var adErrorParams = document.getElementById('AdErrorOptions');
  var adLogParams = document.getElementById('AdLogOptions');
  var adInteractionParams = document.getElementById('AdInteractionOptions');
  clickThruParams.style.display = 'none';
  adErrorParams.style.display = 'none';
  adLogParams.style.display = 'none';
  adInteractionParams.style.display = 'none';

  var eventSelect = document.getElementById('eventSelect');
  var value = eventSelect.value;
  if (value == 'AdClickThru') {
    clickThruParams.style.display = 'inline';
  } else if (value == 'AdError') {
    adErrorParams.style.display = 'inline';
  } else if (value == 'AdLog') {
    adLogParams.style.display = 'inline';
  } else if (value == 'AdInteraction') {
    adInteractionParams.style.display = 'inline';
  }
};


/**
 * @param {string} eventName
 * @return {Boolean} True if this.eventCallbacks_ contains the callback.
 * @private
 */
VPAIDCreative.prototype.isEventSubscribed_ = function(eventName) {
  return typeof(this.eventCallbacks_[eventName]) === 'function';
};


/**
 * Populates all of the vpaid ad properties.
 *
 * @private
 */
VPAIDCreative.prototype.fillProperties_ = function() {
  for (var key in this.attributes_) {
    var span = document.getElementById(key);
    span.textContent = this.attributes_[key];
  }
};

function getVPAIDAd() {
    return new VPAIDCreative();
}

window.getVPAIDAd = getVPAIDAd;
