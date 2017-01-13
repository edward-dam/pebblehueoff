#include <pebble.h>
#include "pebblejs/simply.h"

// Author: Ed Dam

// definitions
static Window *loading_window;
static TextLayer *loading_text;

// load window
static void window_load(Window *window) {
  // collect window size
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);
  // create text layer
  loading_text = text_layer_create(GRect(0,bounds.size.h/2-10,bounds.size.w,bounds.size.h));
  // define text details
  text_layer_set_background_color(loading_text, GColorBlack);
  text_layer_set_text_color(loading_text, GColorWhite);
  text_layer_set_text(loading_text, "Loading...");
  text_layer_set_font(loading_text, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD));
  text_layer_set_text_alignment(loading_text, GTextAlignmentCenter);
  // add text layer to window
  layer_add_child(window_layer, text_layer_get_layer(loading_text));
}

// unload window
static void window_unload(Window *window) {
  text_layer_destroy(loading_text);
}

// init
static void init_loading(void) {
  // create window
  loading_window = window_create();
  window_set_background_color(loading_window, GColorBlack);
  // load or unload layers
  window_set_window_handlers(loading_window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload
  });
  // push to screen
  window_stack_push(loading_window, true);
}

// deinit
static void deinit_loading(void) {
  window_destroy(loading_window);
}

// main
int main(void) {
  Simply *simply = simply_create();
  init_loading();
  app_event_loop();
  deinit_loading();
  simply_destroy(simply);
}
