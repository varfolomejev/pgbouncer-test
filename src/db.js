const { Sequelize } = require("sequelize");
const sequelize = new Sequelize({
  dialect: "postgres",
  host: "localhost",
  username: "postgres",
  password: "postgres",
  database: "postgres",
  port: 6543,
  // port: 5432,
  define: {
    freezeTableName: true,
    timestamps: false,
  },
  pool: {
    max: 9000,
    min: 8000,
    idle: 10 * 1000,
  },
  logging: false,
});

module.exports = sequelize;
