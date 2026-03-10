import { NextRequest, NextResponse } from "next/server";
import Distribution from "@/server/database/models/distribution";
import models from "@/server/database/models";
import { Op } from "sequelize";
import { softDeleteDistributions } from "@/server/services/distribution.service";

const DEFAULT_ML_API_URL = "https://fast-api-prediction-production.up.railway.app";

const ML_API_URL =
  process.env.ML_API_URL ??
  process.env.FASTAPI_PREDICT_URL ??
  process.env.PREDICTION_API_URL ??
  DEFAULT_ML_API_URL;

function resolvePredictDistributionUrl(rawUrl: string) {
  const trimmed = rawUrl.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  if (trimmed.includes("/api/v1/predict-distribution")) return trimmed;
  if (/\/api\/v1\/predict$/.test(trimmed)) {
    return trimmed.replace(/\/api\/v1\/predict$/, "/api/v1/predict-distribution");
  }
  return `${trimmed}/api/v1/predict-distribution`;
}

// Helper function for JSON responses
function jsonResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/distributions-data - Fetch distribution data from database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters
    const species = searchParams.get("species");
    const municipality = searchParams.get("municipality");
    const province = searchParams.get("province");
    const barangay = searchParams.get("barangay");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    // Build where clause
    const whereClause: any = {};

    // Filter by species
    if (species) {
      whereClause.species = species;
    }

    // Filter by municipality
    if (municipality) {
      whereClause.municipality = {
        [Op.like]: `%${municipality}%`,
      };
    }

    // Filter by province
    if (province) {
      whereClause.province = {
        [Op.like]: `%${province}%`,
      };
    }

    // Filter by barangay
    if (barangay) {
      whereClause.barangay = {
        [Op.like]: `%${barangay}%`,
      };
    }

    // Search by beneficiary name or location
    if (search) {
      whereClause[Op.or] = [
        {
          beneficiaryName: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          municipality: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          province: {
            [Op.like]: `%${search}%`,
          },
        },
        {
          barangay: {
            [Op.like]: `%${search}%`,
          },
        },
      ];
    }

    // Filter by date range
    if (startDate || endDate) {
      whereClause.dateDistributed = {};
      if (startDate) {
        whereClause.dateDistributed[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.dateDistributed[Op.lte] = new Date(endDate);
      }
    }

    const activeCount = await Distribution.count({
      where: whereClause,
      paranoid: true,
    });
    const totalCount = await Distribution.count({
      where: whereClause,
      paranoid: false,
    });
    const deletedCount = Math.max(totalCount - activeCount, 0);
    const totalDistributions = includeDeleted ? totalCount : activeCount;

    // Calculate pagination
    const totalPages = Math.ceil(totalDistributions / limit);
    const offset = (page - 1) * limit;

    // Fetch distributions with pagination
    const distributions = await Distribution.findAll({
      where: whereClause,
      paranoid: !includeDeleted ? true : false,
      include: [
        {
          model: models.User,
          as: "user",
          attributes: ["id", "email", "userType"],
        },
        {
          model: models.Beneficiary,
          as: "beneficiaryProfile",
          attributes: ["id", "contactNumber"],
        },
      ],
      order: [["dateDistributed", "DESC"]],
      limit,
      offset,
    });

    return jsonResponse({
      success: true,
      data: {
        distributions,
        counts: {
          active: activeCount,
          deleted: deletedCount,
          total: totalCount,
        },
        pagination: {
          currentPage: page,
          totalPages,
          totalDistributions,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Distributions Data GET API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

// POST /api/distributions-data - Create new distribution record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const municipality = body.municipality ?? body.city;
    const requestedUserId = Number(body.userId);

    // Validate required fields
    const requiredFields = [
      "dateDistributed",
      "beneficiaryName",
      "barangay",
      "province",
      "fingerlings",
      "species",
      "userId",
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return jsonResponse(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          400
        );
      }
    }

    if (typeof municipality !== "string" || !municipality.trim()) {
      return jsonResponse(
        {
          success: false,
          error: "Missing required field: municipality",
        },
        400
      );
    }

    if (!Number.isInteger(requestedUserId) || requestedUserId <= 0) {
      return jsonResponse(
        {
          success: false,
          error: "Invalid userId",
        },
        400
      );
    }

    const user = await models.User.findByPk(requestedUserId);
    const fallbackUser =
      user ??
      (await models.User.findOne({
        where: { userType: "admin" },
        order: [["id", "ASC"]],
      })) ??
      (await models.User.findOne({ order: [["id", "ASC"]] }));

    if (!fallbackUser) {
      return jsonResponse(
        {
          success: false,
          error: "No valid user found to associate this distribution",
        },
        400
      );
    }

    const effectiveUserId = fallbackUser.id;

    // Validate species
    if (!["Tilapia", "Bangus"].includes(body.species)) {
      return jsonResponse(
        {
          success: false,
          error: "species must be either 'Tilapia' or 'Bangus'",
        },
        400
      );
    }

    // Validate fingerlings is a positive number
    if (typeof body.fingerlings !== "number" || body.fingerlings <= 0) {
      return jsonResponse(
        {
          success: false,
          error: "fingerlings must be a positive number",
        },
        400
      );
    }

    if (typeof body.dateDistributed !== "string" || !body.dateDistributed.trim()) {
      return jsonResponse(
        {
          success: false,
          error: "dateDistributed must be a non-empty string",
        },
        400
      );
    }

    // Calculate forecasted harvest date based on species
    // Bangus: 3 months, Tilapia: 4 months
    const distributionDate = new Date(body.dateDistributed);
    const forecastedHarvestDate = new Date(distributionDate);
    const monthsToAdd = body.species === "Bangus" ? 3 : 4;
    forecastedHarvestDate.setMonth(distributionDate.getMonth() + monthsToAdd);

    if (typeof body.batchId === "string" && body.batchId.trim()) {
      const batchId = body.batchId.trim();
      const existingBatch = await models.Batch.findByPk(batchId);

      if (!existingBatch) {
        await models.Batch.create({
          id: batchId,
          name: batchId,
          description: null,
          userId: effectiveUserId,
          totalCount: body.fingerlings,
          isActive: true,
        });
      } else if (
        (existingBatch.totalCount === 0 || existingBatch.totalCount === null) &&
        typeof body.fingerlings === "number" &&
        body.fingerlings > 0
      ) {
        await existingBatch.update({
          totalCount: body.fingerlings,
        });
      }
    }

    let forecastedHarvestKilos = 0;
    let mlError: string | null = null;

    if (!ML_API_URL || !ML_API_URL.trim()) {
      console.error("ML prediction endpoint is not configured");
      mlError = "ML prediction endpoint is not configured";
    } else {
      try {
        const predictionUrl = resolvePredictDistributionUrl(ML_API_URL);
        const predictionResponse = await fetch(
          predictionUrl,
          {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            species: body.species,
            province: body.province,
            municipality: municipality,
            barangay: body.barangay,
            fingerlings: body.fingerlings,
            dateDistributed: body.dateDistributed,
          }),
          signal: AbortSignal.timeout(15_000),
          }
        );

        if (!predictionResponse.ok) {
          const errText = await predictionResponse.text();
          mlError = `ML prediction failed: ${predictionResponse.status} ${errText}`;
        } else {
          let prediction: any = null;
          try {
            prediction = await predictionResponse.json();
          } catch (error) {
            console.error("ML forecast response was not valid JSON:", error);
            mlError = "ML forecast response was not valid JSON";
          }

          const rawForecast =
            prediction?.forecastedHarvestKilos ??
            prediction?.data?.forecastedHarvestKilos ??
            0;
          const value = Number(rawForecast);
          if (Number.isFinite(value) && value > 0) {
            forecastedHarvestKilos = Math.round(value);
          } else {
            mlError = "ML service returned an invalid forecast value";
          }
        }
      } catch (error) {
        console.error("ML service unreachable:", error);
        mlError = "ML service unreachable";
      }
    }

    if (!forecastedHarvestKilos || forecastedHarvestKilos <= 0) {
      return jsonResponse(
        {
          success: false,
          error: mlError ?? "Unable to extract ML forecast",
        },
        502
      );
    }

    // Create new distribution
    const newDistribution = await Distribution.create({
      dateDistributed: new Date(body.dateDistributed),
      beneficiaryName: body.beneficiaryName,
      beneficiaryId:
        typeof body.beneficiaryId === "number" ? body.beneficiaryId : null,
      barangay: body.barangay || null,
      municipality: municipality,
      province: body.province,
      fingerlings: body.fingerlings,
      species: body.species,
      userId: effectiveUserId,
      batchId: body.batchId || null,
      forecastedHarvestDate: forecastedHarvestDate,
      forecastedHarvestKilos,
      actualHarvestKilos: body.actualHarvestKilos || null,
      actualHarvestDate: body.actualHarvestDate
        ? new Date(body.actualHarvestDate)
        : null,
      remarks: body.remarks || null,
      customRemarks: body.customRemarks || null,
    });

    // Fetch the created distribution with user data
    const distributionWithUser = await Distribution.findByPk(
      newDistribution.id,
      {
        include: [
          {
            model: models.User,
            as: "user",
            attributes: ["id", "email", "userType"],
          },
        ],
      }
    );

    return jsonResponse(
      {
        success: true,
        data: distributionWithUser,
        message: "Distribution record created successfully",
        warning:
          user && effectiveUserId === requestedUserId
            ? null
            : "Requested userId was not found; using a fallback user",
      },
      201
    );
  } catch (error) {
    console.error("Distributions Data POST API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

// DELETE /api/distributions-data - Bulk delete distributions
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, actor } = body;

    const result = await softDeleteDistributions({ ids, actor });
    if (!result.success) {
      return jsonResponse(result, 400);
    }

    return jsonResponse({
      success: true,
      message: `Successfully deleted ${result.affectedCount} distribution(s)`,
      deletedCount: result.affectedCount,
      requestedCount: result.requestedCount,
      deletedIds: result.affectedIds,
      notFoundIds: result.notFoundIds,
      unauthorizedIds: result.unauthorizedIds,
      alreadyDeletedIds: result.skippedIds,
    });
  } catch (error) {
    console.error("Distributions Data DELETE API Error:", error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}
