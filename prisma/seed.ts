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
  await prisma.part.deleteMany();
  await prisma.service.deleteMany();
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

  // Inventory
  const parts = [
    { sku: "SCR-IP13", name: "Pantalla iPhone 13 OLED", brand: "Apple", compatibleModels: "iPhone 13,iPhone 13 Pro", cost: 1800, price: 3500, stock: 4, minStock: 2 },
    { sku: "SCR-IP14", name: "Pantalla iPhone 14", brand: "Apple", compatibleModels: "iPhone 14", cost: 2200, price: 4200, stock: 2, minStock: 2 },
    { sku: "BAT-IP13", name: "Batería iPhone 13", brand: "Apple", compatibleModels: "iPhone 13", cost: 450, price: 950, stock: 8, minStock: 3 },
    { sku: "BAT-IP14", name: "Batería iPhone 14", brand: "Apple", compatibleModels: "iPhone 14", cost: 500, price: 1050, stock: 1, minStock: 3 },
    { sku: "SCR-S22", name: "Pantalla Samsung S22", brand: "Samsung", compatibleModels: "Galaxy S22", cost: 2000, price: 3800, stock: 3, minStock: 2 },
    { sku: "BAT-S22", name: "Batería Samsung S22", brand: "Samsung", compatibleModels: "Galaxy S22", cost: 400, price: 850, stock: 0, minStock: 2 },
    { sku: "CHG-USBC", name: "Puerto de carga USB-C universal", brand: "Genérico", compatibleModels: "Multi", cost: 120, price: 350, stock: 15, minStock: 5 },
    { sku: "TOOL-KIT", name: "Kit herramientas reparación", brand: "iFixit", cost: 800, price: 0, stock: 3, minStock: 1 },
  ];
  for (const p of parts) {
    await prisma.part.create({ data: { tenantId: tenant.id, ...p } });
  }

  // Service catalog
  const services = [
    { name: "Cambio de pantalla iPhone 13", category: "screen", price: 3500, durationMin: 45, description: "Incluye pantalla OLED original + mano de obra" },
    { name: "Cambio de pantalla iPhone 14", category: "screen", price: 4200, durationMin: 45 },
    { name: "Cambio de batería iPhone 13", category: "battery", price: 950, durationMin: 30 },
    { name: "Cambio de batería iPhone 14", category: "battery", price: 1050, durationMin: 30 },
    { name: "Cambio de pantalla Samsung S22", category: "screen", price: 3800, durationMin: 60 },
    { name: "Cambio de puerto de carga", category: "screen", price: 450, durationMin: 40 },
    { name: "Diagnóstico profesional", category: "diagnostic", price: 200, durationMin: 15 },
    { name: "Reinstalación de software", category: "software", price: 350, durationMin: 60 },
    { name: "Desbloqueo iCloud (verificación)", category: "software", price: 0, durationMin: 20 },
    { name: "Limpieza interna + lubricación", category: "general", price: 250, durationMin: 30 },
  ];
  for (const s of services) {
    await prisma.service.create({ data: { tenantId: tenant.id, ...s } });
  }

  console.log(
    `Seeded tenant ${tenant.id}: 3 users, ${samples.length} tickets, ${parts.length} parts, ${services.length} services`
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
