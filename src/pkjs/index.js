// Author: Ed Dam

// pebblejs
require('pebblejs');

// clayjs
var Clay       = require('pebble-clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig);

// libraries
var UI       = require('pebblejs/ui');
var Vector2  = require('pebblejs/lib/vector2');
var ajax     = require('pebblejs/lib/ajax');
var Settings = require('pebblejs/settings');

// hue data
var ipAddress;
console.log('Saved bridgeIp: ' + Settings.data('hueip'));
collectbridgeip();
var userName = Settings.data('hueuser');
console.log('Saved userName: ' + userName);
if ( userName ) {
  collectbridgelights();
}

// definitions
var window = new UI.Window();
var windowSize = window.size();
var size = new Vector2(windowSize.x, windowSize.y);
var backgroundColor = 'black';
var textAlign = 'center';
var fontLarge = 'gothic-28-bold';
var fontMedium = 'gothic-24-bold';
var fontSmall = 'gothic-18-bold';
//var fontXSmall = 'gothic-14-bold';
function position(height){
  return new Vector2(0, windowSize.y / 2 + height);
}

// main screen
var mainWind = new UI.Window();
var mainText = new UI.Text({
  size: size, backgroundColor: backgroundColor, textAlign: textAlign,
  font: fontLarge
});
var mainImage = new UI.Image({size: size});
mainText.position(position(-65));
mainImage.position(position(-65));
mainText.text('HUE OFF');
mainImage.image('images/splash.png');
mainWind.add(mainText);
mainWind.add(mainImage);
mainWind.show();

// up screen
mainWind.on('click', 'up', function(e) {
  var upWind = new UI.Window();
  var upHead = new UI.Text({
    size: size, backgroundColor: backgroundColor, textAlign: textAlign,
    font: fontLarge
  });
  var upText = new UI.Text({
    size: size, backgroundColor: backgroundColor, textAlign: textAlign,
    font: fontMedium
  });
  upHead.position(position(-35));
  upText.position(position(-5));
  upHead.text('Philips Hue');
  upText.text('www.meethue.com');
  upWind.add(upHead);
  upWind.add(upText);
  upWind.show();
});

// down screen
mainWind.on('click', 'down', function(e) {
  var downWind = new UI.Window();
  var downHead = new UI.Text({
    size: size, backgroundColor: backgroundColor, textAlign: textAlign,
    font: fontMedium
  });
  var downText = new UI.Text({
    size: size, backgroundColor: backgroundColor, textAlign: textAlign,
    font: fontSmall
  });
  downHead.position(position(-30));
  downText.position(position(-5));
  downHead.text('Hue Off v1.0');
  downText.text('by Edward Dam');
  downWind.add(downHead);
  downWind.add(downText);
  downWind.show();
});

// select button
mainWind.on('click', 'select', function(e) {

  // load collected bridge ip
  var bridgeIp = Settings.data('hueip');
  console.log('Loaded bridgeIp: ' + bridgeIp);
  
  // no bridge ip found
  var foundbridge = false;
  if ( bridgeIp.length === 0 ) {
    var noIpWind = new UI.Window();
    var noIpHead = new UI.Text({
      size: size, backgroundColor: backgroundColor, textAlign: textAlign,
      font: fontMedium
    });
    var noIpText = new UI.Text({
      size: size, backgroundColor: backgroundColor, textAlign: textAlign,
      font: fontSmall
    });
    noIpHead.position(position(-30));
    noIpText.position(position(0));
    noIpHead.text('No Bridge Found!');
    noIpText.text('Check Your WiFi');
    noIpWind.add(noIpHead);
    noIpWind.add(noIpText);
    noIpWind.show();
  } else {
    foundbridge = true; 
  }
    
  // found bridge ip
  if ( foundbridge ) {
    
    // determine ip address 
    ipAddress = bridgeIp[0].internalipaddress;
    console.log('Determined ipAddress: ' + ipAddress);
    
    // reload saved pairing
    userName = Settings.data('hueuser');
    console.log('Reloaded userName: ' + userName);
    
    // no pairing found
    if ( userName === undefined || userName === null ) {
      var linkWind = new UI.Window();
      var linkHead = new UI.Text({
        size: size, backgroundColor: backgroundColor, textAlign: textAlign,
        font: fontMedium
      });
      var linkText = new UI.Text({
        size: size, backgroundColor: backgroundColor, textAlign: textAlign,
        font: fontSmall
      });
      linkHead.position(position(-45));
      linkText.position(position(-10));
      linkHead.text('Pair Bridge!');
      linkText.text('1. Press Bridge\n2. Click Watch');
      linkWind.add(linkHead);
      linkWind.add(linkText);
      linkWind.show();
      linkWind.on('click', 'select', function(e) {
        collectbridgeuser();
        linkWind.hide();
      });
    }
    
    // pairing found
    if ( userName ) {
      
      // load lights
      
      // no lights found
      
      // lights found
      
    }
  }
  
});

// functions

function collectbridgeip() {
  var nupnpURL = 'https://www.meethue.com/api/nupnp' ;
  ajax({ url: nupnpURL, method: 'get', type: 'json' },
    function(api) {
      console.log('Collected bridgeIp: ' + api);
      Settings.data('hueip', api);
    }
  );
}

function collectbridgeuser() {
  var apiURL = 'http://' + ipAddress + '/api' ;
  var message = '{"devicetype":"pebble#hueoff"}';
  ajax({ url: apiURL, method: 'post', type: 'text', data: message },
    function(api) {
      var json = JSON.parse(api);
      console.log('Collected bridgeUser: ' + json);
      if ('success' in json[0]) {
        console.log('Collected userName: ' + json[0].success.username);
        Settings.data('hueuser', json[0].success.username);
      } else {
        console.log('Collected userName: ' + json[0].error.description);
        Settings.data('hueuser', null);
      }
    }
  );
}
