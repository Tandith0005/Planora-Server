import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { Role } from "../../generated/client/enums.js";
import { envVars } from "../../config/envVars.js";

const seedAdmin = async () => {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: Role.ADMIN },
    });

    if (existingAdmin) {
      console.log(`Current Admin's email is : ${envVars.ADMIN_EMAIL}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(envVars.ADMIN_PASSWORD, 10);

    await prisma.user.create({
      data: {
        name: "Admin",
        email: envVars.ADMIN_EMAIL,
        password: hashedPassword,
        role: Role.ADMIN,
        isVerified: true,
      },
    });

    console.log(`Admin created successfully, Current Admin's email is : ${envVars.ADMIN_EMAIL}`);
  } catch (error) {
    console.error(" Error seeding admin:", error);
  }
};

export default seedAdmin;