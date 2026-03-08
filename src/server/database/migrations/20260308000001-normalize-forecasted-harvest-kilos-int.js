"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "UPDATE Distributions SET forecastedHarvestKilos = 0 WHERE forecastedHarvestKilos IS NULL"
    );

    await queryInterface.changeColumn("Distributions", "forecastedHarvestKilos", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Forecasted harvest in kilograms",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Distributions", "forecastedHarvestKilos", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: "Forecasted harvest in kilograms",
    });
  },
};

