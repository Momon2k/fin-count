import { NextResponse } from "next/server";
import { sequelize } from "@/server/database/models/db";

export async function GET() {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS distribution_images (
        id            INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
        distributionId INT         NOT NULL,
        imageUrl      MEDIUMTEXT   NOT NULL,
        createdAt     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX distribution_images_distribution_id_index (distributionId),
        FOREIGN KEY (distributionId) REFERENCES Distributions(id) ON DELETE CASCADE
      )
    `);

    // Upgrade existing deployments: widen imageUrl from TEXT to MEDIUMTEXT
    // so that base64-encoded images (up to ~2.67 MB) fit in the column.
    await sequelize.query(`
      ALTER TABLE distribution_images
        MODIFY COLUMN imageUrl MEDIUMTEXT NOT NULL
    `);

    return NextResponse.json({ success: true, message: "Table ready (imageUrl upgraded to MEDIUMTEXT)." });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
