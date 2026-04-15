import { prisma } from "./db";

// Format: TGR-{BRANCH_CODE}-{YYMM}-{SEQ}
export async function generateFolio(branchCode: string): Promise<string> {
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `TGR-${branchCode}-${yymm}-`;

  const last = await prisma.ticket.findFirst({
    where: { folio: { startsWith: prefix } },
    orderBy: { folio: "desc" },
    select: { folio: true },
  });

  const nextSeq = last
    ? parseInt(last.folio.split("-").pop() ?? "0", 10) + 1
    : 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}
