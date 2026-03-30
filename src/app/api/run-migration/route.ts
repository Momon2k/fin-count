import { NextResponse } from "next/server";
import { sequelize } from "@/server/database/models/db";

export async function GET() {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS distribution_images (
        id            INT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
        distributionId INT     NOT NULL,
        imageUrl      TEXT     NOT NULL,
        createdAt     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX distribution_images_distribution_id_index (distributionId),
        FOREIGN KEY (distributionId) REFERENCES Distributions(id) ON DELETE CASCADE
      )
    `);

    return NextResponse.json({ success: true, message: "Table created (or already existed)." });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
