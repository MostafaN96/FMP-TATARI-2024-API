class DatabaseConnection {
  // خليه خارج class كـ property
}

DatabaseConnection.knex = null;

DatabaseConnection.getConnection = function () {
  if (!DatabaseConnection.knex) {
    console.log("Creating new DB connection...");
    DatabaseConnection.knex = require("knex")({
      client: "mysql",
      connection: {
        host: process.env.HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }
    });
  }

  return DatabaseConnection.knex;
};

module.exports = DatabaseConnection;