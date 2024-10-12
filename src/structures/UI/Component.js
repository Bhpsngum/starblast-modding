'use strict';

const createUUID = require("../../utils/createUUID.js");
const defineProperties = require("../../utils/defineProperties.js");
const limitedJSON = require("../../utils/limitedJSON.js");
const toString = require("../../utils/toString.js");
const UIElementGroup = require("./Group.js");

const specialComponents = new Map([
	["scoreboard", {
		position: Object.freeze([80, 0, 20, 52]),
		visible: true,
		clickable: false,
		shortcut: String.fromCharCode(9)
	}],
	["radar_background", {
		position: Object.freeze([0, 0, 100, 100]),
		visible: true,
		clickable: false,
		shortcut: "R"
	}]
])

/**
 * The UI Component instance, representing visual and interactable components in-game.
 * This is an extension of UIElementGroup, but has more features and acts at the upmost parent of any UI Component.
 * @extends {UIElementGroup}
 * @param {string} data.id Custom ID for this UI Component
 * @param {boolean} [data.id=true] Component visibility
 * @param {boolean} [data.clickable=false] Component clickability (and will yield event when clicked)
 * @param {boolean} [data.persistent=false] Whether this component will also show for ships joining later from this set (only available for UI Component whose parent manager is `ModdingClient#ships.UI`)
 * @param {string | null} data.shortcut Shortcut of this UI Component (if clickable)
 */

