'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('devices', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        unique: true,
      },
      token: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true
      },
      unique_id: {
        allowNull: false,
        type: Sequelize.STRING,
      }
      ,
      type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      app_version: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      device_info: {
        allowNull: false,
        type: Sequelize.JSONB,
      },
      additional_data: {
        allowNull: false,
        type: Sequelize.JSONB,
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
    return queryInterface.dropTable('devices');
  }
};

