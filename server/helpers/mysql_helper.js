"use strict";

import config from "config";
import knex from "knex";

let client;
export default class MysqlHelper {
  static init() {
    const db_config = config.get("db");

    client = knex({
      client: "mysql",
      connection: {
        host: db_config.host,
        port: db_config.port || 3306,
        user: db_config.user,
        password: db_config.password,
        database: db_config.database
      }
    });
  }

  static get client() {
    return client;
  }
}