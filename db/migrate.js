"use strict";

import config from "config";
import knex from "knex";

import createBallots from "./201708090218_create_ballots";
import createBallotsIndex from "./201708090218_create_ballots_index";

const db_config = config.get("db");

// make a connection without database selected
const client = knex({
  client: "mysql",
  connection: {
    host: db_config.host,
    port: db_config.port || 3306,
    user: db_config.user,
    password: db_config.password
  }
});

//
// Main
//

createSchema().then(migrateSchema).then(() => {
  console.log("migration completed");
  process.exit(0);
}, err => {
  console.error(err.message);
  process.exit(1);
});


//
// Methods
//

function createSchema() {
  return client.raw(`CREATE DATABASE ${db_config.database}`);
}

/**
 * Execute the list of migration scripts one at a time
 * Each of the individual migration must be a function that returns a Promise
 *
 * @return {Promise}
 */
function migrateSchema() {
  const migrations = [
    createBallots,
    createBallotsIndex
  ];

  const schema_client = client.schema.withSchema(db_config.database);
  let last_step = Promise.resolve();
  migrations.forEach(m => {
    // bind each step with the db client
    last_step = last_step
      .then(() => console.log(`executing migration: ${m.name}`))
      .then(m.bind(null, schema_client));
  });

  return last_step;
}

//
// Table Schema