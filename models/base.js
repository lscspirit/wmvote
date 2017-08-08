"use strict";

export default class BaseModel {
  constructor() {
    this._errors = null;
  }

  //
  // Accessors
  //

  /**
   * Return the ModelErrors for this object
   *
   * @return {ModelErrors} model error
   */
  get errors() {
    if (!this._errors) {
      // run validation if it hasn't been
      this.validate();
    }

    return this._errors;
  }

  //
  // Validation Methods
  //

  /**
   * Run the model validation
   *
   * @return {Boolean} true if model is valid
   */
  validate() {
    // reset ModelErrors before validation
    this._errors = new ModelErrors();
    // run the validation
    this._validation();
    // return whether model is valid
    return this.isValid();
  }

  /**
   * A validation hook to be overridden by child class
   */
  _validation() {
    // to be overridden by child class
  }

  /**
   * Return whether the model is valid
   * @return {Boolean} true if the model is valid
   */
  isValid() {
    return this.errors.isEmpty();
  }
}

/**
 * A generic class that represent validation errors in a model
 */
export class ModelErrors {
  /**
   * Create a ModelErrors object
   * @param  {Object<String, Array<String>>} [data] error data
   * @constructor
   */
  constructor(data) {
    /**
     * Property errors map
     * @type {Object<String, Array<String>>}
     */
    this._prop_errors = data || {};
  }

  //
  // Accessors
  //

  /**
   * Return all errors
   *
   * @example
   * // returns { name: ["must be longer than 3 characters"],
   * //           age: ["must be an integer"] }
   * model_error.all;
   * @return {Object<String, Array<String>>} a property to error messages map
   */
  get all() {
    return this._prop_errors;
  }


  get messages() {
    return Object.keys(this._prop_errors).reduce((msgs, prop) => {
      return msgs.concat(`${prop} ${this._prop_errors[prop]}`);
    }, []);
  }

  //
  // Public Methods
  //

  /**
   * Add an error message to a property
   *
   * @param {String} property property name
   * @param {String} message  error message
   */
  add(property, message) {
    const msgs = this._prop_errors[property];
    if (msgs) {
      msgs.push(message);
    } else {
      this._prop_errors[property] = [message];
    }
  }

  /**
   * Return all error messages for a property
   *
   * @param  {String} property property name
   * @return {Array<String>} an array of error messages
   */
  get(property) {
    return this._prop_errors[property] || [];
  }

  /**
   * Return whether there is no error
   * @return {Boolean} true if there is no error; false otherwise
   */
  isEmpty() {
    return Object.keys(this._prop_errors).length === 0;
  }
}