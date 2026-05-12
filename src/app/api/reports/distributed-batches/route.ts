import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import Distribution from "@/server/database/models/distribution";
import Batch from "@/server/database/models/batch";
import User from "@/server/database/models/user";
import StaffProfile from "@/server/database/models/staff.profile";
import { sequelize } from "@/server/database/models/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const species = searchParams.get("species");

    // Build where clause
    const whereClause: any = {
      batchId: {
        [Op.ne]: null, // Only distributions with a batch ID
      },
    };

    // Date range filter
    if (startDate && endDate) {
      whereClause.dateDistributed = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Species filter
    if (species && species !== "All Species") {
      whereClause.species = species;
    }

    // Query for distributed batches
    const distributions = await Distribution.findAll({
      where: whereClause,
      order: [["dateDistributed", "DESC"]],
    });

    // Get unique batch IDs (filter out null values)
    const uniqueBatchIds = Array.from(
      new Set(
        distributions
          .map((d) => d.batchId)
          .filter((id): id is string => id !== null)
      )
    );

    // Fetch batch information
    const batches = await Batch.findAll({
      where: {
        id: {
          [Op.in]: uniqueBatchIds,
        },
      },
    });

    // Create batch map for quick lookup
    const batchInfoMap = new Map();
    batches.forEach((batch: any) => {
      batchInfoMap.set(batch.id, {
        name: batch.name,
        description: batch.description,
        totalCount: batch.totalCount,
        dateCreated: batch.createdAt,
        staffName: "Staff", // We'll get this from distribution user instead
      });
    });

    // Group distributions by batch
    const batchMap = new Map();

    for (const dist of distributions) {
      const batchId = dist.batchId;
      const batchInfo = batchInfoMap.get(batchId);

      if (!batchMap.has(batchId)) {
        batchMap.set(batchId, {
          id: dist.id,
          batchNumber: batchId,
          batchName: batchInfo?.name || "Unknown Batch",
          batchDescription: batchInfo?.description || null,
          batchTotalCount: batchInfo?.totalCount || 0,
          dateCreated: batchInfo?.dateCreated || null,
          species: dist.species,
          distributedQuantity: 0,
          dateDistributed: dist.dateDistributed,
          beneficiaryLocation: `${dist.barangay ? dist.barangay + ", " : ""}${
            dist.municipality
          }, ${dist.province}`,
          staffName: batchInfo?.staffName || "Unknown Staff",
          status: "Completed",
          distributions: [],
        });
      }

      const batchData = batchMap.get(batchId);
      batchData.distributedQuantity += dist.fingerlings;
      batchData.distributions.push({
        beneficiaryName: dist.beneficiaryName,
        fingerlings: dist.fingerlings,
        forecastedHarvestKilos: dist.forecastedHarvestKilos ?? null,
        actualHarvestKilos: dist.actualHarvestKilos ?? null,
        location: `${dist.barangay ? dist.barangay + ", " : ""}${
          dist.municipality
        }, ${dist.province}`,
      });
    }

    // Convert map to array
    const distributedBatches = Array.from(batchMap.values()).map((batch: any) => {
      const batchTotalCount =
        Number(batch.batchTotalCount) > 0
          ? Number(batch.batchTotalCount)
          : Number(batch.distributedQuantity) > 0
            ? Number(batch.distributedQuantity)
            : 0;
      return {
        ...batch,
        batchTotalCount,
      };
    });

    return NextResponse.json({
      success: true,
      data: distributedBatches,
      summary: {
        totalBatches: distributedBatches.length,
        totalFingerlings: distributedBatches.reduce(
          (sum, b) => sum + (Number(b.distributedQuantity) || 0),
          0
        ),
        totalDistributions: distributions.length,
      },
    });
  } catch (error) {
    console.error("Error fetching distributed batches report:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch distributed batches report",
      },
      { status: 500 }
    );
  }
}
