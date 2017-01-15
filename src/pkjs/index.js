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

// definitions
var window = new UI.Window();
var windowSize = window.size();
var size = new Vector2(windowSize.x, windowSize.y);
var icon = 'images/menu_icon.png';
var backgroundColor = 'black';
var highlightBackgroundColor = 'white';
var textColor = 'white';
var highlightTextColor = 'black';
var textAlign = 'center';
var fontLarge = 'gothic-28-bold';
var fontMedium = 'gothic-24-bold';
var fontSmall = 'gothic-18-bold';
//var fontXSmall = 'gothic-14-bold';
function position(height){
  return new Vector2(0, windowSize.y / 2 + height);
}

// hue api data
var ipAddress = Settings.data('hueip');
var userName = Settings.data('hueuser');
var lightBulbs = Settings.data('huelights');
console.log('Saved ipAddress: ' + Settings.data('hueip'));
console.log('Saved userName: ' + userName);
console.log('Saved lightBulbs: ' + lightBulbs);
collectbridgeip();
if ( ipAddress && userName ) {
  collectbridgelights();
}

// main screen
var mainWind = new UI.Window();
var mainText = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
var mainImage = new UI.Image({size: size});
mainText.position(position(-65));
mainImage.position(position(-65));
mainText.font(fontLarge);
mainText.text('HUE OFF');
mainImage.image('images/splash.png');
mainWind.add(mainText);
mainWind.add(mainImage);
mainWind.show();

// up screen
mainWind.on('click', 'up', function(e) {
  var upWind = new UI.Window();
  var upHead = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
  var upText = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
  upHead.position(position(-35));
  upText.position(position(-5));
  upHead.font(fontLarge);
  upText.font(fontMedium);
  upHead.text('Philips Hue');
  upText.text('www.meethue.com');
  upWind.add(upHead);
  upWind.add(upText);
  upWind.show();
});

// down screen
mainWind.on('click', 'down', function(e) {
  var downWind = new UI.Window();
  var downHead = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
  var downText = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
  downHead.position(position(-30));
  downText.position(position(-5));
  downHead.font(fontMedium);
  downText.font(fontSmall);
  downHead.text('Hue Off v1.0');
  downText.text('by Edward Dam');
  downWind.add(downHead);
  downWind.add(downText);
  downWind.show();
});

// select button
mainWind.on('click', 'select', function(e) {

  // reload saved ip
  ipAddress = Settings.data('hueip');
  console.log('Reloaded ipAddress: ' + ipAddress);
  
  // no bridge ip found
  if ( !ipAddress ) {
    var noIpWind = new UI.Window();
    var noIpHead = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
    var noIpText = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
    noIpHead.position(position(-30));
    noIpText.position(position(0));
    noIpHead.font(fontMedium);
    noIpText.font(fontSmall);
    noIpHead.text('No Bridge Found!');
    noIpText.text('Check Your WiFi');
    noIpWind.add(noIpHead);
    noIpWind.add(noIpText);
    noIpWind.show();
  }
    
  // found bridge ip
  if ( ipAddress ) {
    
    // reload saved pairing
    userName = Settings.data('hueuser');
    console.log('Reloaded userName: ' + userName);
    
    // no pairing found
    if ( userName === undefined || userName === null ) {
      var linkWind = new UI.Window();
      var linkHead = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
      var linkText = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
      linkHead.position(position(-45));
      linkText.position(position(-10));
      linkHead.font(fontMedium);
      linkText.font(fontSmall);
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
      
      // reload saved lights
      lightBulbs = Settings.data('huelights');
      console.log('Reloaded lightBulbs: ' + lightBulbs);

      // no lights found
      if ( !lightBulbs ) {
        var noLightsWind = new UI.Window();
        var noLightsHead = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
        var noLightsText = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
        noLightsHead.position(position(-40));
        noLightsText.position(position(-10));
        noLightsHead.font(fontMedium);
        noLightsText.font(fontSmall);
        noLightsHead.text('Install Lights!');
        noLightsText.text('Press Select.\nHold Select to Reset.');
        noLightsWind.add(noLightsHead);
        noLightsWind.add(noLightsText);
        noLightsWind.show();
        collectbridgelights();
        noLightsWind.on('longClick', 'select', function(e) {
          Settings.data('hueuser', null);
          console.log('End-User Resetting!, userName Removed');
          noLightsWind.hide();
        });
      }
      
      // lights found
      if ( lightBulbs ) {
        var countLights = 0;
        var lightsMenu = new UI.Menu({
          textColor: textColor, highlightBackgroundColor: highlightBackgroundColor,
          backgroundColor: backgroundColor, highlightTextColor: highlightTextColor, 
          status: { separator: 'none', color: textColor, backgroundColor: backgroundColor }
        });
        var section = {title: 'Light Bulbs'};
        lightsMenu.section(0, section);
        for (var id in lightBulbs) {
          if (lightBulbs.hasOwnProperty(id)) {
            console.log(id + " -> " + lightBulbs[id]);
            lightsMenu.item(0, countLights, { 
              title: lightBulbs[id].name, subtitle: 'On: ' + lightBulbs[id].state.on, icon: icon
            });
            countLights++;
          }
        }
        lightsMenu.show();
      }
     
    }
  }
});

// functions

function collectbridgeip() {
  var url = 'https://www.meethue.com/api/nupnp' ;
  ajax({ url: url, method: 'get', type: 'json' },
    function(api) {
      console.log('Collected bridgeIp: ' + api);
      if ( api.length === 0 ) {
        console.log('Collected ipAddress: null');
        Settings.data('hueip', null);
      } else {
        console.log('Collected ipAddress: ' + api[0].internalipaddress);
        Settings.data('hueip', api[0].internalipaddress);
      }
    }
  );
}

function collectbridgeuser() {
  var url = 'http://' + ipAddress + '/api' ;
  var data = '{"devicetype":"pebble#hueoff"}';
  ajax({ url: url, method: 'post', type: 'text', data: data },
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

function collectbridgelights() {
  var url = 'http://' + ipAddress + '/api/' + userName;
  ajax({ url: url, method: 'get', type: 'json' },
    function(api) {
      console.log('Collected bridgeData: ' + api);
      if ('lights' in api) {
        console.log('Collected lights: ' + api.lights);
        Settings.data('huelights', api.lights);
      } else {
        console.log('Collected lights: null');
        Settings.data('huelights', null);
      }
    }
  );
}
