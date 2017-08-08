"use strict";

export default function createBallots(client) {
  return client.createTableIfNotExists("ballots", table => {
    table.increments();
    table.integer("choice").notNullable();
    table.timestamps(false, true);
  });
}