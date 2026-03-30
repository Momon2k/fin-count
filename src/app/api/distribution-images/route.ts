import { NextRequest, NextResponse } from "next/server";
import DistributionImage from "@/server/database/models/distribution.image";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const distributionId = searchParams.get("distributionId");

    if (!distributionId) {
      return NextResponse.json(
        { success: false, error: "distributionId is required" },
        { status: 400 }
      );
    }

    const images = await DistributionImage.findAll({
      where: { distributionId: parseInt(distributionId) },
      order: [["createdAt", "ASC"]],
    });

    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error("Error fetching distribution images:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { distributionId, imageUrls } = body;

    if (
      !distributionId ||
      !imageUrls ||
      !Array.isArray(imageUrls) ||
      imageUrls.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "distributionId and imageUrls are required" },
        { status: 400 }
      );
    }

    const records = await DistributionImage.bulkCreate(
      imageUrls.map((url: string) => ({
        distributionId: parseInt(String(distributionId)),
        imageUrl: url,
      }))
    );

    return NextResponse.json({ success: true, images: records });
  } catch (error: any) {
    console.error("Error saving distribution images:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message ?? "Failed to save images",
        sqlMessage: error?.parent?.sqlMessage ?? null,
        sql: error?.sql ?? null,
      },
      { status: 500 }
    );
  }
}
