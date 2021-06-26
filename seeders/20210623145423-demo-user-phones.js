const faker = require("faker");

'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    var newData = [];
    for (let i = 0; i <= 20000; i++) {
      for(let y = 0; y < (Math.floor(Math.random() * 5) + 1); y++) {
        newData.push({
          phone: faker.phone.phoneNumber(),
          user_id: i + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
    return queryInterface.bulkInsert("UserPhones", newData);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("UserPhones", null, {});
  },
};
