// Author: Ed Dam

// pebblejs
require('pebblejs');

// clayjs
var Clay       = require('pebble-clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig);

// libraries
var UI      = require('pebblejs/ui');
var Vector2 = require('pebblejs/lib/vector2');

// definitions
var emptyWind = new UI.Window();
var windSize  = emptyWind.size();

// splash screen
var splashWind = new UI.Window();
var splashText = new UI.Text({
  size: new Vector2(windSize.x, windSize.y),
  position: new Vector2(0, windSize.y / 2 - 65),
  backgroundColor: 'black',
  textAlign: 'center',
  color: 'white',
  font: 'gothic-28-bold',
  text: 'Hue Off v1.0'
});
var splashImag = new UI.Image({
  size: new Vector2(windSize.x, windSize.y),
  position: new Vector2(0, windSize.y / 2 - 65),
  image: 'images/splash.png'
});
splashWind.add(splashText);
splashWind.add(splashImag);
splashWind.show();