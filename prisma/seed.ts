import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.activity.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.device.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.tenant.deleteMany();

  const tenant = await prisma.tenant.create({
    data: { name: "TigerFix Demo", plan: "pro" },
  });

  const branch = await prisma.branch.create({
    data: { tenantId: tenant.id, name: "Sucursal Centro", address: "CDMX" },
  });

  const password = await bcrypt.hash("tigerfix", 10);

  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      email: "admin@tigerfix.dev",
      name: "Egger Rojas",
      role: "ADMIN",
      passwordHash: password,
    },
  });

  const reception = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      email: "recepcion@tigerfix.dev",
      name: "Ana Recepción",
      role: "RECEPTION",
      passwordHash: password,
    },
  });

  const tech = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      email: "luis@tigerfix.dev",
      name: "Luis Técnico",
      role: "TECHNICIAN",
      passwordHash: password,
    },
  });

  const customer = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      name: "Juan Pérez",
      phone: "5512345678",
      email: "juan@example.com",
    },
  });

  const device = await prisma.device.create({
    data: {
      customerId: customer.id,
      brand: "Apple",
      model: "iPhone 13",
      imei: "356789012345678",
      color: "Negro",
    },
  });

  const samples: { status: string; folio: string; issue: string }[] = [
    { status: "NEW", folio: "TGR-CDMX-2604-0001", issue: "No enciende" },
    { status: "DIAGNOSIS", folio: "TGR-CDMX-2604-0002", issue: "Batería drena rápido" },
    { status: "QUOTED", folio: "TGR-CDMX-2604-0003", issue: "Pantalla rota" },
    { status: "REPAIRING", folio: "TGR-CDMX-2604-0004", issue: "Cambio de puerto carga" },
    { status: "READY", folio: "TGR-CDMX-2604-0005", issue: "Reemplazo batería" },
    { status: "DELIVERED", folio: "TGR-CDMX-2604-0006", issue: "Software reinstalación" },
  ];

  for (const s of samples) {
    const t = await prisma.ticket.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        folio: s.folio,
        customerId: customer.id,
        deviceId: device.id,
        technicianId: tech.id,
        status: s.status,
        reportedIssue: s.issue,
        laborCost: 500,
        partsCost: 800,
        total: 1300,
        deposit: 400,
      },
    });

    if (["APPROVED", "REPAIRING", "READY", "DELIVERED"].includes(s.status)) {
      await prisma.payment.create({
        data: {
          ticketId: t.id,
          amount: 400,
          type: "DEPOSIT",
          method: "cash",
        },
      });
    }
    if (s.status === "DELIVERED") {
      await prisma.payment.create({
        data: {
          ticketId: t.id,
          amount: 900,
          type: "FINAL",
          method: "card",
        },
      });
    }
  }

  console.log(
    `Seeded tenant ${tenant.id} with 3 users (admin/recepcion/luis), ${samples.length} tickets`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
