'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('akses_logs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      id_user: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.addIndex('akses_logs', ['id_user']);
    await queryInterface.addIndex('akses_logs', ['createdAt']);
    await queryInterface.addIndex('akses_logs', ['id_user', 'ip_address', 'createdAt'], {
      name: 'akses_logs_daily_unique',
      unique: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('akses_logs', ['id_user']);
    await queryInterface.removeIndex('akses_logs', ['createdAt']);
    await queryInterface.removeIndex('akses_logs', 'akses_logs_daily_unique');
    await queryInterface.dropTable('akses_logs');
  }
};