import { NextRequest, NextResponse } from "next/server";
import DistributionImage from "@/server/database/models/distribution.image";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid image id" },
        { status: 400 }
      );
    }

    const image = await DistributionImage.findByPk(id);

    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    await image.destroy();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting distribution image:", error);
    return NextResponse.json(
      { success: false, error: error?.message ?? "Failed to delete image" },
      { status: 500 }
    );
  }
}
