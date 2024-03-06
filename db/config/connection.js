class DatabaseConnection {
  // static knex = undefined;

  static getConnection() {
    // if (this.knex || undefined) {
    // } else {
      console.log("get conn");
    const knex = require("knex")({
      // bashagal knex
      client: "mysql",
      connection: {
        connectionLimit: 1000,
        host: process.env.HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }, //open connection
    });
    // }
    return knex;
  }
}

module.exports = DatabaseConnection;
