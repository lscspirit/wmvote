"use strict";

export default function createBallotsIndex(client) {
  return client.alterTable("ballots", table => {
    table.index(["choice"], "idx_ballots_choice");
  });
}