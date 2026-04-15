import { prisma } from "./db";
import { hasRole, type SessionUser } from "./auth";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Levenshtein distance — capped at `max` for speed.
function lev(a: string, b: string, max: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length;
  const n = b.length;
  const prev = new Array(n + 1);
  const curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost
      );
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > max) return max + 1;
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

function maxTypos(tokenLen: number): number {
  if (tokenLen <= 3) return 0;
  if (tokenLen <= 5) return 1;
  return 2;
}

// Returns a score 0..1+ where 1 = all tokens matched (with bonuses for exact/prefix).
// Tiered matching:
//   1) substring hit           → +1.0 per token (best)
//   2) prefix match on a word  → +0.95
//   3) fuzzy match on a word   → +0.7 (token length-dependent edit distance)
function score(
  haystacks: (string | null | undefined)[],
  tokens: string[]
): number {
  if (tokens.length === 0) return 0;
  const blob = haystacks
    .filter(Boolean)
    .map((s) => normalize(s as string))
    .join(" ");
  if (!blob) return 0;

  const words = blob.split(/[^a-z0-9]+/).filter(Boolean);
  let acc = 0;

  for (const t of tokens) {
    if (!t) continue;

    if (blob.includes(t)) {
      acc += 1;
      // word-boundary bonus
      const re = new RegExp(
        `(^|\\W)${t.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}(\\W|$)`
      );
      if (re.test(blob)) acc += 0.1;
      continue;
    }

    let prefixHit = false;
    for (const w of words) {
      if (w.startsWith(t)) {
        acc += 0.95;
        prefixHit = true;
        break;
      }
    }
    if (prefixHit) continue;

    // Fuzzy: smallest edit distance to any word
    const budget = maxTypos(t.length);
    if (budget === 0) continue;
    let best = budget + 1;
    for (const w of words) {
      if (Math.abs(w.length - t.length) > budget) continue;
      const d = lev(t, w, budget);
      if (d < best) best = d;
      if (best === 0) break;
    }
    if (best <= budget) {
      // penalize by 0.7 * (1 - best/(budget+1))
      acc += 0.7 * (1 - best / (budget + 1));
    }
  }

  return acc / tokens.length;
}

export type SearchHit =
  | {
      kind: "ticket";
      id: string;
      title: string;
      subtitle: string;
      meta: string;
      href: string;
      score: number;
    }
  | {
      kind: "customer";
      id: string;
      title: string;
      subtitle: string;
      meta: string;
      href: string;
      score: number;
    }
  | {
      kind: "device";
      id: string;
      title: string;
      subtitle: string;
      meta: string;
      href: string;
      score: number;
    }
  | {
      kind: "user";
      id: string;
      title: string;
      subtitle: string;
      meta: string;
      href: string;
      score: number;
    };

export type SearchResult = {
  query: string;
  total: number;
  groups: {
    tickets: SearchHit[];
    customers: SearchHit[];
    devices: SearchHit[];
    users: SearchHit[];
  };
};

const EMPTY: SearchResult = {
  query: "",
  total: 0,
  groups: { tickets: [], customers: [], devices: [], users: [] },
};

export async function globalSearch(
  query: string,
  me: SessionUser,
  limit = 8
): Promise<SearchResult> {
  const q = normalize(query);
  if (!q) return EMPTY;
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return EMPTY;

  const tenantId = me.tenantId;
  const isTechnicianOnly =
    me.role === "TECHNICIAN" && !hasRole(me, "RECEPTION");

  // Fetch bounded slices per tenant. For scale > 10k rows, move to FTS/Postgres tsvector.
  const [tickets, customers, devices, users] = await Promise.all([
    prisma.ticket.findMany({
      where: {
        tenantId,
        ...(isTechnicianOnly ? { technicianId: me.id } : {}),
      },
      include: { customer: true, device: true, technician: true },
      orderBy: { receivedAt: "desc" },
      take: 500,
    }),
    prisma.customer.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.device.findMany({
      where: { customer: { tenantId } },
      include: { customer: true },
      orderBy: { id: "desc" },
      take: 500,
    }),
    hasRole(me, "ADMIN")
      ? prisma.user.findMany({
          where: { tenantId },
          orderBy: { name: "asc" },
          take: 200,
        })
      : Promise.resolve([]),
  ]);

  const ticketHits: SearchHit[] = [];
  for (const t of tickets) {
    const s = score(
      [
        t.folio,
        t.reportedIssue,
        t.diagnosis,
        t.status,
        t.customer.name,
        t.customer.phone,
        t.customer.email,
        t.device.brand,
        t.device.model,
        t.device.imei,
        t.device.color,
        t.technician?.name,
      ],
      tokens
    );
    if (s > 0) {
      ticketHits.push({
        kind: "ticket",
        id: t.id,
        title: `${t.device.brand} ${t.device.model}`,
        subtitle: `${t.folio} · ${t.customer.name}`,
        meta: t.status,
        href: `/tickets/${t.id}`,
        score: s,
      });
    }
  }

  const customerHits: SearchHit[] = [];
  for (const c of customers) {
    const s = score([c.name, c.phone, c.email, c.notes], tokens);
    if (s > 0) {
      customerHits.push({
        kind: "customer",
        id: c.id,
        title: c.name,
        subtitle: c.phone,
        meta: c.email ?? "",
        href: `/tickets?customer=${c.id}`,
        score: s,
      });
    }
  }

  const deviceHits: SearchHit[] = [];
  for (const d of devices) {
    const s = score(
      [d.brand, d.model, d.imei, d.color, (d as any).customer?.name],
      tokens
    );
    if (s > 0) {
      deviceHits.push({
        kind: "device",
        id: d.id,
        title: `${d.brand} ${d.model}`,
        subtitle: d.imei ?? (d.color ?? "—"),
        meta: (d as any).customer?.name ?? "",
        href: `/tickets?device=${d.id}`,
        score: s,
      });
    }
  }

  const userHits: SearchHit[] = [];
  for (const u of users) {
    const s = score([u.name, u.email, u.role], tokens);
    if (s > 0) {
      userHits.push({
        kind: "user",
        id: u.id,
        title: u.name,
        subtitle: u.email,
        meta: u.role,
        href: `/ajustes`,
        score: s,
      });
    }
  }

  const sortAndLimit = (arr: SearchHit[]) =>
    arr.sort((a, b) => b.score - a.score).slice(0, limit);

  const groups = {
    tickets: sortAndLimit(ticketHits),
    customers: sortAndLimit(customerHits),
    devices: sortAndLimit(deviceHits),
    users: sortAndLimit(userHits),
  };

  const total =
    groups.tickets.length +
    groups.customers.length +
    groups.devices.length +
    groups.users.length;

  return { query, total, groups };
}