class UIComponent extends UIElementGroup {
	constructor (data, strictMode = false) {
		super(data, strictMode);

		/**
		 * Custom ID for this UI Component
		 * @name UIComponent#id
		 * @type {string}
		 * @readonly
		 */

		/**
		 * UUID for this UI Component
		 * @name UIComponent#uuid
		 * @type {string}
		 * @readonly
		 */
		
		let id = data?.id;
		if ("string" !== typeof id) {
			if (strictMode) throw new Error(`Expects string value from ${this.constructor.name}.id. Got ${toString(id)} instead.`);
			id = toString(id);
		}

		defineProperties(this, { id, uuid: createUUID() });

		this.setVisible(data?.visible, strictMode).setClickable(data?.clickable, strictMode).setPersistent(data?.persistent).setShortcut(data?.shortcut, strictMode);

		this.raw.lastClickable = this.clickable;

		let _this = this;

		let specialComponent = specialComponents.get(this.id);
		if (specialComponent != null) Object.assign(this.raw, specialComponent);

		Object.defineProperty(this.raw, 'backup', {
			get () { return this._backup ?? _this.#backup() },
			set (val) { this._backup = _this.#backup() }
		});
	}

	#backup () {
		let clone = this.clone();
		clone.raw.parent = this.raw.parent;
		clone.raw.active = true;
		return clone;
	}

	set (data, strictMode = false) {
		super.set(data, strictMode);

		if (data?.hasOwnProperty?.("visible")) this.setVisible(data.visible, strictMode);

		if (data?.hasOwnProperty?.("clickable")) this.setClickable(data.clickable, strictMode);

		if (data?.hasOwnProperty?.("persistent")) this.setPersistent(data.persistent);

		if (data?.hasOwnProperty?.("shortcut")) this.setShortcut(data.shortcut, strictMode);

		return this;
	}

	setPosition (position, strictMode = false) {
		// handle scoreboard and radar background component (You can't set it btw)
		if (specialComponents.has(this.id)) {
			if (strictMode) throw new Error("Scoreboard and Background components' position cannot be altered.");
		}
		else super.setPosition(position, strictMode);

		return this;
	}

	/**
	 * Sets visibility of this UI Component
	 * @param {boolean} visible - Visibility to set
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UIComponent} The UI Component in question
	 */

	setVisible (visible, strictMode = false) {
		if (specialComponents.has(this.id)) {
			if (strictMode) throw new Error("Scoreboard and Background components' visibility cannot be altered.");
		}
		else this.raw.visible = visible == null || !!visible;
		return this;
	}

	/**
	 * Sets clickability of this UI Component
	 * @param {boolean} clickable - Clickability to set
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UIComponent} The UI Component in question
	 */

	setClickable (clickable, strictMode = false) {
		if (specialComponents.has(this.id)) {
			if (strictMode) throw new Error("Scoreboard and Background components' clickability cannot be altered.");
		}
		else this.raw.clickable = !!clickable;
		return this;
	}

	/**
	 * Sets persistency of this UI Component
	 * @param {boolean} persistent - Persistency to set
	 * @returns {UIComponent} The UI Component in question
	 */

	setPersistent (persistent) {
		this.raw.persistent = !!persistent;
		return this;
	}

	/**
	 * Sets shortcut assigned to this UI Component
	 * @param {string | null} shortcut - Shortcut to set
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UIComponent} The UI Component in question
	 */

	setShortcut (shortcut, strictMode) {
		if (specialComponents.has(this.id)) {
			if (strictMode) throw new Error("Scoreboard and Background components' shortcut cannot be altered.");
		}
		else {
			if (shortcut != null) {
				if ("string" !== typeof shortcut) {
					if (strictMode) throw new Error(`Failed to parse UI component shortcut. Given value is non-null and not a string: ${shortcut}`);
					shortcut = toString(shortcut);
				}

				if (shortcut.length < 1) {
					if (strictMode) throw new Error("Failed to parse UI component shortcut. It must not be an empty string (Maybe you want to use `null` instead?)");
					shortcut = null;
				}
				else if (shortcut.length > 1) {
					if (strictMode) throw new Error(`Failed to parse UI component shortcut. Expect one-byte string, got more: "${shortcut}"`);
					shortcut = shortcut[0].toUpperCase();
				}
			}
			else shortcut = null;

			this.raw.shortcut = shortcut;
		}
		return this;
	}

	/**
	 * Hide this component from player
	 * @returns {UIComponent} The UI Component in question
	 */

	hide () {
		if (specialComponents.has(this.id)) {
			if (strictMode) throw new Error("Scoreboard and Background components cannot be hidden through Modding API.");
		}
		else if (this.isActive()) {
			this.raw.active = false;
			this.update(true);
		}

		return this;
	}

	/**
	 * Hide this component from player
	 * @returns {UIComponent} The UI Component in question
	 */

	remove () {
		return this.hide();
	}

	/**
	 * Show this component to player (from hidden status)
	 * @returns {UIComponent} The UI Component in question
	 */

	show () {
		this.raw.active = true;
		return this.update();
	}

	/**
	 * Update the content of this component and show to player
	 * @param {boolean} forceRefresh - Whether to force update to this component
	 * @returns {UIComponent} The UI Component in question
	 */

	update (forceRefresh = false) {
		let parent = this.raw.parent;
		if (parent?.isActive?.() || forceRefresh) parent.updateById?.(this.id);
		return this;
	}

	/**
	 * Visibility of this UI Component
	 * @type {boolean}
	 * @readonly 
	 */

	get visible () {
		return this.raw.visible;
	}

	/**
	 * Clickability of this UI Component
	 * @type {boolean}
	 * @readonly 
	 */

	get clickable () {
		return this.raw.clickable;
	}

	/**
	 * Persistency of this UI Component
	 * @type {boolean}
	 * @readonly 
	 */

	get persistent () {
		return this.raw.persistent;
	}

	/**
	 * Shortcut for this UI Component
	 * @type {string}
	 * @readonly 
	 */

	get shortcut () {
		return this.raw.shortcut;
	}

	/**
	 * Whether this component is active (active status indicates that this UI component has an active parent and is shown to player)
	 * @returns {boolean} The active status
	 */

	isActive () {
		return !!this.parent?.isActive?.() && this.raw.active;
	}

	markAsInactive () {
		
	}

	serialize () {
		return {
			...limitedJSON(this, ["id", "visible", "clickable", "shortcut"]),
			...super.serialize()
		}
	}

	toJSON () {
		let raw = limitedJSON(this, ["id", "position", "visible", "clickable", "shortcut", "components"]);
		
		let isActive = this.isActive();
		
		if (specialComponents.has(this.id) || !isActive) {
			if (isActive) delete raw.position;
			delete raw.clickable;
			delete raw.visible;
			delete raw.shortcut;
			if (!isActive || raw.components.length < 1) delete raw.components;

			return raw;
		}
		
		if (
			!raw.visible || raw.components.length < 1 ||
			(raw.position[0] === 0 && raw.position[1] === 0 && raw.position[2] === 0 && raw.position[3] === 0)
		) {
			raw.position = [0, 0, 0, 0];
			delete raw.components;
		}
		else delete raw.visible;

		if (!raw.clickable) {
			delete raw.shortcut;
			delete raw.clickable;
		}
		else if (raw.shortcut == null) delete raw.shortcut;

		return raw;
	}
}

module.exports = UIComponent;