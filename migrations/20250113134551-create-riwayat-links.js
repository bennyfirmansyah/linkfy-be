'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('riwayat_links', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      id_link: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'links',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_riwayat: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'riwayats',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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
    await queryInterface.addIndex('riwayat_links', ['id_link']);
    await queryInterface.addIndex('riwayat_links', ['id_riwayat']);
    await queryInterface.addIndex('riwayat_links', ['createdAt']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('riwayat_links', ['id_link']);
    await queryInterface.removeIndex('riwayat_links', ['id_riwayat']);
    await queryInterface.removeIndex('riwayat_links', ['createdAt']);
    await queryInterface.dropTable('riwayat_links');
  }
};