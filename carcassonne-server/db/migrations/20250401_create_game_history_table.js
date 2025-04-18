exports.up = function (knex) {
  return knex.schema.createTable("game_history", (table) => {
    table.increments("id").primary();
    table.string("game_id", 20).notNullable();
    table.timestamp("played_at").defaultTo(knex.fn.now());
    table.jsonb("participants").notNullable();
    table.string("winner").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("game_history");
};
