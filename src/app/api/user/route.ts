// src/app/api/user/route.ts
import * as bcrypt from "bcrypt";
import { Role, UserCreationAttributes } from "@/server/database/models/user";

import models from "@/server/database/models";
import { NextRequest, NextResponse } from "next/server";
import { jsonResponse } from "@/server/helpers/function.helpers";
import { Op } from "sequelize";
import { getToken } from "next-auth/jwt";

interface StaffProfile {
  fullName: string;
  username: string;
  phoneNumber: string;
  profilePhoto?: string;
}

interface AdminProfile {
  firstName: string;
  lastName: string;
}

interface ExtendedUserCreationAttributes extends UserCreationAttributes {
  staffProfile?: StaffProfile;
  adminProfile?: AdminProfile;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request as JSON
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.password) {
      return jsonResponse({
        success: false,
        error: "Missing required fields",
        status: 400,
      });
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    // Check for existing email
    const isEmailExist = await models.User.findOne({
      attributes: ["email"],
      where: { email: body.email },
    });

    if (isEmailExist) {
      return jsonResponse({
        success: false,
        error: "Email already exists",
        status: 400,
      });
    }

    // Check if admin email
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

    const isAdmin = adminEmails.some(
      (adminEmail: string) => adminEmail === body.email
    );

    if (!token?.user) {
      const adminCount = await models.User.count({
        where: {
          userType: Role.admin,
        },
      });

      if (!isAdmin || adminCount > 0) {
        return jsonResponse({
          success: false,
          error: "Unauthorized",
          status: 401,
        });
      }
    } else if ((token as any).user.userType !== Role.admin) {
      return jsonResponse({
        success: false,
        error: "Forbidden",
        status: 403,
      });
    }

    // Create user data
    const userData: ExtendedUserCreationAttributes = {
      email: body.email,
      password: await bcrypt.hash(body.password, 10),
      userType: Role.admin,
    };

    // Add profile data based on user type
    const effectiveUserType = userData.userType;

    if (
      effectiveUserType === Role.staff &&
      typeof body.fullName === "string" &&
      typeof body.username === "string" &&
      typeof body.phoneNumber === "string"
    ) {
      userData.staffProfile = {
        fullName: body.fullName,
        username: body.username,
        phoneNumber: body.phoneNumber,
        profilePhoto: body.profilePhoto,
      };
    } else if (effectiveUserType === Role.admin) {
      const firstName =
        typeof body.firstName === "string" ? body.firstName.trim() : "";
      const lastName =
        typeof body.lastName === "string" ? body.lastName.trim() : "";

      const fullName = typeof body.fullName === "string" ? body.fullName : "";
      const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
      const firstNameFromFullName = nameParts[0] || "";
      const lastNameFromFullName = nameParts.slice(1).join(" ");

      const resolvedFirstName = firstName || firstNameFromFullName;
      const resolvedLastName = lastName || lastNameFromFullName || "Admin";

      if (resolvedFirstName) {
        userData.adminProfile = {
          firstName: resolvedFirstName,
          lastName: resolvedLastName,
        };
      }
    }

    // Begin transaction and create records
    const result = await models.sequelize.transaction(async (transaction) => {
      // Create the user first
      const user = await models.User.create(
        {
          email: userData.email,
          password: userData.password,
          userType: userData.userType,
        },
        { transaction }
      );

      // Now create the appropriate profile based on user type
      if (effectiveUserType === Role.staff && userData.staffProfile) {
        await models.StaffProfile.create(
          {
            userId: user.id,
            ...userData.staffProfile,
          },
          { transaction }
        );
      } else if (effectiveUserType === Role.admin && userData.adminProfile) {
        await models.AdminProfile.create(
          {
            userId: user.id,
            ...userData.adminProfile,
          },
          { transaction }
        );
      }

      return user;
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = result.toJSON();

    return jsonResponse({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      status: 500,
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Optional query parameters for filtering/pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const userType = searchParams.get("userType");
    const search = searchParams.get("search");

    // Build where clause for filtering
    const whereClause: any = {};

    if (userType) {
      whereClause.userType = userType;
    }

    if (search) {
      whereClause[Op.or] = [{ email: { [Op.iLike]: `%${search}%` } }];
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // First, get users without associations
    const { count, rows: users } = await models.User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      attributes: {
        exclude: ["password"],
      },
    });

    // Get user IDs for profile queries
    const userIds = users.map((user) => user.id);

    // Fetch staff profiles separately
    const staffProfiles =
      userIds.length > 0
        ? await models.StaffProfile.findAll({
            where: {
              userId: {
                [Op.in]: userIds,
              },
            },
            attributes: [
              "userId",
              "fullName",
              "username",
              "phoneNumber",
              "profilePhoto",
            ],
          })
        : [];

    // Fetch admin profiles separately
    const adminProfiles =
      userIds.length > 0
        ? await models.AdminProfile.findAll({
            where: {
              userId: {
                [Op.in]: userIds,
              },
            },
            attributes: ["userId", "firstName", "lastName"],
          })
        : [];

    // Create lookup maps for profiles
    const staffProfileMap = new Map();
    staffProfiles.forEach((profile) => {
      const data = profile.get({ plain: true });
      staffProfileMap.set(data.userId, data);
    });

    const adminProfileMap = new Map();
    adminProfiles.forEach((profile) => {
      const data = profile.get({ plain: true });
      adminProfileMap.set(data.userId, data);
    });

    // Transform users data with profile information
    const transformedUsers = users.map((user) => {
      const userData = user.get({ plain: true });
      const staffProfile = staffProfileMap.get(userData.id);
      const adminProfile = adminProfileMap.get(userData.id);

      // Determine display name based on user type and profile
      let displayName = userData.email; // fallback

      if (staffProfile) {
        displayName = staffProfile.fullName;
      } else if (adminProfile) {
        displayName = `${adminProfile.firstName} ${adminProfile.lastName}`;
      }

      return {
        id: userData.id,
        email: userData.email,
        userType: userData.userType,
        name: displayName,
        username: staffProfile?.username || null,
        phoneNumber: staffProfile?.phoneNumber || null,
        profilePhoto: staffProfile?.profilePhoto || null,
        firstName: adminProfile?.firstName || null,
        lastName: adminProfile?.lastName || null,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        status: "active", // Default status
      };
    });

    // Return paginated response
    return jsonResponse({
      success: true,
      data: {
        users: transformedUsers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalUsers: count,
          hasNextPage: page < Math.ceil(count / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Users API Error:", error);
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    if (!id || isNaN(id)) {
      return jsonResponse({
        success: false,
        error: "Valid user ID required",
        status: 400,
      });
    }

    const user = await models.User.findByPk(id);

    if (!user) {
      return jsonResponse({
        success: false,
        error: "User not found",
        status: 404,
      });
    }

    // Delete user and associated profiles in transaction
    await models.sequelize.transaction(async (transaction) => {
      // Delete associated profiles first
      await Promise.all([
        models.StaffProfile.destroy({
          where: { userId: id },
          transaction,
        }),
        models.AdminProfile.destroy({
          where: { userId: id },
          transaction,
        }),
      ]);

      // Delete the user
      await user.destroy({ transaction });
    });

    return jsonResponse({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User API Error:", error);
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500,
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();

    if (!id || isNaN(id)) {
      return jsonResponse({
        success: false,
        error: "Valid user ID required",
        status: 400,
      });
    }

    const user = await models.User.findByPk(id);

    if (!user) {
      return jsonResponse({
        success: false,
        error: "User not found",
        status: 404,
      });
    }

    // Update user and profiles in transaction
    const updatedUser = await models.sequelize.transaction(
      async (transaction) => {
        // Update basic user info
        if (body.email || body.userType) {
          await user.update(
            {
              email: body.email || user.email,
              userType: body.userType || user.userType,
            },
            { transaction }
          );
        }

        // Update staff profile if provided
        if (body.staffProfile) {
          const existingStaffProfile = await models.StaffProfile.findOne({
            where: { userId: id },
            transaction,
          });

          if (existingStaffProfile) {
            await existingStaffProfile.update(body.staffProfile, {
              transaction,
            });
          } else if (user.userType === "staff") {
            // Create new staff profile if user is staff type
            await models.StaffProfile.create(
              {
                userId: id,
                ...body.staffProfile,
              },
              { transaction }
            );
          }
        }

        // Update admin profile if provided
        if (body.adminProfile) {
          const existingAdminProfile = await models.AdminProfile.findOne({
            where: { userId: id },
            transaction,
          });

          if (existingAdminProfile) {
            await existingAdminProfile.update(body.adminProfile, {
              transaction,
            });
          } else if (user.userType === "admin") {
            // Create new admin profile if user is admin type
            await models.AdminProfile.create(
              {
                userId: id,
                ...body.adminProfile,
              },
              { transaction }
            );
          }
        }

        // Return the updated user (fetch fresh data)
        return await models.User.findByPk(id, {
          attributes: { exclude: ["password"] },
          transaction,
        });
      }
    );

    if (!updatedUser) {
      throw new Error("Failed to retrieve updated user");
    }

    // Fetch updated profiles separately
    const [staffProfile, adminProfile] = await Promise.all([
      models.StaffProfile.findOne({
        where: { userId: id },
        attributes: ["fullName", "username", "phoneNumber", "profilePhoto"],
      }),
      models.AdminProfile.findOne({
        where: { userId: id },
        attributes: ["firstName", "lastName"],
      }),
    ]);

    // Transform response data
    const userData = updatedUser.get({ plain: true });
    const staffData = staffProfile?.get({ plain: true });
    const adminData = adminProfile?.get({ plain: true });

    let displayName = userData.email;
    if (staffData) {
      displayName = staffData.fullName;
    } else if (adminData) {
      displayName = `${adminData.firstName} ${adminData.lastName}`;
    }

    const responseData = {
      ...userData,
      name: displayName,
      username: staffData?.username || null,
      phoneNumber: staffData?.phoneNumber || null,
      profilePhoto: staffData?.profilePhoto || null,
      firstName: adminData?.firstName || null,
      lastName: adminData?.lastName || null,
    };

    return jsonResponse({
      success: true,
      data: responseData,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update User API Error:", error);
    return jsonResponse({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
      status: 500,
    });
  }
}
