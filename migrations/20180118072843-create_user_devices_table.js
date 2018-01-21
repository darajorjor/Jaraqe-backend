'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('user_devices', {
      user_id: {
        type: Sequelize.UUID,
      },
      device_id: {
        type: Sequelize.UUID,
      },
      status: {
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });

  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('user_devices');
  }
};

