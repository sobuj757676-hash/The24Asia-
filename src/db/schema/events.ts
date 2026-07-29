import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { person } from "./identity";

export const eventCategory = pgEnum("event_category", [
  "education",
  "blood_donation",
  "environment",
  "sport",
  "culture",
  "entertainment",
  "team_building",
  "volunteer_only",
  "partner",
]);

export const eventStatus = pgEnum("event_status", [
  "draft",
  "published",
  "registration_open",
  "registration_closed",
  "in_progress",
  "completed",
  "cancelled",
]);

/** Community event (PRD EVT-001). Maps current gva_event content. */
export const event = pgTable(
  "event",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    category: eventCategory("category").notNull(),
    status: eventStatus("status").notNull().default("draft"),
    description: text("description"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    timezone: text("timezone").notNull().default("Asia/Singapore"),
    locationName: text("location_name"),
    mapUrl: text("map_url"),
    capacity: integer("capacity"),
    allowGuests: boolean("allow_guests").notNull().default(false),
    whatToBring: text("what_to_bring"),
    organizerId: text("organizer_id").references(() => person.id),
    ...timestamps,
  },
  (t) => [
    index("event_status_idx").on(t.status),
    index("event_starts_idx").on(t.startsAt),
  ],
);

export const registrationStatus = pgEnum("registration_status", [
  "registered",
  "waitlisted",
  "cancelled",
  "checked_in",
  "attended",
  "no_show",
]);

/** Event registration (PRD EVT-002). */
export const eventRegistration = pgTable(
  "event_registration",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    status: registrationStatus("status").notNull().default("registered"),
    guests: integer("guests").notNull().default(0),
    accessibilityNeeds: text("accessibility_needs"),
    // photo/video preference recorded per event (PRD EVT-007)
    allowPhoto: boolean("allow_photo").notNull().default(true),
    cancellationReason: text("cancellation_reason"),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("registration_event_person_idx").on(t.eventId, t.personId),
    index("registration_status_idx").on(t.status),
  ],
);

/**
 * Blood donation record (PRD EVT-001 blood drives; maps "1012 blood bags").
 * Donor registry kept minimal and confidential.
 */
export const bloodDonation = pgTable("blood_donation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventId: text("event_id").references(() => event.id, { onDelete: "set null" }),
  personId: text("person_id").references(() => person.id, {
    onDelete: "set null",
  }),
  donatedAt: timestamp("donated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  bags: integer("bags").notNull().default(1),
  // next eligible date for the donor (informational)
  nextEligibleAt: timestamp("next_eligible_at", { withTimezone: true }),
  recordedById: text("recorded_by_id").references(() => person.id),
  ...timestamps,
});

/** Live show episode archive (PRD 7.1; maps "154 episodes"). */
export const liveShowEpisode = pgTable(
  "live_show_episode",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    episodeNumber: integer("episode_number").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    airedAt: timestamp("aired_at", { withTimezone: true }),
    videoUrl: text("video_url"),
    guests: text("guests"),
    published: boolean("published").notNull().default(false),
    ...timestamps,
  },
  (t) => [uniqueIndex("episode_number_idx").on(t.episodeNumber)],
);
