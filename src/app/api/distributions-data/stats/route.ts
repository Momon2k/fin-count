import { NextRequest, NextResponse } from "next/server";
import Distribution from "@/server/database/models/distribution";
import models from "@/server/database/models";
import { Op } from "sequelize";

// Helper function for JSON responses
function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/distributions-data/stats - Get distribution statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const species = searchParams.get("species");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const province = searchParams.get("province");

    const whereClause: any = {};

    if (species) {
      whereClause.species = species;
    }

    if (province) {
      whereClause.province = {
        [Op.iLike]: `%${province}%`,
      };
    }

    if (startDate || endDate) {
      whereClause.dateDistributed = {};
      if (startDate) {
        whereClause.dateDistributed[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.dateDistributed[Op.lte] = new Date(endDate);
      }
    }

    // Get overall statistics by species
    const speciesStats = await Distribution.findAll({
      attributes: [
        "species",
        [models.sequelize.fn("COUNT", models.sequelize.col("id")), "count"],
        [
          models.sequelize.fn("SUM", models.sequelize.col("fingerlings")),
          "totalFingerlings",
        ],
        [
          models.sequelize.fn(
            "SUM",
            models.sequelize.col("actualHarvestKilos")
          ),
          "totalHarvest",
        ],
      ],
      where: whereClause,
      group: ["species"],
      raw: true,
    });

    // Get top municipalities by distribution count
    const topMunicipalities = await Distribution.findAll({
      attributes: [
        "municipality",
        "province",
        [models.sequelize.fn("COUNT", models.sequelize.col("id")), "count"],
        [
          models.sequelize.fn("SUM", models.sequelize.col("fingerlings")),
          "totalFingerlings",
        ],
        [
          models.sequelize.fn(
            "SUM",
            models.sequelize.col("actualHarvestKilos")
          ),
          "totalHarvest",
        ],
      ],
      where: whereClause,
      group: ["municipality", "province"],
      order: [
        [models.sequelize.fn("COUNT", models.sequelize.col("id")), "DESC"],
      ],
      limit: 10,
      raw: true,
    });

    // Get top provinces
    const topProvinces = await Distribution.findAll({
      attributes: [
        "province",
        [models.sequelize.fn("COUNT", models.sequelize.col("id")), "count"],
        [
          models.sequelize.fn("SUM", models.sequelize.col("fingerlings")),
          "totalFingerlings",
        ],
        [
          models.sequelize.fn(
            "SUM",
            models.sequelize.col("actualHarvestKilos")
          ),
          "totalHarvest",
        ],
      ],
      where: whereClause,
      group: ["province"],
      order: [
        [models.sequelize.fn("COUNT", models.sequelize.col("id")), "DESC"],
      ],
      limit: 10,
      raw: true,
    });

    // Get monthly distribution trends - MySQL compatible
    const monthlyTrends = await Distribution.findAll({
      attributes: [
        [
          models.sequelize.fn(
            "DATE_FORMAT",
            models.sequelize.col("dateDistributed"),
            "%Y-%m-01"
          ),
          "month",
        ],
        "species",
        [models.sequelize.fn("COUNT", models.sequelize.col("id")), "count"],
        [
          models.sequelize.fn("SUM", models.sequelize.col("fingerlings")),
          "totalFingerlings",
        ],
        [
          models.sequelize.fn(
            "SUM",
            models.sequelize.col("actualHarvestKilos")
          ),
          "totalHarvest",
        ],
      ],
      where: whereClause,
      group: [
        models.sequelize.fn(
          "DATE_FORMAT",
          models.sequelize.col("dateDistributed"),
          "%Y-%m-01"
        ),
        "species",
      ],
      order: [
        [
          models.sequelize.fn(
            "DATE_FORMAT",
            models.sequelize.col("dateDistributed"),
            "%Y-%m-01"
          ),
          "DESC",
        ],
      ],
      limit: 12,
      raw: true,
    });

    // Get total counts
    const totalCount = await Distribution.count({ where: whereClause });
    const totalFingerlings = await Distribution.sum("fingerlings", {
      where: whereClause,
    });
    const totalHarvest = await Distribution.sum("actualHarvestKilos", {
      where: whereClause,
    });

    return jsonResponse({
      success: true,
      data: {
        overview: {
          totalDistributions: totalCount,
          totalFingerlings: totalFingerlings || 0,
          totalHarvest: totalHarvest || 0,
        },
        speciesStats,
        topMunicipalities,
        topProvinces,
        monthlyTrends,
      },
    });
  } catch (error) {
    console.error("Distributions Data Stats API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}
