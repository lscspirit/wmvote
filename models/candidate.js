"use strict";

const candidate_data = [
  { no: 1, code: "JT", name: "Mr. Chips" },
  { no: 2, code: "CL", name: "Mrs. Lam" },
  { no: 3, code: "WK", name: "Mr. Judge" }
];

export default class Candidate {
  constructor(number, code, name) {
    this._number = number;
    this._code = code;
    this._name = name;
  }

  /**
   * Returns all candidates
   * @type {Array<Candidate>}
   */
  static get all() {
    return CANDIDATES;
  }

  /**
   * Find candidate by number
   * @param  {Integer} number candidate number
   * @return {Candidate} matching candidate
   */
  static findByNumber(number) {
    return this.all.find(c => c.number === number);
  }

  /**
   * Find candidate by code
   * @param  {Integer} number candidate number
   * @return {Candidate} matching candidate
   */
  static findByCode(code) {
    return this.all.find(c => c.code === code);
  }

  //
  // Accessors
  //

  get number() { return this._number; }
  get code() { return this._code; }
  get name() { return this._name; }
}

const CANDIDATES = candidate_data.map(entry => {
  return new Candidate(entry.no, entry.code, entry.name);
});
