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
        host: process.env.HOST || "localhost",
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'hossam8989',
        database: process.env.DB_NAME || 'fmp_textilia_2025',
      }
    });
  }

  return DatabaseConnection.knex;
};

module.exports = DatabaseConnection;