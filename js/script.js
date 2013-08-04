;(function($) {
 
  /////////////////////
  // Timeline scroll //
  /////////////////////
  
  if ($.browser.msie) {
    $('body').get(0).id = 'IE';
    var IE7 = navigator.userAgent.indexOf('MSIE 7.0') !== -1 ? true : false;
  }
  else if ($.browser.webkit) {
    $('body').get(0).id = 'webkit';
  }

  // Cache.
  var $slider = $('#slider');
  var $shadowScrollLeft = $('#shadow-scrolling-left');
  var $shadowScrollRight = $('#shadow-scrolling-right');
  var $scroll = $slider.find('#scroll');
  var $container = $scroll.find('#scroll-container');
  var $panels = $container.find('li.panel');
  var $nav = $slider.find('#nav');
  
  // Flowplayer.
  var swffp = 'js/flowplayer/flowplayer-3.2.5.swf';
  var swffpRTMP = 'js/flowplayer/flowplayer.rtmp-3.2.3.swf';
  var swffpControls = 'js/flowplayer/flowplayer.controls-3.2.3.swf';
  var vod = 'rtmp://itsc7.fsa.mtsu.edu/vod_coe_centennial';
  
  // Beauty tips configuration.
  var btConfig = {
      trigger: 'click',
      contentSelector: "$(this).find('div.bt-content').html()",
      showTip: function(box){
        // Close button; uses the close anywhere property.
        $(box).find('img.bt-close').click(function() {
          $(document).click();
        });
        $(box).fadeIn(500);
      },
      hideTip: function(box, callback){
        $(box).animate({ opacity: 0 }, 500, callback);
      },
      postShow: function(box) { return false; },
      killTitle: false,
      closeWhenOthersOpen: true,
      shrinkToFit: true,
      strokeStyle: '#000B14',
      spikeGirth: 30,
      spikeLength: 20,
      cornerRadius: 25,
      width: '400px',
      padding: '20px',
      cssClass: 'bt',
      fill: '#000b14',
      shadow: true,
      shadowOffsetX: 0,
      shadowOffsetY: 3,
      shadowBlur: 20,
      shadowColor: '#000',
      shadowOverlap: false,
      noShadowOpts: {
          strokeStyle: '#999', 
          strokeWidth: 2
        },
      offsetParent: 'body' // Required to prevent cliping from the containers overflow: hidden property.
    };
  
  // Calculate a new width for the container '<div id="slider">' so it holds all panes.
  $container.css('width', $panels[0].offsetWidth * $panels.length);
    
  // Link hover style.
  function linkHoverIn() {
    if (IE7) {
      $(this).toggleClass('ie7-hover');
    }
    else {
      $(this)
        .stop()
        .toggleClass('anchor-hover')
        .animate({ 'opacity': '0.6' }, 500); 
    }
  }
  function linkHoverOut() {
    if (IE7) {
      $(this).toggleClass('ie7-hover');
    }
    else {
      $(this)
        .stop()
        .toggleClass('anchor-hover')
        .animate({ 'opacity': '1' }, 500);
    }
  }
  
  // Handle nav selection.
  function selectNav() {
    $(this)
      .parents('ul:first') 
        .find('a')
          .removeClass('selected')
        .end()
      .end()
      .addClass('selected');
  }
  
  // Find the navigation link that has this target and select the nav.
  function triggerNav(data) {
    // Within the navigation element, find the A
    // whos href ends with ID ($= is ends with)
    var el = $nav.find('#dates-nav a[href$="' + data.id + '"]').get(0);
    
    // We're passing the actual element, and not the jQuery instance.
    selectNav.call(el);
  }
  
  // Bind the navigation clicks to update the selected nav.
  $nav
    .find('a')
    .hover(linkHoverIn, linkHoverOut)
    .filter('a.scroll-button')
    .click(selectNav);

  if (window.location.hash) {
    triggerNav({ id : window.location.hash.substr(1) });
  }
  else {
    var initNav = $nav.find('#dates-nav a:first').get(0);
    selectNav.call(initNav);
  }
  
  // Offset is used to move to *exactly* the right place; since I'm using
  // padding, I need to subtract the amount of padding to
  // the offset.
  var offset = parseInt($container.css('paddingTop'));
  
  // Show left, right shadow during scroll animation.
  // Cannot use opacity with IE.
  function beforeScroll(data) { 
    if ($.browser.msie) {
      $shadowScrollLeft.animate({
        width: '+=145px'
      }, 1);
    }
    else {
      $shadowScrollLeft.animate({
        width: '+=145px',
        opacity: 1
      }, 1);
    }
    
    if ($.browser.msie) {
      $shadowScrollRight.animate({
        width: '+=145px'
      }, 1);
    }
    else {
      $shadowScrollRight.animate({
        width: '+=145px',
        opacity: 1
      }, 1);
    }
  }
  
  // Selects the decade specified in the location hash.
  // Hide left, right shadow during scroll animation.
  function afterScroll(data) {
    // Odd width calculation; using the expanded to width as the subtraction value does not work.
    // Had to use outerWidth() to deincrement to zero.
    // Also, can't use opacity with IE.
    if ($.browser.msie) {
      $shadowScrollLeft.animate({
        width: '-=' + $shadowScrollLeft.outerWidth()
      }, 25, 'swing');
    }
    else {
      $shadowScrollLeft.animate({
        width: '-=' + $shadowScrollLeft.outerWidth(),
        opacity: 0
      }, 25, 'swing');
    }
    
    if ($.browser.msie) {
      $shadowScrollRight.animate({
        width: '-=' + $shadowScrollRight.outerWidth()
      }, 25, 'swing');
    }
    else {
      $shadowScrollRight.animate({
        width: '-=' + $shadowScrollRight.outerWidth(),
        opacity: 0
      }, 25, 'swing');
    }
    
    triggerNav(data);
  }
  
  var scrollOptions = {
    target: $scroll, // Element with the overflow.
    items: $panels,
    navigation: '#dates-nav a',
    // Selectors are not relative to the document (must be unique).
    prev: '#prev',
    next: '#next',
    // Scroll both directions.
    axis: 'xy',
    // Initial callback.
    onBefore: beforeScroll,
    // Final callback.
    onAfter: afterScroll,
    offset: offset,
    // Duration of the sliding effect
    duration: 500,
    easing: 'swing'
  };
  
  // Apply serialScroll to the slider.
  $slider.serialScroll(scrollOptions);
  
  // Apply localScroll to hook any other arbitrary links to trigger the effect.
  $.localScroll(scrollOptions);
  
 
  /////////////////
  // Beauty Tips //
  /////////////////
  
  // Parse the configuration values for Beauty Tips. 
  function parseBtConfig(config) { 
    if (typeof config === 'string') { 
      var i, k, props, configDirty;
      configDirty = config.split(';');
      // Remove empty strings, undefined references, nulls, and falses.
      config = []; 
      for (k in configDirty) {
        if (configDirty[k]) {
          config.push(configDirty[k]);
        }
      }
      // Set the values.
      for (i = 0; i < config.length; i += 1) {
        props = config[i].split(':');
        // Trim the markup strings.
        k = props[0].replace(/^\s+|\s+$/g, '');
        v = props[1].replace(/^\s+|\s+$/g, '');       
        // Property is an array of strings.
        btConfig.positions = k === 'positions' ? [v] : btConfig.positions;
        btConfig.width = k === 'width' ? v : btConfig.width;
      }
    }
    // No custom markup configuration, set defaults.
    else {
      btConfig.positions = ['most'];
      btConfig.width = '600px';
    }
  }
  
  $panels
    .find('div.bt-content, div[data-config]')
      .hide()
      .end()
    .find('div.decade, div.snapshot')
      // IE7 screws up animation on relatively positioned elements royally. 
      .hover(linkHoverIn, linkHoverOut)
      .each(function() {
        var config = $(this).find('div[data-config]').attr('data-config');       
        // Set any custom configuration values set in the markup.
        parseBtConfig(config);   
        $(this).bt(btConfig);        
      })
      .end()
    .find('a.bt-anchor')
      .hover(linkHoverIn, linkHoverOut)
      .each(function(e) {  
        // Default anchor event needs handling for IE.
        $(this).click(function(e) {
          e.preventDefault();
        });
        var config = $(this).find('div[data-config]').attr('data-config');
        // Set any custom configuration values set in the markup.
        parseBtConfig(config);
        $(this).bt(btConfig);
      })  
      .end()
    .find('a.more-images')
      .hover(linkHoverIn, linkHoverOut)
      .end()
    //////////////
    // Lightbox //
    //////////////  
    // Using two "lightbox" plugins:
    // lightBox for imgs.
    // jQuery tools overlay for video.
    .find('div.imgs a.lb')
      .each(function() {
        $(this).lightBox();
      })
      .end()
    ///////////////////////////////////
    // Flash video overlay container //
    ///////////////////////////////////
    .find('h2[rel], a[rel]')
      // Stupid-ass IE7 screws up animation on relatively positioned elements royally. 
      .hover(linkHoverIn, linkHoverOut)
      .overlay({
        effect: 'apple',
        // When overlay is opened, load our player.
        onLoad: function() {
          // Find the player contained inside this overlay and load it.
          this.getOverlay().find('a.player').flowplayer(0).load();
        },      
        // When overlay is closed, unload the player.
        onClose: function() {
          $f().unload();
        },    
        mask: {
          color: '#000204',
          loadSpeed: 200,
          opacity: 0.8
        }
      })
      .end()
    ////////////////
    // Flowplayer //
    ////////////////
    .find('div.video a.player')
      .each(function() {
        // Create the vod name for the name assigned in the vod application.
        // Some are delimited by '-', some not; need to convert '-' to underscores.
        var vid = $(this).parent().get(0).id;
        var video = vid.indexOf('-') ? vid.split('-').join('_') : vid;
        $(this).flowplayer(swffp, {
          clip: {
            url: video,
            provider: 'rtmp',
            autoPlay: true
          },
          plugins: {
            rtmp: {
              url: swffpRTMP,
              netConnectionUrl: vod
            },
            controls: {
              url: swffpControls
            }
          }
        })
        .addClass('active-video');
      });
 
  
  // Drop shadow for competent browsers.
//  if (!$.browser.msie) {
    $scroll.addClass('shadow');
    $panels
      .find('div.milestones')
        .addClass('shadow')
      .end()
      .find('a.lb')
        .addClass('shadow');
//  }
  
})(jQuery);
