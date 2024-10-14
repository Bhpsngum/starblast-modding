'use strict';

const UIComponent = require("../structures/UI/Component.js");
const StructureManager = require("./StructureManager.js");

/**
 * The UI Components Manager.
 * @abstract
 * @extends {StructureManager}
 */
class UIComponentManager extends StructureManager {
	constructor (game, api, parent) {
		super(game, api);
		this.#game = game;
		this.#parent = parent;
		this.#api = api;
	}

	#game;
	#parent;
	#api;

	#setUIComponent (data) {
		let component = this.findById(data?.id, true);
		if (component == null) {
			if (this.isInstance(data)) component = data.clone();
			else component = this.create(data);
	
			// assign parent info
			Map.prototype.set.call(this.all, component.uuid, component);
			component.raw.parent = this;
		}
		else component.set(data);
	
		component.show();
	
		this.update();
	
		// overwrite components with same ID on individual ships
		if (this.#parent == null) for (let ship of this.#game.ships) {
			let ui = ship.ui_components.findById(component.id);
			if (ui != null) {
				ui.raw.active = false;
				ui.raw.lastClickable = ui.clickable;
				ui.raw.backup = 1;
			}
		}
	
		return component;
	}

	/**
	 * Set/add an UI Component
	 * @param {Object} data - Raw (or resolved) UI Component data
	 * @returns {UIComponentManager} This manager
	 */

	set (data) {
		return this.#setUIComponent(data);
	}

	/**
	 * Set/add an UI Component
	 * @param {Object} data - Raw (or resolved) UI Component data
	 * @returns {UIComponentManager} This manager
	 */

	add (data) {
		return this.#setUIComponent(data);
	}

	/**
	 * Create/Clone an UI Component with data
	 * @param {Object} data - Raw (or resolved) UI Component data
	 * @returns {UIComponent} The resolved component
	 */

	create (data) {
		return new this.StructureConstructor(data);
	}

	insert(...data) {
		for (let d of data) this.#setUIComponent(d);
		return this.update();
	}

	/**
	 * Hide the UI Component with given ID from this manager (and also from server)
	 * @param {string|null} id - UI Component ID, omit or set to nullish to hide all active components
	 * @returns {UIComponentManager} This manager
	 */

	hide (id) {
		if (id == null) for (let c of this) c.hide();
		else this.findById(id)?.hide?.();
		return this.update();
	}

	/**
	 * Show the UI Component with given ID from this manager (and also from server)
	 * @param {string} id - UI Component ID, omit or set to nullish to show all inactive components
	 * @returns {UIComponentManager} This manager
	 */

	show (id) {
		if (id == null) for (let c of this.all) c.show();
		else this.findById(id, true)?.show?.();
		return this.update();
	}

	/**
	 * Updates the UI Component with given ID (and also server-side)
	 * @param {string} id - UI Component ID to update
	 */

	updateById (id) {
		let c = this.findById(id, true);

		if (c != null) {
			this.#api.clientMessage(this.#parent?.id ?? null, "set_ui_component", { component: c }).send();
			c.raw.lastClickable = c.clickable;
			c.raw.backup = 1;
		}
	}

	update () {
		this.filterList().clear();
		this.all.forEach(c => c.isActive() && this._UUIDset(c));
		return this
	}

	isActive () {
		return (this.#parent != null) ? this.#parent.isActive() : this.#game.isRunning();
	}

	[Symbol.toStringTag] = 'UIComponentManager';
	manager_name = "ui_component";
	StructureConstructor = UIComponent;
}

module.exports = UIComponentManager;