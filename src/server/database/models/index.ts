import AdminProfile from "./admin.profile";
import { sequelize, Sequelize } from "./db";
import StaffProfile from "./staff.profile";
import User from "./user";
import Batch from "./batch";
import Session from "./session";
import Distribution from "./distribution";
import Beneficiary from "./beneficiary";
import DistributionImage from "./distribution.image";

// Import associations to ensure they are loaded
import "./associations";

/* --
 dre ma export tanan ang mga models para dali ra tawagon....
-- */

export default {
  // diri ma export tanan ang models..
  sequelize,
  Sequelize,
  User,
  StaffProfile,
  AdminProfile,
  Batch,
  Session,
  Distribution,
  Beneficiary,
  DistributionImage,
};
