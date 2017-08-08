"use strict";

import BaseModel from "~/models/base";
import Candidate from "~/models/candidate";

export default class Ballot extends BaseModel {
  constructor(attrs) {
    super();

    const _attrs = attrs || {};

    this._choice = _attrs.choice ? _attrs.choice.trim() : "";
  }

  //
  // Accessor
  //

  /**
   * Choosen candidate code
   * @return {String} candidate code
   */
  get choice() { return this._choice; }

  /**
   * Candidate indicated by the choice
   * @return {Candidate} choosen candidate
   */
  get candidate() { return Candidate.findByCode(this._choice); }

  //
  // Serialize
  //

  toJSON() {
    return {
      choice: this.choice
    };
  }

  //
  // validation
  //

  _validation() {
    if (!this.candidate) {
      this.errors.add("choice", "invalid candidate");
    }
  }
}