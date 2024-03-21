class VpaidAd {
  constructor() {
    this.slot_ = null;
    this.iframe_ = null;
    this.videos_ = [];
    this.videoSlot_ = null;
    this.eventCallbacks_ = {};
    this.attributes_ = {};
    this.adParameters_ = {};

    // Timer setup for (non-video) interactive ad
    this.adDuration = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.timer = null;
    this.isPaused = false;
  }

  initAd(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    this.attributes_['width'] = width;
    this.attributes_['height'] = height;
    this.slot_ = environmentVars.slot;
    this.videoSlot_ = environmentVars.videoSlot;
    // this.videoSlot_.setAttribute('src', 'https://delivery-2.cavai.com/videodelivery/base/57cb08f15325486baabfc8b4066c2c89/thumbnails/thumbnail.mp4?audio=true&duration=2m&width=1920');
    try {
      this.adParameters_ = JSON.parse(creativeData.AdParameters);
      this.adDuration = this.adParameters_.AD_DURATION
    } catch (e) {
      this.log('NO AD PARAMS PARSED!');
    }
    // Impression callback to player
    if (typeof this.eventCallbacks_['AdImpression'] === 'function') {
        this.eventCallbacks_['AdImpression']();
        this.log('AD IMPRESSION!');
    }
    this.renderSlot_();
  }

  renderSlot_() {
    var slotExists = this.slot_ && this.slot_.tagName === 'DIV';
    if (!slotExists) {
        this.slot_ = document.createElement('div');
        if (!document.body) {
            document.body = document.createElement('body');
        }
        document.body.appendChild(this.slot_);
    }
    this.slot_.style.background = 'black';

    var script = document.createElement('script');
    var inTesting = '';
    if (this.adParameters_.AD_TESTING) {
      var inTesting = '&creativeInTesting=true';
    }
    script.src = this.adParameters_.CREATIVE_SRC + '?bust=' + Date.now() + inTesting;
    script.async = true;
    script.setAttribute('data-click-macro', 'MACRO_PLACEHOLDER');
    script.setAttribute('data-domain', 'DOMAIN_PLACEHOLDER');
    script.setAttribute('data-dsp', 'DSP_PLACEHOLDER');
    script.onload = () => this.adLoaded_();
    this.slot_.appendChild(script);
    this.log('SCRIPT LOADED!');
  }

  adLoaded_(delay = 50) {
    this.log('IFRAME LOADING...' + delay);
    if (this.slot_ && this.slot_.querySelector('iframe') !== null) {
      this.iframe_ = this.slot_.querySelector('iframe');
      this.log('IFRAME LOADED!');
      this.resizeAd(this.slot_.clientWidth, this.slot_.clientHeight, this.attributes_['viewMode']);
      this.videoLoaded_();
      if (this.adDuration) {
        this.startTime = Date.now(); // Record start time
        this.setTimer_(this.adDuration); // Set a timer for 30 seconds
      }
      if (!this.adParameters_.VIDEO_SRC) {
        if (typeof this.eventCallbacks_['AdLoaded'] === 'function') {
          this.eventCallbacks_['AdLoaded']();
          this.log('NON-VIDEO AD LOADED');
        }
      }
    } else {
      if (delay < 10000) {
        setTimeout(() => this.adLoaded_(delay + 50), delay);
      }
    }
  }

  videoLoaded_(delay = 50) {
    this.log('Video LOADING...' + delay);
    var iframeDoc = this.iframe_.contentDocument || this.iframe_.contentWindow.document;
    this.videos_ = iframeDoc.querySelectorAll('video');
    if (this.videos_.length === 0 && delay < 10000) {
        setTimeout(() => this.videoLoaded_(delay + 50), delay);
    } else {
      if (typeof this.eventCallbacks_['AdLoaded'] === 'function') {
        this.eventCallbacks_['AdLoaded']();
        this.log('VIDEO LOADED');
      }
    }
  }

  destroy_() {
    // Perform cleanup operations
    // Remove the ad from the DOM:
    if (this.slot_ && this.slot_.parentNode) {
        this.slot_.parentNode.removeChild(this.slot_);
    }
    // Reset or nullify properties to release resources
    this.slot_ = null;
    this.videoSlot_ = null;
    this.iframe_ = null;
    this.videos_ = [];
  }

  handshakeVersion(version) {
      return '2.0';
  }

  startAd() {
    this.log('Starting ad');
    if (this.videos_.length) {
        this.videos_.forEach(video => {
            video.play().catch(error => {
                console.error('Error attempting to play video:', error);
            });
        });

    }
    if (typeof this.eventCallbacks_['AdStarted'] === 'function') {
        this.eventCallbacks_['AdStarted']();
    }
  }

  stopAd() {
    this.log('Stopping ad');
    if (this.adDuration) {
      clearTimeout(this.timer); // Ensure the timer is stopped
      this.timer = null;
    }
    this.destroy_();

    // Notify the video player that the ad has been stopped
    if (typeof this.eventCallbacks_['AdStopped'] === 'function') {
        this.eventCallbacks_['AdStopped']();
    }
  }

  resizeAd(width, height, viewMode) {
    this.log('resizeAd ' + width + 'x' + height + ' ' + viewMode);
    if (!this.iframe_) {
      return
    }
    // Calculate the scale factors for width and height
    const scaleX = width / this.iframe_.offsetWidth;
    const scaleY = height / this.iframe_.offsetHeight;
    // Use the smallest scale factor to ensure the iframe fits within the slot
    const scale = Math.min(scaleX, scaleY);
    // Apply the scale transformation to the iframe
    this.iframe_.style.transform = `scale(${scale})`;
    // Center the iframe
    this.iframe_.style.transformOrigin = 'top left';
    this.iframe_.style.position = 'absolute';
    const leftOffset = (width - this.iframe_.offsetWidth * scale) / 2;
    const topOffset = (height - this.iframe_.offsetHeight * scale) / 2;
    this.iframe_.style.left = `${leftOffset}px`;
    this.iframe_.style.top = `${topOffset}px`;
    if (typeof this.eventCallbacks_['AdSizeChange'] === 'function') {
      this.eventCallbacks_['AdSizeChange']();
    }
    this.log('NEW SIZE APPLIED');
  }

  pauseAd() {
    // Pause all videos
    if (this.videos_.length) {
      this.videos_.forEach(video => video.pause());
    }
    // Pause interactive ad timer
    if (this.adDuration && !this.isPaused) {
        clearTimeout(this.timer); // Stop the current timer
        this.elapsedTime += Date.now() - this.startTime; // Update elapsed time
        this.isPaused = true;
        this.log('Ad paused');
    }
    // Callback to player
    if (typeof this.eventCallbacks_['AdPaused'] === 'function') {
      this.eventCallbacks_['AdPaused']();
    }
  }

  resumeAd() {
    // Resume all videos? Should just target active video :thinking:
    if (this.videos_.length) {
      this.videos_.forEach(video => {
        video.play().catch(error => {
          this.log('Error attempting to play video:', error);
        });
      });
    }
    // Resume interactive ad timer
    if (this.adDuration && this.isPaused) {
        this.isPaused = false;
        this.startTime = Date.now(); // Reset start time for remaining duration
        let remainingTime = this.adDuration - this.elapsedTime;
        this.setTimer_(remainingTime); // Set a new timer for the remaining time
        this.log('Ad resumed');
    }
    // Callback to player
    if (typeof this.eventCallbacks_['AdResumed'] === 'function') {
      this.eventCallbacks_['AdResumed']();
    }
  }

  subscribe(aCallback, eventName, aContext) {
    this.log(`Subscribe to ${eventName} with callback: ${aCallback.name}`);
    this.eventCallbacks_[eventName] = aCallback.bind(aContext);
  }

  unsubscribe(eventName) {
    this.log('unsubscribe ' + eventName);
    this.eventCallbacks_[eventName] = null;
  }

  getAdSkippableState() {
    return true;
  }

  skipAd() {
    this.destroy_();
    // Notify the video player that the ad has been stopped
    if (typeof this.eventCallbacks_['AdSkipped'] === 'function') {
        this.eventCallbacks_['AdSkipped']();
    }
  }

  getAdWidth() {
    return this.attributes_['width'];
  }

  getAdHeight() {
    return this.attributes_['height'];
  }

  getAdLinear() {
    return true;
  }

  log(message) {
    if (this.adParameters_.AD_TESTING) {
      console.log(message);
    }
  }

  collapseAd() {
    this.resizeAd(this.slot_.clientWidth, this.slot_.clientHeight, this.attributes_['viewMode']);
    if (typeof this.eventCallbacks_['AdCollapsed'] === 'function') {
        this.eventCallbacks_['AdCollapsed']();
    }
  }
  expandAd() {
    this.resizeAd(this.slot_.clientWidth, this.slot_.clientHeight, this.attributes_['viewMode']);
    if (typeof this.eventCallbacks_['AdExpanded'] === 'function') {
        this.eventCallbacks_['AdExpanded']();
    }
  }
  getAdDuration() {
      return 30
  }
  getAdRemainingTime() {
    if (this.adDuration) {
      if (this.isPaused) {
        return (this.adDuration - this.elapsedTime) / 1000;
      } else {
        let currentTime = Date.now();
        let timePassed = currentTime - this.startTime + this.elapsedTime;
        return (this.adDuration - timePassed) / 1000;
      }
    } else {
      if (this.videos_.length > 0) {
        let video = this.videos_[0]; // Just pick first
        // Return the remaining time in seconds
        return video.duration - video.currentTime;
      }
    }
  }

  setTimer_(duration) {
    this.timer = setTimeout(() => {
        this.stopAd(); // Automatically stop the ad when time is up
    }, duration);
  }

  // Placeholder for required functions by eg.
  // https://googleads.github.io/googleads-ima-html5/vsi/
  getAdIcons() { }
  getAdExpanded() {}
  getAdCompanions() {}
  setAdVolume(){}
  getAdVolume(){}
}

// Expose the VpaidAd class via a factory function
window.getVPAIDAd = function() {
    return new VpaidAd();
};
