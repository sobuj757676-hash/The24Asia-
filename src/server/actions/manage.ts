"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  course,
  cohort,
  cohortSession,
  event,
  opportunity,
  service,
  impactMetric,
  partner,
  liveShowEpisode,
  product,
  productVariant,
  policy,
  contentItem,
  contentTranslation,
} from "@/db/schema";
import { requirePermission } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { slugify } from "@/lib/utils";

function str(fd: FormData, k: string) {
  const v = fd.get(k);
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
function bool(fd: FormData, k: string) {
  return fd.get(k) === "on" || fd.get(k) === "true";
}
function int(fd: FormData, k: string) {
  const v = str(fd, k);
  return v ? Number(v) : undefined;
}
function date(fd: FormData, k: string) {
  const v = str(fd, k);
  return v ? new Date(v) : undefined;
}

/* ---------------------------------------------------------------- Courses */

export async function saveCourse(fd: FormData) {
  const staff = await requirePermission("course:manage");
  const id = str(fd, "id");
  const title = str(fd, "title");
  if (!title) return;
  const values = {
    title,
    slug: str(fd, "slug") || slugify(title),
    summary: str(fd, "summary"),
    outline: str(fd, "outline"),
    category: str(fd, "category"),
    durationLabel: str(fd, "durationLabel"),
    prerequisites: str(fd, "prerequisites"),
    outcomes: (str(fd, "outcomes") || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    isFree: bool(fd, "isFree"),
    published: bool(fd, "published"),
    displayOrder: int(fd, "displayOrder") ?? 0,
  };
  if (id) {
    await db.update(course).set(values).where(eq(course.id, id));
  } else {
    await db.insert(course).values(values);
  }
  await audit({
    actorId: staff.personId,
    action: id ? "course.updated" : "course.created",
    objectType: "course",
    objectId: id,
  });
  revalidatePath("/admin/programs");
  revalidatePath("/learn");
}

export async function deleteCourse(id: string) {
  const staff = await requirePermission("course:manage");
  await db.delete(course).where(eq(course.id, id));
  await audit({ actorId: staff.personId, action: "course.deleted", objectType: "course", objectId: id });
  revalidatePath("/admin/programs");
}

/* ---------------------------------------------------------------- Cohorts */

export async function saveCohort(fd: FormData) {
  const staff = await requirePermission("cohort:manage");
  const id = str(fd, "id");
  const courseId = str(fd, "courseId");
  const code = str(fd, "code");
  if (!courseId || !code) return;
  const values = {
    courseId,
    code,
    status: (str(fd, "status") as never) ?? ("draft" as never),
    deliveryMode: (str(fd, "deliveryMode") as never) ?? ("in_person" as never),
    locationName: str(fd, "locationName"),
    startDate: date(fd, "startDate"),
    endDate: date(fd, "endDate"),
    capacity: int(fd, "capacity") ?? 30,
    meetingLink: str(fd, "meetingLink"),
  };
  if (id) {
    await db.update(cohort).set(values).where(eq(cohort.id, id));
  } else {
    await db.insert(cohort).values(values);
  }
  await audit({ actorId: staff.personId, action: id ? "cohort.updated" : "cohort.created", objectType: "cohort", objectId: id });
  revalidatePath("/admin/programs");
}

export async function addCohortSession(fd: FormData) {
  const staff = await requirePermission("cohort:manage");
  const cohortId = str(fd, "cohortId");
  const startsAt = date(fd, "startsAt");
  if (!cohortId || !startsAt) return;
  await db.insert(cohortSession).values({
    cohortId,
    sequence: int(fd, "sequence") ?? 1,
    title: str(fd, "title"),
    startsAt,
    endsAt: date(fd, "endsAt"),
  });
  await audit({ actorId: staff.personId, action: "cohort_session.created", objectType: "cohort", objectId: cohortId });
  revalidatePath(`/admin/programs/cohorts/${cohortId}`);
}

/* ----------------------------------------------------------------- Events */

export async function saveEvent(fd: FormData) {
  const staff = await requirePermission("event:manage");
  const id = str(fd, "id");
  const title = str(fd, "title");
  const startsAt = date(fd, "startsAt");
  if (!title || !startsAt) return;
  const values = {
    title,
    slug: str(fd, "slug") || slugify(title),
    category: (str(fd, "category") as never) ?? ("education" as never),
    status: (str(fd, "status") as never) ?? ("draft" as never),
    description: str(fd, "description"),
    startsAt,
    endsAt: date(fd, "endsAt"),
    locationName: str(fd, "locationName"),
    mapUrl: str(fd, "mapUrl"),
    capacity: int(fd, "capacity"),
    whatToBring: str(fd, "whatToBring"),
  };
  if (id) {
    await db.update(event).set(values).where(eq(event.id, id));
  } else {
    await db.insert(event).values(values);
  }
  await audit({ actorId: staff.personId, action: id ? "event.updated" : "event.created", objectType: "event", objectId: id });
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function deleteEvent(id: string) {
  const staff = await requirePermission("event:manage");
  await db.delete(event).where(eq(event.id, id));
  await audit({ actorId: staff.personId, action: "event.deleted", objectType: "event", objectId: id });
  revalidatePath("/admin/events");
}

/* ---------------------------------------------------------- Opportunities */

export async function saveOpportunity(fd: FormData) {
  const staff = await requirePermission("opportunity:manage");
  const id = str(fd, "id");
  const title = str(fd, "title");
  if (!title) return;
  const values = {
    title,
    slug: str(fd, "slug") || slugify(title),
    purpose: str(fd, "purpose"),
    duties: str(fd, "duties"),
    commitment: str(fd, "commitment"),
    locationName: str(fd, "locationName"),
    riskLevel: (str(fd, "riskLevel") as never) ?? ("low" as never),
    requiresTraining: bool(fd, "requiresTraining"),
    capacity: int(fd, "capacity"),
    published: bool(fd, "published"),
    skillsRequired: (str(fd, "skillsRequired") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
  if (id) {
    await db.update(opportunity).set(values).where(eq(opportunity.id, id));
  } else {
    await db.insert(opportunity).values(values);
  }
  await audit({ actorId: staff.personId, action: id ? "opportunity.updated" : "opportunity.created", objectType: "opportunity", objectId: id });
  revalidatePath("/admin/volunteers/opportunities");
  revalidatePath("/volunteer");
}

export async function deleteOpportunity(id: string) {
  const staff = await requirePermission("opportunity:manage");
  await db.delete(opportunity).where(eq(opportunity.id, id));
  await audit({ actorId: staff.personId, action: "opportunity.deleted", objectType: "opportunity", objectId: id });
  revalidatePath("/admin/volunteers/opportunities");
}

/* --------------------------------------------------------------- Services */

export async function saveService(fd: FormData) {
  const staff = await requirePermission("content:publish");
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!name) return;
  const values = {
    name,
    topic: str(fd, "topic") || "wellbeing",
    description: str(fd, "description"),
    contactPhone: str(fd, "contactPhone"),
    contactUrl: str(fd, "contactUrl"),
    cost: str(fd, "cost"),
    eligibility: str(fd, "eligibility"),
    operatingHours: str(fd, "operatingHours"),
    isUrgentHelp: bool(fd, "isUrgentHelp"),
    published: bool(fd, "published"),
    verifiedAt: bool(fd, "published") ? new Date() : undefined,
  };
  if (id) {
    await db.update(service).set(values).where(eq(service.id, id));
  } else {
    await db.insert(service).values(values);
  }
  await audit({ actorId: staff.personId, action: id ? "service.updated" : "service.created", objectType: "service", objectId: id });
  revalidatePath("/admin/content/services");
  revalidatePath("/support");
}

export async function deleteService(id: string) {
  const staff = await requirePermission("content:publish");
  await db.delete(service).where(eq(service.id, id));
  await audit({ actorId: staff.personId, action: "service.deleted", objectType: "service", objectId: id });
  revalidatePath("/admin/content/services");
}

/* --------------------------------------------------------- Impact metrics */

export async function saveMetric(fd: FormData) {
  const staff = await requirePermission("content:publish");
  const id = str(fd, "id");
  const key = str(fd, "key");
  const label = str(fd, "label");
  const value = str(fd, "value");
  const definition = str(fd, "definition");
  if (!key || !label || !value || !definition) return;
  const values = {
    key,
    label,
    value,
    numericValue: int(fd, "numericValue"),
    definition,
    source: str(fd, "source"),
    displayOrder: int(fd, "displayOrder") ?? 0,
    publishedPublicly: bool(fd, "publishedPublicly"),
    asOf: new Date(),
  };
  if (id) {
    await db.update(impactMetric).set(values).where(eq(impactMetric.id, id));
  } else {
    await db.insert(impactMetric).values(values);
  }
  await audit({ actorId: staff.personId, action: id ? "impact_metric.updated" : "impact_metric.created", objectType: "impact_metric", objectId: id });
  revalidatePath("/admin/content/metrics");
  revalidatePath("/impact");
  revalidatePath("/");
}

export async function deleteMetric(id: string) {
  const staff = await requirePermission("content:publish");
  await db.delete(impactMetric).where(eq(impactMetric.id, id));
  await audit({ actorId: staff.personId, action: "impact_metric.deleted", objectType: "impact_metric", objectId: id });
  revalidatePath("/admin/content/metrics");
}

/* --------------------------------------------------------------- Partners */

export async function savePartner(fd: FormData) {
  const staff = await requirePermission("content:publish");
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!name) return;
  const values = {
    name,
    type: str(fd, "type"),
    websiteUrl: str(fd, "websiteUrl"),
    verified: bool(fd, "verified"),
    displayPublicly: bool(fd, "displayPublicly"),
    displayOrder: int(fd, "displayOrder") ?? 0,
  };
  if (id) {
    await db.update(partner).set(values).where(eq(partner.id, id));
  } else {
    await db.insert(partner).values(values);
  }
  await audit({ actorId: staff.personId, action: id ? "partner.updated" : "partner.created", objectType: "partner", objectId: id });
  revalidatePath("/admin/content/partners");
  revalidatePath("/about/partners");
}

export async function deletePartner(id: string) {
  const staff = await requirePermission("content:publish");
  await db.delete(partner).where(eq(partner.id, id));
  await audit({ actorId: staff.personId, action: "partner.deleted", objectType: "partner", objectId: id });
  revalidatePath("/admin/content/partners");
}

/* --------------------------------------------------------- Live show eps */

export async function saveEpisode(fd: FormData) {
  const staff = await requirePermission("content:publish");
  const id = str(fd, "id");
  const title = str(fd, "title");
  const episodeNumber = int(fd, "episodeNumber");
  if (!title || episodeNumber === undefined) return;
  const values = {
    episodeNumber,
    title,
    description: str(fd, "description"),
    videoUrl: str(fd, "videoUrl"),
    guests: str(fd, "guests"),
    airedAt: date(fd, "airedAt"),
    published: bool(fd, "published"),
  };
  if (id) {
    await db.update(liveShowEpisode).set(values).where(eq(liveShowEpisode.id, id));
  } else {
    await db.insert(liveShowEpisode).values(values);
  }
  await audit({ actorId: staff.personId, action: id ? "episode.updated" : "episode.created", objectType: "live_show_episode", objectId: id });
  revalidatePath("/admin/content/episodes");
  revalidatePath("/live-shows");
}

export async function deleteEpisode(id: string) {
  const staff = await requirePermission("content:publish");
  await db.delete(liveShowEpisode).where(eq(liveShowEpisode.id, id));
  await audit({ actorId: staff.personId, action: "episode.deleted", objectType: "live_show_episode", objectId: id });
  revalidatePath("/admin/content/episodes");
}

/* --------------------------------------------------------------- Products */

export async function saveProduct(fd: FormData) {
  const staff = await requirePermission("event:manage"); // shop managed by coordinators/admin
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!name) return;
  const values = {
    name,
    slug: str(fd, "slug") || slugify(name),
    description: str(fd, "description"),
    priceCents: int(fd, "priceCents") ?? 0,
    published: bool(fd, "published"),
  };
  let productId = id;
  if (id) {
    await db.update(product).set(values).where(eq(product.id, id));
  } else {
    const [row] = await db.insert(product).values(values).returning({ id: product.id });
    productId = row.id;
  }
  await audit({ actorId: staff.personId, action: id ? "product.updated" : "product.created", objectType: "product", objectId: productId });
  revalidatePath("/admin/shop");
  revalidatePath("/shop");
}

export async function addVariant(fd: FormData) {
  const staff = await requirePermission("event:manage");
  const productId = str(fd, "productId");
  const sku = str(fd, "sku");
  const label = str(fd, "label");
  if (!productId || !sku || !label) return;
  await db.insert(productVariant).values({
    productId,
    sku,
    label,
    stock: int(fd, "stock") ?? 0,
    reorderThreshold: int(fd, "reorderThreshold") ?? 5,
  });
  await audit({ actorId: staff.personId, action: "product_variant.created", objectType: "product", objectId: productId });
  revalidatePath("/admin/shop");
}

/* --------------------------------------------------------------- Policies */

export async function savePolicy(fd: FormData) {
  const staff = await requirePermission("content:publish");
  const id = str(fd, "id");
  const title = str(fd, "title");
  if (!title) return;
  const values = {
    title,
    slug: str(fd, "slug") || slugify(title),
    body: str(fd, "body"),
    version: str(fd, "version") || "1.0",
    effectiveAt: date(fd, "effectiveAt"),
    published: bool(fd, "published"),
  };
  if (id) {
    await db.update(policy).set(values).where(eq(policy.id, id));
  } else {
    await db.insert(policy).values(values);
  }
  await audit({ actorId: staff.personId, action: id ? "policy.updated" : "policy.created", objectType: "policy", objectId: id });
  revalidatePath("/admin/governance/policies");
}

/* --------------------------------------------------------------- CMS page */

export async function saveContent(fd: FormData) {
  const staff = await requirePermission("content:publish");
  const id = str(fd, "id");
  const title = str(fd, "title");
  const type = str(fd, "type") || "page";
  if (!title) return;
  const slug = str(fd, "slug") || slugify(title);
  const status = bool(fd, "publish") ? "published" : "draft";
  let contentId = id;
  if (id) {
    await db
      .update(contentItem)
      .set({ slug, status: status as never, category: str(fd, "category"), publishedAt: status === "published" ? new Date() : null })
      .where(eq(contentItem.id, id));
  } else {
    const [row] = await db
      .insert(contentItem)
      .values({ type: type as never, slug, status: status as never, category: str(fd, "category"), ownerId: staff.personId, publishedAt: status === "published" ? new Date() : null })
      .returning({ id: contentItem.id });
    contentId = row.id;
  }
  // English translation body
  const existing = await db
    .select({ id: contentTranslation.id })
    .from(contentTranslation)
    .where(eq(contentTranslation.contentId, contentId!))
    .limit(1);
  const tvals = {
    contentId: contentId!,
    locale: "en" as const,
    title,
    summary: str(fd, "summary"),
    body: str(fd, "body"),
    status: status as never,
  };
  if (existing[0]) {
    await db.update(contentTranslation).set(tvals).where(eq(contentTranslation.id, existing[0].id));
  } else {
    await db.insert(contentTranslation).values(tvals);
  }
  await audit({ actorId: staff.personId, action: id ? "content.updated" : "content.created", objectType: "content_item", objectId: contentId });
  revalidatePath("/admin/content/pages");
}
