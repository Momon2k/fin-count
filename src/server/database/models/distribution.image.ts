import {
  Model,
  DataTypes,
  InferCreationAttributes,
  InferAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "./db";

class DistributionImage extends Model<
  InferAttributes<DistributionImage>,
  InferCreationAttributes<DistributionImage, { omit: "id" | "createdAt" }>
> {
  declare readonly id: CreationOptional<number>;
  declare distributionId: number;
  declare imageUrl: string;
  declare readonly createdAt: CreationOptional<Date>;
}

DistributionImage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    distributionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.TEXT("medium"),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "DistributionImage",
    tableName: "distribution_images",
    freezeTableName: true,
    updatedAt: false,
    indexes: [
      {
        name: "distribution_images_distribution_id_index",
        fields: ["distributionId"],
      },
    ],
  }
);

export default DistributionImage;
