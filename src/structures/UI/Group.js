'use strict';

const UIBaseElement = require("./Element.js");
const UIPositionVerifier = require("../../utils/UIPositionVerifier.js");
const UITextElement = require("./Text.js");
const UIBoxElement = require("./Box.js");
const UIRoundElement = require("./Round.js");
const UIPlayerElement = require("./Player.js");
const toString = require("../../utils/toString.js");

/**
 * The UI Element Group instance - allows grouping and scaling of UI Elements as a whole
 * @extends {UIBaseElement}
 * @param {Object[]} data.components Raw (or parsed) object component list
 */

class UIElementGroup extends UIBaseElement {
	constructor (data, strictMode = false) {
		super(data, strictMode);

		this.raw.components = [];
		this.setComponents(data?.components);
	}

	static #typeMap = new Map([
		["text", UITextElement],
		["box", UIBoxElement],
		["round", UIRoundElement],
		["player", UIPlayerElement],
		["group", UIElementGroup]
	])

	static #checkTypeMap (type, strictMode = false) {
		if (!this.#typeMap.has(type)) {
			if (strictMode) throw new Error(`Invalid type: "${toString(type)}". Allowed values: "text", "box", "round", "player" or "group"`);
			return null;
		}
		return this.#typeMap.get(type);
	}

	#visitedRecursiveFinder (typeConst, findInHirearchy, initial, visited) {
		if (visited.includes(initial)) return null;

		let { components } = initial;
		
		let found = components.find(v => v instanceof typeConst);
		
		if (found == null && findInHirearchy) {
			visited.push(initial);
			let groups = components.filter(c => c instanceof UIElementGroup);
			for (let group of groups) {
				let res = this.#visitedRecursiveFinder(typeConst, true, group, visited);
				if (res != null) return res;
			}
		}

		return found ?? null;
	}

	#visitedRecursiveFilter (typeConst, findInHirearchy, initial, visited, result) {
		if (visited.includes(initial)) return result;

		let { components } = initial;
		
		result.push(...components.filter(v => v instanceof typeConst));
		
		if (findInHirearchy) {
			visited.push(initial);
			components.filter(c => c instanceof UIElementGroup).forEach(group => this.#visitedRecursiveFilter(typeConst, true, group, visited, result));
		}

		return result;
	}

	/**
	 * Find an element of type
	 * @param {string | UIBaseElement} type - Type name/class to find
	 * @param {boolean} [findInHirearchy = false] - Whether to find in hirearchy if result is not found in current group
	 * @returns {UIBaseElement | null} Finding result
	 */

	getComponentOfType (type, findInHirearchy = false) {
		let typeConst = type?.prototype instanceof UIBaseElement ? type : UIElementGroup.#checkTypeMap(type, true);

		return this.#visitedRecursiveFinder(typeConst, findInHirearchy, this, []);
	}

	/**
	 * Returns array of elements matching given type
	 * @param {string | UIBaseElement} type - Type name/class to lookup
	 * @param {boolean} [findInHirearchy = false] - Whether to include search results in hirearchy
	 * @returns {UIBaseElement[]} The resulting array
	 */

	getComponentsOfType (type, findInHirearchy = false) {
		let typeConst = type?.prototype instanceof UIBaseElement ? type : UIElementGroup.#checkTypeMap(type, true);

		return this.#visitedRecursiveFilter(typeConst, findInHirearchy, this, [], []);
	}

	/**
	 * Create a component (but does not add to this group's hierachy yet).
	 * Note that passing an already-resolved {@link UIBaseElement} object will return its clone instead
	 * @param {Object} data Raw (or resolved) component data
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UIBaseElement | null} The created element (or null if invalid element type is passed in non-strict mode)
	 */

	createComponent (data, strictMode = false) {
		if (data instanceof UIBaseElement) return data.clone();

		let typeConst = UIElementGroup.#checkTypeMap(data?.type, strictMode);

		if (typeConst == null) return null;

		return new typeConst(data, strictMode);
	}

	/**
	 * Create a component and add to hierarchy
	 * @param {Object} data Raw (or resolved) component data
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UIBaseElement | null} The created and added element (or null if invalid element type is passed in non-strict mode)
	 */

	addComponent (data, strictMode = false) {
		let component = this.createComponent(data, strictMode);

		if (component == null) return null;

		component.raw.parent = this;
		
		this.raw.components.push(component);

		return component;
	}

	set (data, strictMode = false) {
		super.set(data, strictMode);

		data = data || {};

		if ("components" in data) this.setComponents(data.components, strictMode);

		return this;
	}

	/**
	 * Replace the current components list with new ones
	 * @param {Object[]} components Array of raw (or resolved) component data
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UIElementGroup} The UI Element Group in question
	 */

	setComponents (components, strictMode = false) {
		let oldComponents = this.raw.components;

		this.raw.components = [];

		if (Array.isArray(components)) try {
			for (let component of components) this.addComponent(component, strictMode);
		}
		catch (e) {
			this.raw.components = oldComponents;
			throw e;
		}
		else {
			if (components != null && strictMode) throw new Error(`Expects ${this.constructor.name}.components to be array-like or nullish. Got ${toString(components)} instead.`);
		}

		return this;
	}

	/**
	 * Remove a component
	 * @param {UIBaseElement} component - The component to remove
	 * @returns {boolean} Whether the removal is successful or not
	 */

	removeComponent (component) {
		return this.removeComponentByIndex(this.raw.components.indexOf(component));
	}

	/**
	 * Remove a component at an index
	 * @param {number} index - The index of component to remove. Allows negative number (for back-counting)
	 * @returns {boolean} Whether the removal is successful or not
	 */

	removeComponentAtIndex (index) {
		let component = this.raw.components.at(index);
		if (component != null) {
			component.splice(index, 1);
			component.raw.parent = null;

			return true;
		}

		return false;
	}

	/**
	 * A cloned array of component list
	 * @type {UIBaseElement[]}
	 * @readonly
	 */

	get components () {
		return [...this.raw.components];
	}

	/**
	 * Transform the given group with given position array
	 * @param {number[]} position - The original position array ([x, y, width, height])
	 * @param {boolean} [strictMode = false] Whether strict mode will be enabled (invalid value will be silently replaced with default value) or throw an error instead
	 * @returns {UIBaseElement[]} The transfrormed array of elements
	 */
	transform (position, strictMode = false) {
		position = UIPositionVerifier(position, strictMode);
		if (!position.success) throw new Error(`Failed to transform given ${this.constructor.name} due to error while parsing initial position. ${position.value}`);
		position = position.value;
		
		return this.components.map(component => {
			let transformed_width = position[2] / 100;
			let transformed_height = position[3] / 100;

			return component.clone().setPosition([
				component.position[0] * transformed_width + position[0],
				component.position[1] * transformed_height + position[1],
				component.position[2] * transformed_width,
				component.position[3] * transformed_height
			]);
		});
	}

	serialize () {
		return {
			type: "group",
			...super.toJSON(),
			components: this.components.map(c => c.serialize())
		}
	}

	toJSON () {
		return this.transform(this.position);
	}
}

module.exports = UIElementGroup;