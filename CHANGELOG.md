# Changelog

## 1.4.18-alpha6
- Serialize classes when `toString()` is called on entity objects
## 1.4.17-alpha6
- Fix the case where failed validation can block the instance from starting or stopping
## 1.4.16-alpha6
- Fix invalid command binding
## 1.4.15-alpha6
- Compatibility fixing
## 1.4.14-alpha6
- Add `BrowserClient#resetContext()` to reset mod context and `persistentContext` param for initializing `BrowserClient`
## 1.4.13-alpha6
- Strip formatting text from `BrowserClient` echo results
- Fix an error where mod doesn't stop after 2nd start
## 1.4.12-alpha6
- Small fix for `start` and `stop` command not working
## 1.4.11-alpha6
- Remove asynchronous support totally from running mod code with `BrowserClient`, as it introduces various problems with NodeJS VM
- Terminal commands `start` and `stop` in `BrowserClient` should work as expected now
## 1.4.10-alpha6
- Fix mod context and `BrowserClient#execute()` doesn't share the same context during mod lifetime
## 1.4.9-alpha6
- Change `BrowserClient#execute()` method to async to capture promise rejections
- Better error-logging detection to detect error objects from VM
## 1.4.8-alpha6
- `UIBasicShapeElement#setWidth()` now accepts `null` as width to inherit width value from previous box or round element
- Add `UIPlayerElement#setFontSize()` to declare font size for player elements, `null` to keep old behaviour
- Script execution in `BrowserClient` is now passed into VM to reduce security issues
## 1.4.7-alpha6
- Add `BrowserClient#execute()` method to allow executing custom command (and JavaScript), please be careful.
- Add `ModdingClient#version` property to show package version
- `ModdingClient#setRegion()`, `ModdingClient#setOptions()` and `ModdingClient#setECPKey()` methods now no longer throws error if called while mod is running, instead it will apply to the next run (if caching is enabled).
- `ModdingClient#region` and `ModdingClient#requestOptions` now should reflect correct configuration
- Polyfill `test`, `help`, `start`, `stop`, `region` and `clear` in `BrowserClient` "user-commands"
## 1.4.6-alpha6
- Fixed wrong transform in `UIElementGroup.transform()` method
- Exposes more Element classes under `StarblastModding.UI` object
- `UIComponentManager#add` and `UIComponentManager#set` should return `UIComponentManager` as described in the doc now
- More work to optimize JSON output in `UIComponent`
- Fixed all `UIBaseElement#set` methods to be able to detect data in prototype chain
- `UIElementGroup#getComponentOfType()` and `UIElementGroup#getComponentsOfType()` method now accepts `type` as classes inheriting `UIBaseElement`
- Add missing event parameter to `stop` event
## 1.4.5-alpha6
- Fixed the case where user-defined `error` and `stop` event listeners are being abnormally deleted ([#3](../../issues/3/))
## 1.4.4-alpha6
- Major performance improvement
- Add `options.extendedMode` to `BrowserClient` and `ModdingClient`, allowing extra features through an additional connection
- `BrowserClient`:
	- add missing `ship.r`
	- add missing `last_updated` property for alien, asteroid, collectible and ship objects
## 1.4.3-alpha6
- Minor fixes
## 1.4.2-alpha6
- `ShipManager#setUIComponent` and `Ship#setUIComponent` are now deprecated, they are now under their own `UIComponentManager`, `ShipManager#ui_components` and `Ship#ui_components`
## 1.4.1-alpha6
- Minor fixes for entity `toJSON()` methods
## 1.4.0-alpha6
- Add support for `shipSpawn` and `shipRespawn` event in standard modes by client checking
## 1.3.8-alpha6
- Fix entity setting not successful before game is starting
## 1.3.7-alpha6
- Fix 3D Objects not loading
## 1.3.6-alpha6
- Fix server listing parsing issue ([#2](../../issues/2/))
## 1.3.5-alpha6
- Minor fixes
## 1.3.4-alpha6
- Fix `Object3D#autoShape` doesn't load shape automatically
## 1.3.3-alpha6
- Add `options.async` and `options.asynchronous` to `BrowserClient` to allow asynchronous code execution
## 1.3.2-alpha6
- Add missing fields on entities in `BrowserClient`
## 1.3.1-alpha6
- Minor fixes
## 1.3.0-alpha6
- Update join packet for extended connection
## 1.2.2-alpha6
- Add dynamic `threejs` library to process auto shape for 3D object types
## 1.2.1-alpha6
- Add `options.compressWSMessages` for WebSocket `perMessageDeflate`
## 1.2.0-alpha6
- Update `threejs` package
## 1.1.3-alpha6
- Fix scope-leaking in `TimeManager` and stats in `BrowserClient`
## 1.1.2-alpha6
- Minor fix
## 1.1.1-alpha6
- Minor fix
## 1.1.0-alpha6
- Add `BrowserClient` to support hosting via browser
## 1.0.20-alpha6
- Add `ModdingClient#processStarted`
## 1.0.19-alpha6
- Slight fix in timer
## 1.0.18-alpha6
- Remove experimental logging
## 1.0.17-alpha6
- Add `ModdingClient#timer`, representing `TimeManager` instance and move `game.step` into here
## 1.0.16-alpha6
- Minor fixes in customization parsing and additional connection handling
## 1.0.15-alpha6
- Minor fixes
## 1.0.14-alpha6
- Update `ws` package version
## 1.0.13-alpha6
- Minor fixes
## 1.0.12-alpha6
- `ModdingClient#error` now always emit `Error` object
## 1.0.11-alpha6
- Add `options.cacheECPKey`, `options.cacheEvents` and `options.cacheOptions` in `ModdingClient`
## 1.0.10-alpha6
- Fix default color for 3D object type colors
## 1.0.9-alpha6
- Minor fixes
## 1.0.8-alpha6
- Minor fixes
## 1.0.7-alpha6
- Minor fixes
## 1.0.6-alpha6
- Circular reference to `game` is now private
## 1.0.5-alpha6
- Minor fixes
## 1.0.4-alpha6
- Add alias `Ship#gameOver()` for `Ship#gameover()`
- Add `Station#vx`, `Station#vy`, `StationModule#vx` and `StationModule#vy`
## 1.0.3-alpha6
- Add station-related events
## 1.0.2-alpha6
- Minor fixes
## 1.0.1-alpha6
- Minor fixes
## 1.0.0-alpha6
- Initial release