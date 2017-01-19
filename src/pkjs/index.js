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
var fontXSmall = 'gothic-14-bold';
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
collectbridgeip(function() {
  ipAddress = Settings.data('hueip');
  console.log('Load ipAddress: ' + Settings.data('hueip'));
  if ( ipAddress && userName ) {
    collectbridgelights();
  }
});

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
  downHead.text('Hue Off v1.1');
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

      // discover lights
      if ( lightBulbs === undefined ) {
        var discoverWind = new UI.Window();
        var discoverText = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
        discoverText.position(position(-20));
        discoverText.font(fontMedium);
        discoverText.text('Installing Lights...');
        discoverWind.add(discoverText);
        collectbridgelights();
        discoverWind.show();
        setTimeout(function() {
          discoverWind.hide();
        }, 2000);
      }

      // no lights found
      if ( lightBulbs === null ) {
        var noLightsWind = new UI.Window();
        var noLightsHead = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
        var noLightsText = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
        noLightsHead.position(position(-30));
        noLightsText.position(position(0));
        noLightsHead.font(fontMedium);
        noLightsText.font(fontSmall);
        noLightsHead.text('No Lights Found!');
        noLightsText.text('Unpair: Hold Select');
        noLightsWind.add(noLightsHead);
        noLightsWind.add(noLightsText);
        noLightsWind.show();
        noLightsWind.on('longClick', 'select', function(e) {
          Settings.data('hueuser', null);
          console.log('End-User Resetting!, userName Removed');
          noLightsWind.hide();
        });
      }
      
      // lights found
      if ( lightBulbs ) {
        
        // list light bulbs
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
            console.log("Menu Item: " + countLights + " -> lightID: " + id + " -> " + lightBulbs[id]);
            var lightState;
            if ( lightBulbs[id].state.reachable === false ) {
              lightState = 'Unreachable';
            } else {
              if ( lightBulbs[id].state.on === true ) {
                lightState = 'State: On';
              } else {
                lightState = 'State: Off';
              }
            }
            lightsMenu.item(0, countLights, { 
              title: lightBulbs[id].name, subtitle: lightState, icon: icon
            });
            window["item" + countLights] = id;
            countLights++;
          }
        }
        lightsMenu.show();
        mainWind.hide();
        
        // lights switch on/off
        lightsMenu.on('select', function(e) {
          console.log('Selected Item: ' + e.itemIndex + " -> lightID: " + window["item" + e.itemIndex]);
          if ( lightBulbs[window["item" + e.itemIndex]].state.reachable === true ) {
            if ( lightBulbs[window["item" + e.itemIndex]].state.on === true ) {
              switchlight(window["item" + e.itemIndex], false);
              lightBulbs[window["item" + e.itemIndex]].state.on = false;
              lightsMenu.item(0, e.itemIndex, { subtitle: 'State: Off' });
            } else {
              switchlight(window["item" + e.itemIndex], true);
              lightBulbs[window["item" + e.itemIndex]].state.on = true;
              lightsMenu.item(0, e.itemIndex, { subtitle: 'State: On' });
            }
          } else {
            console.log('Light Bulb: Unreachable');
          }
        });

        // lights brightness
        lightsMenu.on('longSelect', function(e) {
          console.log('LongSelected Item: ' + e.itemIndex + " -> lightID: " + window["item" + e.itemIndex]);
          
          // only if light is reachable
          if ( lightBulbs[window["item" + e.itemIndex]].state.reachable === true ) {
            var userBright;
            if ( lightBulbs[window["item" + e.itemIndex]].state.on === true ) {
              var hueBright = lightBulbs[window["item" + e.itemIndex]].state.bri;
              if ( hueBright <= 32 ) {
                userBright=1;
              } else if ( hueBright > 32 && hueBright <= 96 ) {
                userBright=2;
              } else if ( hueBright > 96 && hueBright <= 160 ) {
                userBright=3;
              } else if ( hueBright > 160 && hueBright <= 224 ) {
                userBright=4;
              } else if ( hueBright > 224 ) {
                userBright=5;
              }
              console.log('Light Brightness: ' + hueBright + ' -> User Brightness: ' + userBright);
            } else {
              userBright=0;
              console.log('Light Brightness: Off -> User Brightness: ' + userBright);
            }
            
            // display brightness screen
            var brightnessWind = new UI.Window();
            var brightnessHead = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
            var brightnessText = new UI.Text({size: size, textAlign: textAlign,
              color: highlightTextColor, backgroundColor: highlightBackgroundColor
            });
            var brightnessInfo = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
            brightnessHead.position(position(-70));
            brightnessText.position(position(-28));
            brightnessInfo.position(position(+33));
            brightnessHead.font(fontMedium);
            brightnessText.font(fontSmall);
            brightnessInfo.font(fontXSmall);
            brightnessHead.text(lightBulbs[window["item" + e.itemIndex]].name);
            brightnessText.text('\nBrightness: ' + userBright);
            brightnessInfo.text('\n[max:5 - up/down]');
            brightnessWind.add(brightnessHead);
            brightnessWind.add(brightnessText);
            brightnessWind.add(brightnessInfo);
            brightnessWind.show();
            
            // increase brightness
            brightnessWind.on('click', 'up', function() {
              if ( userBright === 5 ) {
                console.log('Increase Brightness -> Max');
                adjustbrightness(window["item" + e.itemIndex], userBright);
                lightBulbs[window["item" + e.itemIndex]].state.bri = 254;
              } else if ( userBright === 4 ) {
                console.log('Increase Brightness -> 5');
                userBright=5;
                adjustbrightness(window["item" + e.itemIndex], userBright);
                lightBulbs[window["item" + e.itemIndex]].state.bri = 254;
              } else if ( userBright === 3 ) {
                console.log('Increase Brightness -> 4');
                userBright=4;
                adjustbrightness(window["item" + e.itemIndex], userBright);
                lightBulbs[window["item" + e.itemIndex]].state.bri = 192;
              } else if ( userBright === 2 ) {
                console.log('Increase Brightness -> 3');
                userBright=3;
                adjustbrightness(window["item" + e.itemIndex], userBright);
                lightBulbs[window["item" + e.itemIndex]].state.bri = 128;
              } else if ( userBright === 1 ) {
                console.log('Increase Brightness -> 2');
                userBright=2;
                adjustbrightness(window["item" + e.itemIndex], userBright);
                lightBulbs[window["item" + e.itemIndex]].state.bri = 64;
              } else if ( userBright === 0) {
                console.log('Increase Brightness -> 1');
                userBright=1;
                switchlight(window["item" + e.itemIndex], true);
                adjustbrightness(window["item" + e.itemIndex], userBright);
                lightsMenu.item(0, e.itemIndex, { subtitle: 'State: On' });
                lightBulbs[window["item" + e.itemIndex]].state.bri = 1;
                lightBulbs[window["item" + e.itemIndex]].state.on = true;
              }
            });
                              
            // decrease brightness
            brightnessWind.on('click', 'down', function() {
              if ( userBright === 1 ) {
                console.log('Decrease Brightness -> Min');
                adjustbrightness(window["item" + e.itemIndex], userBright);
                lightBulbs[window["item" + e.itemIndex]].state.bri = 1;
              } else if ( userBright === 2 ) {
                console.log('Decrease Brightness -> 1');
                userBright=1;
                adjustbrightness(window["item" + e.itemIndex], userBright);
                lightBulbs[window["item" + e.itemIndex]].state.bri = 1;
              } else if ( userBright === 3 ) {
                console.log('Decrease Brightness -> 2');
                userBright=2;
                adjustbrightness(window["item" + e.itemIndex], userBright);
                lightBulbs[window["item" + e.itemIndex]].state.bri = 64;
              } else if ( userBright === 4 ) {
                console.log('Decrease Brightness -> 3');
                userBright=3;
                adjustbrightness(window["item" + e.itemIndex], userBright);
                lightBulbs[window["item" + e.itemIndex]].state.bri = 128;
              } else if ( userBright === 5 ) {
                console.log('Decrease Brightness -> 4');
                userBright=4;
                adjustbrightness(window["item" + e.itemIndex], userBright);
                lightBulbs[window["item" + e.itemIndex]].state.bri = 192;
              }
            });
            
          // if light is unreachable
          } else {
            console.log('Light Bulb: Unreachable');
          }
          
          // function adjust brightness
          function adjustbrightness(id, newBright) {
            changebrightness(id, newBright);
            brightnessText.text('\nBrightness: ' + newBright);
            brightnessWind.add(brightnessText);
            brightnessWind.add(brightnessInfo);
          }
        });
      }
    }
  }
});

// functions

function collectbridgeip(callback) {
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
      callback();
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

function switchlight(id, state) {
  var url = 'http://' + ipAddress + '/api' + userName + '/lights/' + id + '/state' ;
  var data;
  if ( state === true ) {
    data = '{"on":true}';
  } else {
    data = '{"on":false}';
  }
  ajax({ url: url, method: 'put', type: 'text', data: data });
  console.log('Switched Light: ' + id + ' ' + state);
}

function changebrightness(id, brightness) {
  var url = 'http://' + ipAddress + '/api' + userName + '/lights/' + id + '/state' ;
  var data;
  if ( brightness === 1 ) {
    data = '{"bri":1}';
  } else if ( brightness === 2 ) {
    data = '{"bri":64}';
  } else if ( brightness === 3 ) {
    data = '{"bri":128}';
  } else if ( brightness === 4 ) {
    data = '{"bri":192}';
  } else if ( brightness === 5 ) {
    data = '{"bri":254}';
  }
  ajax({ url: url, method: 'put', type: 'text', data: data });
  console.log('Adjusted Light: ' + id + ' -> Brightness: ' + brightness);
}
