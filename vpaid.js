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
    this.adSkip = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.timer = null;
    this.isPaused = false;
    this.userInteracted = 0;
  }

  initAd(width, height, viewMode, desiredBitrate, creativeData, environmentVars) {
    this.attributes_['width'] = width;
    this.attributes_['height'] = height;
    this.slot_ = environmentVars.slot;
    this.videoSlot_ = environmentVars.videoSlot;
    try {
      this.adParameters_ = JSON.parse(creativeData.AdParameters);
      this.adDuration = this.adParameters_.AD_DURATION * 1000
      this.adSkip = this.adParameters_.AD_SKIP * 1000
    } catch (e) {
      this.log_('NO AD PARAMS PARSED!');
    }
    // Impression callback to player
    this.callback_('AdImpression');
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
    this.log_('SCRIPT LOADED!');
  }

  adLoaded_(delay = 50) {
    this.log_('IFRAME LOADING...' + delay);
    if (this.slot_ && this.slot_.querySelector('iframe') !== null) {
      this.iframe_ = this.slot_.querySelector('iframe');
      this.resizeAd(this.slot_.clientWidth, this.slot_.clientHeight, this.attributes_['viewMode']);
      this.videoLoaded_();
      this.iframe_.addEventListener('load', () => {
        this.log_('IFRAME LOADED!');
        this.renderOverlay_();
        // Use separate timer for ad duration
        if (this.adDuration) {
          this.startTime = Date.now(); // Record start time
          this.setTimer_(this.adDuration); // Set a timer for 30 seconds
        }
        //this.trackInteraction_();
        // No videos to load -> Callback to player that ad loaded
        if (!this.adParameters_.VIDEO_SRC) {
          this.callback_('AdLoaded');
          this.log_('NON-VIDEO AD LOADED');
        }
      })
    } else {
      if (delay < 10000) {
        setTimeout(() => this.adLoaded_(delay + 50), delay);
      }
    }
  }

  renderOverlay_() {
    // Create a transparent overlay
    var overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.zIndex = '999'; // Ensure overlay is above the iframe
    overlay.style.cursor = 'pointer'; // Change cursor to indicate it's clickable
    overlay.className = 'FUCKINGOVERLAY';

    // Attach a click event listener to the overlay
    const iframeDoc = this.iframe_.contentDocument || this.iframe_.contentWindow.document;
    overlay.addEventListener('click', (event) => {
      console.log('Overlay clicked');
      //overlay.style.pointerEvents = 'none';

      // Trigger a click on the element below
      let elemBelow = iframeDoc.elementFromPoint(event.clientX, event.clientY);
      this.log_(elemBelow);
      this.log_(event.clientX+' : '+event.clientY);
      // ref: https://www.google.com/doubleclick/studio/docs/sdk/flash/as3/en/com_google_ads_studio_vpaid_IVpaid.html
      this.userInteracted = -2;
      clearTimeout(this.timer);
      this.renderCloseButton_();
      this.callback_('AdInteraction');
      this.callback_('AdDurationChange');
      this.callback_('AdRemainingTimeChange');
    });

    // Append the overlay to iframe body
    this.slot_.appendChild(overlay);
  }

  trackInteraction_() {
    const iframeDoc = this.iframe_.contentDocument || this.iframe_.contentWindow.document;
    iframeDoc.addEventListener('click', (event) => {
      this.log_('AD CLICKED!');
      // ref: https://www.google.com/doubleclick/studio/docs/sdk/flash/as3/en/com_google_ads_studio_vpaid_IVpaid.html
      this.userInteracted = -2;
      clearTimeout(this.timer);
      this.renderCloseButton_();
      this.callback_('AdInteraction');
      this.callback_('AdDurationChange');
      this.callback_('AdRemainingTimeChange');
    });
  }

  videoLoaded_(delay = 50) {
    this.log_('Video LOADING...' + delay);
    var iframeDoc = this.iframe_.contentDocument || this.iframe_.contentWindow.document;
    this.videos_ = iframeDoc.querySelectorAll('video');
    if (this.videos_.length === 0 && delay < 10000) {
        setTimeout(() => this.videoLoaded_(delay + 50), delay);
    } else {
      this.callback_('AdLoaded');
      this.log_('VIDEO LOADED');
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
    this.log_('AD DESTROYED');
  }

  handshakeVersion(version) {
      return '2.0';
  }

  startAd() {
    this.log_('Starting ad');
    if (this.videos_.length) {
      this.videos_.forEach(video => {
        video.play().catch(error => {
          this.log_('Error attempting to play video:', error);
        });
      });

    }
    this.callback_('AdStarted');
  }

  stopAd() {
    this.log_('Stopping ad');
    if (this.adDuration) {
      clearTimeout(this.timer); // Ensure the timer is stopped
      this.timer = null;
    }
    this.destroy_();
    this.callback_('AdStopped');
  }

  resizeAd(width, height, viewMode) {
    this.log_('resizeAd ' + width + 'x' + height + ' ' + viewMode);
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
    this.callback_('AdSizeChange');
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
    }
    this.callback_('AdPaused');
  }

  resumeAd() {
    // Resume all videos? Should just target active video :thinking:
    if (this.videos_.length) {
      this.videos_.forEach(video => {
        video.play().catch(error => {
          this.log_('Error attempting to play video:', error);
        });
      });
    }
    // Resume interactive ad timer
    if (this.adDuration && this.isPaused) {
        this.isPaused = false;
        this.startTime = Date.now(); // Reset start time for remaining duration
        let remainingTime = this.adDuration - this.elapsedTime;
        this.setTimer_(remainingTime); // Set a new timer for the remaining time
    }
    this.callback_('AdResumed');
  }

  subscribe(aCallback, eventName, aContext) {
    this.log_(`Subscribe to ${eventName} with callback: ${aCallback.name}`);
    this.eventCallbacks_[eventName] = aCallback.bind(aContext);
  }

  unsubscribe(eventName) {
    this.log_('unsubscribe ' + eventName);
    this.eventCallbacks_[eventName] = null;
  }

  getAdSkippableState() {
    if (this.userInteracted || this.isPaused) {
      return true
    }
    if (this.adDuration && this.adSkip) {
      let currentTime = Date.now();
      let timePassed = currentTime - this.startTime + this.elapsedTime;
      return timePassed > this.adSkip;
    } else {
      if (this.videos_.length > 0) {
        return this.videos_[0].currentTime > this.adSkip;
      }
    }
    return true;
  }

  skipAd() {
    this.destroy_();
    this.callback_('AdSkipped');
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

  log_(message) {
    if (this.adParameters_.AD_TESTING) {
      console.log(message);
    }
  }

  collapseAd() {
    this.resizeAd(this.slot_.clientWidth, this.slot_.clientHeight, this.attributes_['viewMode']);
    this.callback_('AdCollapsed');
  }

  expandAd() {
    this.resizeAd(this.slot_.clientWidth, this.slot_.clientHeight, this.attributes_['viewMode']);
    this.callback_('AdExpanded');
  }

  getAdDuration() {
    // User has interacted
    if (this.userInteracted) {
      return -2
    }
    // Use preset duration
    if (this.adDuration) {
      return this.adDuration
    }
    // Use duration if first video
    if (this.videos_.length > 0) {
      return this.videos_[0].duration
    }
    // Not supported. ref: https://www.google.com/doubleclick/studio/docs/sdk/flash/as3/en/com_google_ads_studio_vpaid_IVpaid.html
    return -1
  }

  getAdRemainingTime() {
    // User has interacted
    if (this.userInteracted) {
      return -2
    }
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

  callback_(event) {
    if (typeof this.eventCallbacks_[event] === 'function') {
      this.eventCallbacks_[event]();
      this.log_(event);
    }
  }

  setTimer_(duration) {
    this.timer = setTimeout(() => {
        this.stopAd(); // Automatically stop the ad when time is up
    }, duration);

    // Set another timeout for AD_SKIP to show the close button
    if (this.adSkip && this.adSkip < duration) {
      setTimeout(() => {
        this.renderCloseButton_();
      }, this.adSkip);
    }
  }

  renderCloseButton_() {
    // Check if the close button already exists to avoid duplicates
    if (!this.slot_.querySelector('.close-btn')) {
      const closeButton = document.createElement('div');
      closeButton.innerHTML = '&times;'; // Using HTML entity for a "times" symbol which is commonly used for close buttons
      closeButton.style.position = 'absolute';
      closeButton.style.top = '10px'; // Adding some space from the top edge for better aesthetics
      closeButton.style.right = '10px'; // Adding some space from the right edge for better aesthetics
      closeButton.style.cursor = 'pointer';
      closeButton.style.fontSize = '24px'; // Making the symbol larger and more visible
      closeButton.style.fontWeight = 'bold';
      closeButton.style.color = '#fff'; // White color for the symbol
      closeButton.style.width = '30px';
      closeButton.style.height = '30px';
      closeButton.style.lineHeight = '30px'; // Center the symbol vertically
      closeButton.style.textAlign = 'center'; // Center the symbol horizontally
      closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black background
      closeButton.style.borderRadius = '15px'; // Circular shape
      closeButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.5)'; // Adding some shadow for depth
      closeButton.style.zIndex = '1000'; // Ensure it's above other elements
      closeButton.className = 'close-btn';

      closeButton.addEventListener('click', () => {
        this.skipAd(); // Assuming skipAd method handles ad skipping logic
      });

      this.slot_.appendChild(closeButton);
    }
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
