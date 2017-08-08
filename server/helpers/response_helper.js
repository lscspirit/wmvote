"use strict";

import check from "check-types";

import { ModelErrors } from "~/models/base";

/**
 * Generate a standardized error response
 * @param  {String|Error} msg_obj message string or an error object
 * @param  {Object} [details] an object with error details on each properties
 *
 * @example <caption>Response with details</caption>
 *   const resp = errorResponseJson("Invalid account", {
 *     name: "is too short",
 *     address: {
 *       country: "invalid country"
 *     }
 *   });
 * @return {Object} a json representation of the error response
 */
export function errorResponseJson(msg_obj, details) {
  let message = [];

  // Convert msg_obj into the error field value
  if (check.instance(msg_obj, Error)) {
    message = msg_obj.message;     // use the Error message
  } else if (check.string(msg_obj)) {
    message = msg_obj;              // use the string directly
  } else {
    message = JSON.stringify(msg_obj);  // turn the obj into JSON
  }

  return {
    error:   message,
    details: details || {}
  };
}