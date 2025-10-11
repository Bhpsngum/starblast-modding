# Changelog

## 1.4.40-alpha6
- Command parser now splits by any space character to get command name.

	For example: Command name from input `mycommand\ntest`
	- Before: `mycommand\ntest`
	- After: `mycommand`
- Mod compilation error will now sent through both streams:
	- ModdingClient event stream (where `logErrors` and `crashOnError` are effective)
	- BrowserClient message stream (`pollMessages()` method)

	BrowserClient message stream always receive this error first, to prevent verbosal loss when the instance is set to crash on exception (`crashOnError` set to `true`).
- Bump minimum Node.js version requirement up to Node v23.
## 1.4.39-alpha6
- BrowserClient: Add new option: `disableNetworkRequests` (boolean) to disable some basic (and the only) network API requests like `fetch` or `XMLHttpRequest`.
## 1.4.38-alpha6
- Fix problem with timer functions within BrowserClient context can crash the whole process
- Fix problem with some event handlers are being duplicated after calling `BrowserClient#resetContext()`
## 1.4.37-alpha6
- Minor fix for color parsing in 3D object type, now any color-related fields only returns number
- Update dependencies
## 1.4.36-alpha6
- Minor fixes for 3D object type:
	+ Object specular color is inconsistent when the type does not have a specular map
	+ Incorrect default bump scale
## 1.4.35-alpha6
- Hotfix: condition typo
## 1.4.34-alpha6
- Hotfix for some small problems
## 1.4.33-alpha6
- Update dependencies to reflect new polyfilled `XMLHttpRequest` and `fetch` API changes
- `ModdingClient#setCustomMap(map)` now ignores `undefined` and `null` maps
- Add method `BrowserClient#pollMessages` to poll messages and errors from BrowserClient, defaults to emitting them to ModdingClient's `error` and `log` events
## 1.4.32-alpha6
- Add `Ship#removeObject(id)` method in BrowserClient
## 1.4.31-alpha6
- Remove capability of reading local files from BrowserClient `XMLHttpRequest`
## 1.4.30-alpha6
- Add `Ship#objects`, which is an ObjectManager for each individual ship. Note that physics don't work on such managers.
- `ObjectManager#set`, `ObjectManager#add` and `Object3D#set` are now async, which always resolve
- Support fetching Data URI for `ObjectType#obj` in order to determine physics and `fetch()` API in emulation environment
- Expose `Ship#setObject(obj)` method inside BrowserClient VM
- Add `Object3D#parent` and `UIComponent#parent` to indicate parent manager of given 3D Object / UI Component
- Add `ObjectManager#parent` and `UIComponentManager#parent` to indicate parent ship or modding client of given manager
## 1.4.29-alpha6
- Hotfix for wrong resolve path
## 1.4.28-alpha6
- Polyfill missing features for BrowserClient VM, including `fetch()` API
## 1.4.27-alpha6
- Fix problem with reusing `start` command while mod is running will hang the instance
## 1.4.26-alpha6
- Hotfix: `Alien#crystal_drop` always returns 0
## 1.4.25-alpha6
- Fix problem with ship IDs being reused by modding server
- Rework `ShipManager#findById`, this method no longer searches for disconnected ships
- Add `StructureManager#get(uuid, includeInactive)` to get structure with UUID
## 1.4.24-alpha6
- Allow parsing some HTML entities on `echo` in `BrowserClient`
- Add `options.strictMode` in `BrowserClient` to prevent commands from changing instance configuration (e.g region)
## 1.4.23-alpha6
- Fix some collectibles or asteroids are not properly destroyed in `BrowserClient`
## 1.4.22-alpha6
- Fix abnormal auto-updating code of `BrowserClient`
## 1.4.21-alpha6
- Improved security of running mod codes using `BrowserClient` interface.
## 1.4.20-alpha6
- Add binary executable for modding version, `npx starblast-modding [options] [mod code]`
## 1.4.19-alpha6
- Change options parameters format for some methods: `BrowserClient#loadCodeFromString(str, opts)`, `BrowserClient#loadCodeFromLocal(path, opts)`, `BrowserClient#loadCodeFromExternal(url, opts)` and `BrowserClient#execute(cmd, opts)`.
- Adding `executionTimeout` options to methods listed above to allow limiting code execution time.
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
