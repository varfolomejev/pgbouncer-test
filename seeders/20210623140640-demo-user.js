const faker = require("faker");

("use strict");

module.exports = {
  up: (queryInterface, Sequelize) => {
    var newData = [];
    for (let i = 0; i <= 20000; i++) {
      newData.push({
        firstName: faker.name.findName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return queryInterface.bulkInsert("Users", newData);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {}).then(() => {
      return queryInterface.query("SELECT setval('Users_id_seq', (SELECT MAX(id) FROM Users));")
    });
  },
};
