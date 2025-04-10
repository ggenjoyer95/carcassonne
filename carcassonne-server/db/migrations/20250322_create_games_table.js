exports.up = function (knex) {
  return knex.schema.createTable("games", (table) => {
    table.string("game_id", 20).primary().notNullable();
    table.jsonb("game_state").notNullable();
    table
      .enum("status", ["waiting", "active", "finished"])
      .defaultTo("waiting");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("games");
};
