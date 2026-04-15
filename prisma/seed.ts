import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: { name: "RepairOS Demo", plan: "pro" },
  });

  const branch = await prisma.branch.create({
    data: { tenantId: tenant.id, name: "Sucursal Centro", address: "CDMX" },
  });

  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      email: "admin@repairos.dev",
      name: "Egger Rojas",
      role: "ADMIN",
    },
  });

  const tech = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      email: "luis@repairos.dev",
      name: "Luis Técnico",
      role: "TECHNICIAN",
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
    { status: "NEW", folio: "CDMX-2604-0001", issue: "No enciende" },
    { status: "DIAGNOSIS", folio: "CDMX-2604-0002", issue: "Batería drena rápido" },
    { status: "QUOTED", folio: "CDMX-2604-0003", issue: "Pantalla rota" },
    { status: "REPAIRING", folio: "CDMX-2604-0004", issue: "Cambio de puerto carga" },
    { status: "READY", folio: "CDMX-2604-0005", issue: "Reemplazo batería" },
    { status: "DELIVERED", folio: "CDMX-2604-0006", issue: "Software reinstalación" },
  ];

  for (const s of samples) {
    await prisma.ticket.create({
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
  }

  console.log(`Seeded tenant ${tenant.id} with ${samples.length} tickets`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
