"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() { for (const name of [client_1.RoleName.super_admin, client_1.RoleName.coach, client_1.RoleName.assistant_coach, client_1.RoleName.client])
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } }); console.log('Roles seeded'); }
main().finally(() => prisma.$disconnect());
