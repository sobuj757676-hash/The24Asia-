CREATE TYPE "public"."content_status" AS ENUM('draft', 'in_review', 'translation', 'language_review', 'approved', 'scheduled', 'published', 'needs_review', 'archived', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."data_classification" AS ENUM('public', 'internal', 'confidential', 'restricted');--> statement-breakpoint
CREATE TYPE "public"."locale" AS ENUM('en', 'bn', 'ta', 'id', 'tl', 'my', 'zh');--> statement-breakpoint
CREATE TYPE "public"."consent_purpose" AS ENUM('service', 'safety', 'learning', 'events', 'volunteering', 'community', 'fundraising', 'marketing', 'data_sharing_partner', 'media_release');--> statement-breakpoint
CREATE TYPE "public"."role_key" AS ENUM('guest', 'member', 'volunteer_applicant', 'volunteer', 'trainer', 'mentor', 'coordinator', 'support_coordinator', 'moderator', 'safeguarding_lead', 'content_author', 'translator', 'publisher', 'partner_contact', 'finance', 'auditor', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('page', 'story', 'news', 'resource', 'policy', 'faq', 'alert', 'testimonial');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('draft', 'submitted', 'verification_pending', 'under_review', 'more_information', 'approved', 'waitlisted', 'declined', 'withdrawn', 'archived');--> statement-breakpoint
CREATE TYPE "public"."attendance_status" AS ENUM('expected', 'checked_in', 'present', 'late', 'excused', 'no_show', 'corrected');--> statement-breakpoint
CREATE TYPE "public"."cohort_status" AS ENUM('draft', 'in_review', 'approved', 'published', 'registration_open', 'waitlist_only', 'registration_closed', 'in_progress', 'completed', 'reporting_complete', 'archived', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."delivery_mode" AS ENUM('in_person', 'online', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('offered', 'enrolled', 'transfer_pending', 'cancelled', 'withdrawn', 'completed', 'did_not_complete');--> statement-breakpoint
CREATE TYPE "public"."event_category" AS ENUM('education', 'blood_donation', 'environment', 'sport', 'culture', 'entertainment', 'team_building', 'volunteer_only', 'partner');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('registered', 'waitlisted', 'cancelled', 'checked_in', 'attended', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."volunteer_application_status" AS ENUM('draft', 'submitted', 'under_review', 'more_information', 'interview', 'screening_pending', 'approved', 'waitlisted', 'declined', 'withdrawn', 'suspended', 'archived');--> statement-breakpoint
CREATE TYPE "public"."volunteer_standing" AS ENUM('probation', 'active', 'paused', 'suspended', 'exited', 'alumni');--> statement-breakpoint
CREATE TYPE "public"."support_severity" AS ENUM('routine', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."support_status" AS ENUM('received', 'acknowledged', 'triage', 'assigned', 'contact_attempted', 'in_progress', 'referred', 'completed', 'unable_to_contact', 'unmet_need', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."donation_status" AS ENUM('initiated', 'pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."inquiry_type" AS ENUM('contact', 'partnership', 'newsletter', 'content_report');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('in_app', 'email', 'sms', 'push');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"phone_number" text,
	"phone_number_verified" boolean DEFAULT false,
	"two_factor_enabled" boolean DEFAULT false,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_preference" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"topic" "consent_purpose" NOT NULL,
	"channel_email" boolean DEFAULT true NOT NULL,
	"channel_sms" boolean DEFAULT false NOT NULL,
	"channel_push" boolean DEFAULT false NOT NULL,
	"channel_in_app" boolean DEFAULT true NOT NULL,
	"quiet_hours_start" text,
	"quiet_hours_end" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_receipt" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"purpose" "consent_purpose" NOT NULL,
	"granted" boolean NOT NULL,
	"notice_version" text NOT NULL,
	"channel" text DEFAULT 'web' NOT NULL,
	"withdrawn_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text,
	"preferred_locale" "locale" DEFAULT 'en' NOT NULL,
	"nationality" text,
	"languages_spoken" jsonb DEFAULT '[]'::jsonb,
	"age_attested_adult" boolean DEFAULT false NOT NULL,
	"age_review" boolean DEFAULT false NOT NULL,
	"accessibility_needs" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"role" "role_key" NOT NULL,
	"scope" jsonb DEFAULT '{}'::jsonb,
	"granted_by" text,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "award" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"awarded_by" text,
	"year" integer,
	"description" text,
	"media_id" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_item" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "content_type" NOT NULL,
	"slug" text NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"owner_id" text,
	"review_due_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"high_risk" boolean DEFAULT false NOT NULL,
	"category" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"hero_media_id" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_translation" (
	"id" text PRIMARY KEY NOT NULL,
	"content_id" text NOT NULL,
	"locale" "locale" NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"body" text,
	"seo_title" text,
	"seo_description" text,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"reviewed_by_id" text,
	"machine_translated" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_version" (
	"id" text PRIMARY KEY NOT NULL,
	"content_id" text NOT NULL,
	"locale" "locale" NOT NULL,
	"snapshot" jsonb NOT NULL,
	"author_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "impact_metric" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"numeric_value" integer,
	"definition" text NOT NULL,
	"source" text,
	"owner_id" text,
	"as_of" timestamp with time zone DEFAULT now() NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"published_publicly" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "impact_metric_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "media_asset" (
	"id" text PRIMARY KEY NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" text NOT NULL,
	"width" integer,
	"height" integer,
	"alt_text" text,
	"caption" text,
	"credit" text,
	"usage_rights" text,
	"consent_reference" text,
	"location_sensitive" boolean DEFAULT false NOT NULL,
	"retention_expires_at" timestamp with time zone,
	"uploaded_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text,
	"logo_media_id" text,
	"website_url" text,
	"verified" boolean DEFAULT false NOT NULL,
	"display_publicly" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"relationship_owner_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"person_id" text NOT NULL,
	"status" "attendance_status" DEFAULT 'expected' NOT NULL,
	"correction_reason" text,
	"recorded_by_id" text,
	"recorded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "certificate" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"person_id" text NOT NULL,
	"course_title" text NOT NULL,
	"recipient_name" text NOT NULL,
	"verification_code" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "certificate_verification_code_unique" UNIQUE("verification_code")
);
--> statement-breakpoint
CREATE TABLE "cohort" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"code" text NOT NULL,
	"status" "cohort_status" DEFAULT 'draft' NOT NULL,
	"delivery_mode" "delivery_mode" DEFAULT 'in_person' NOT NULL,
	"locale" "locale" DEFAULT 'en' NOT NULL,
	"location_name" text,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"capacity" integer DEFAULT 30 NOT NULL,
	"meeting_link" text,
	"instructor_id" text,
	"coordinator_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cohort_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "cohort_session" (
	"id" text PRIMARY KEY NOT NULL,
	"cohort_id" text NOT NULL,
	"sequence" integer NOT NULL,
	"title" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"outline" text,
	"category" text,
	"duration_label" text,
	"prerequisites" text,
	"outcomes" jsonb DEFAULT '[]'::jsonb,
	"is_free" boolean DEFAULT true NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "course_application" (
	"id" text PRIMARY KEY NOT NULL,
	"cohort_id" text NOT NULL,
	"person_id" text NOT NULL,
	"status" "application_status" DEFAULT 'submitted' NOT NULL,
	"accessibility_needs" text,
	"preferred_locale" "locale",
	"decision_reason" text,
	"reviewed_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"cohort_id" text NOT NULL,
	"person_id" text NOT NULL,
	"status" "enrollment_status" DEFAULT 'enrolled' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blood_donation" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text,
	"person_id" text,
	"donated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"bags" integer DEFAULT 1 NOT NULL,
	"next_eligible_at" timestamp with time zone,
	"recorded_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" "event_category" NOT NULL,
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"description" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"timezone" text DEFAULT 'Asia/Singapore' NOT NULL,
	"location_name" text,
	"map_url" text,
	"capacity" integer,
	"allow_guests" boolean DEFAULT false NOT NULL,
	"what_to_bring" text,
	"organizer_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event_registration" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"person_id" text NOT NULL,
	"status" "registration_status" DEFAULT 'registered' NOT NULL,
	"guests" integer DEFAULT 0 NOT NULL,
	"accessibility_needs" text,
	"allow_photo" boolean DEFAULT true NOT NULL,
	"cancellation_reason" text,
	"checked_in_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_show_episode" (
	"id" text PRIMARY KEY NOT NULL,
	"episode_number" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"aired_at" timestamp with time zone,
	"video_url" text,
	"guests" text,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"purpose" text,
	"duties" text,
	"skills_required" jsonb DEFAULT '[]'::jsonb,
	"commitment" text,
	"location_name" text,
	"risk_level" "risk_level" DEFAULT 'low' NOT NULL,
	"requires_training" boolean DEFAULT false NOT NULL,
	"capacity" integer,
	"supervisor_id" text,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opportunity_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "recognition" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"kind" text NOT NULL,
	"label" text NOT NULL,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shift_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"event_id" text,
	"opportunity_id" text,
	"role" text,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"status" text DEFAULT 'offered' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"shift_id" text,
	"hours" numeric NOT NULL,
	"activity_date" timestamp with time zone NOT NULL,
	"note" text,
	"approved" boolean DEFAULT false NOT NULL,
	"approved_by_id" text,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteer_application" (
	"id" text PRIMARY KEY NOT NULL,
	"opportunity_id" text,
	"person_id" text NOT NULL,
	"status" "volunteer_application_status" DEFAULT 'submitted' NOT NULL,
	"motivation" text,
	"decision_reason" text,
	"reviewed_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteer_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"standing" "volunteer_standing" DEFAULT 'probation' NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb,
	"languages" jsonb DEFAULT '[]'::jsonb,
	"availability" jsonb DEFAULT '[]'::jsonb,
	"team" text,
	"total_hours" numeric DEFAULT '0' NOT NULL,
	"handbook_acknowledged_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"topic" text NOT NULL,
	"description" text,
	"languages" jsonb DEFAULT '[]'::jsonb,
	"cost" text,
	"eligibility" text,
	"operating_hours" text,
	"contact_phone" text,
	"contact_url" text,
	"is_urgent_help" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp with time zone,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_request" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text,
	"safe_contact_channel" text,
	"safe_contact_time" text,
	"discreet_message_only" boolean DEFAULT false NOT NULL,
	"topic" text,
	"severity" "support_severity" DEFAULT 'routine' NOT NULL,
	"status" "support_status" DEFAULT 'received' NOT NULL,
	"assigned_to_id" text,
	"referral_consent" jsonb,
	"outcome" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_event" (
	"id" text PRIMARY KEY NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_id" text,
	"actor_role" text,
	"action" text NOT NULL,
	"object_type" text NOT NULL,
	"object_id" text,
	"outcome" text DEFAULT 'success' NOT NULL,
	"reason" text,
	"context" jsonb,
	"correlation_id" text
);
--> statement-breakpoint
CREATE TABLE "campaign" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"goal_amount_cents" integer,
	"raised_amount_cents" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'SGD' NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "donation" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text,
	"person_id" text,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'SGD' NOT NULL,
	"status" "donation_status" DEFAULT 'initiated' NOT NULL,
	"provider_reference" text,
	"anonymous" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_flag" (
	"key" text PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"gate_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiry" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "inquiry_type" NOT NULL,
	"name" text,
	"email" text,
	"organization" text,
	"subject" text,
	"message" text,
	"status" text DEFAULT 'new' NOT NULL,
	"assigned_to_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"channel" "notification_channel" DEFAULT 'in_app' NOT NULL,
	"template_key" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"link_url" text,
	"read_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"failed_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscription_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_preference" ADD CONSTRAINT "communication_preference_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_receipt" ADD CONSTRAINT "consent_receipt_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person" ADD CONSTRAINT "person_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_assignment" ADD CONSTRAINT "role_assignment_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_assignment" ADD CONSTRAINT "role_assignment_granted_by_person_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "award" ADD CONSTRAINT "award_media_id_media_asset_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_item" ADD CONSTRAINT "content_item_owner_id_person_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_translation" ADD CONSTRAINT "content_translation_content_id_content_item_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_translation" ADD CONSTRAINT "content_translation_reviewed_by_id_person_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_version" ADD CONSTRAINT "content_version_content_id_content_item_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_version" ADD CONSTRAINT "content_version_author_id_person_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "impact_metric" ADD CONSTRAINT "impact_metric_owner_id_person_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_asset" ADD CONSTRAINT "media_asset_uploaded_by_id_person_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner" ADD CONSTRAINT "partner_logo_media_id_media_asset_id_fk" FOREIGN KEY ("logo_media_id") REFERENCES "public"."media_asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner" ADD CONSTRAINT "partner_relationship_owner_id_person_id_fk" FOREIGN KEY ("relationship_owner_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_session_id_cohort_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."cohort_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_recorded_by_id_person_id_fk" FOREIGN KEY ("recorded_by_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_enrollment_id_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort" ADD CONSTRAINT "cohort_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort" ADD CONSTRAINT "cohort_instructor_id_person_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort" ADD CONSTRAINT "cohort_coordinator_id_person_id_fk" FOREIGN KEY ("coordinator_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_session" ADD CONSTRAINT "cohort_session_cohort_id_cohort_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohort"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_application" ADD CONSTRAINT "course_application_cohort_id_cohort_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohort"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_application" ADD CONSTRAINT "course_application_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_application" ADD CONSTRAINT "course_application_reviewed_by_id_person_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_cohort_id_cohort_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohort"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blood_donation" ADD CONSTRAINT "blood_donation_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blood_donation" ADD CONSTRAINT "blood_donation_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blood_donation" ADD CONSTRAINT "blood_donation_recorded_by_id_person_id_fk" FOREIGN KEY ("recorded_by_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_organizer_id_person_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration" ADD CONSTRAINT "event_registration_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registration" ADD CONSTRAINT "event_registration_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_supervisor_id_person_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recognition" ADD CONSTRAINT "recognition_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_assignment" ADD CONSTRAINT "shift_assignment_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_assignment" ADD CONSTRAINT "shift_assignment_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_assignment" ADD CONSTRAINT "shift_assignment_opportunity_id_opportunity_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunity"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_shift_id_shift_assignment_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shift_assignment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_approved_by_id_person_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_application" ADD CONSTRAINT "volunteer_application_opportunity_id_opportunity_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunity"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_application" ADD CONSTRAINT "volunteer_application_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_application" ADD CONSTRAINT "volunteer_application_reviewed_by_id_person_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_profile" ADD CONSTRAINT "volunteer_profile_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_request" ADD CONSTRAINT "support_request_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_request" ADD CONSTRAINT "support_request_assigned_to_id_person_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_actor_id_person_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_campaign_id_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_assigned_to_id_person_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscription" ADD CONSTRAINT "push_subscription_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "two_factor_user_idx" ON "two_factor" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "comm_pref_person_topic_idx" ON "communication_preference" USING btree ("person_id","topic");--> statement-breakpoint
CREATE INDEX "consent_person_idx" ON "consent_receipt" USING btree ("person_id");--> statement-breakpoint
CREATE UNIQUE INDEX "person_user_idx" ON "person" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "role_assignment_person_idx" ON "role_assignment" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "role_assignment_role_idx" ON "role_assignment" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "content_type_slug_idx" ON "content_item" USING btree ("type","slug");--> statement-breakpoint
CREATE INDEX "content_status_idx" ON "content_item" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "content_translation_locale_idx" ON "content_translation" USING btree ("content_id","locale");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_session_person_idx" ON "attendance" USING btree ("session_id","person_id");--> statement-breakpoint
CREATE INDEX "certificate_code_idx" ON "certificate" USING btree ("verification_code");--> statement-breakpoint
CREATE INDEX "cohort_status_idx" ON "cohort" USING btree ("status");--> statement-breakpoint
CREATE INDEX "session_cohort_idx" ON "cohort_session" USING btree ("cohort_id");--> statement-breakpoint
CREATE UNIQUE INDEX "application_cohort_person_idx" ON "course_application" USING btree ("cohort_id","person_id");--> statement-breakpoint
CREATE INDEX "application_status_idx" ON "course_application" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollment_cohort_person_idx" ON "enrollment" USING btree ("cohort_id","person_id");--> statement-breakpoint
CREATE INDEX "event_status_idx" ON "event" USING btree ("status");--> statement-breakpoint
CREATE INDEX "event_starts_idx" ON "event" USING btree ("starts_at");--> statement-breakpoint
CREATE UNIQUE INDEX "registration_event_person_idx" ON "event_registration" USING btree ("event_id","person_id");--> statement-breakpoint
CREATE INDEX "registration_status_idx" ON "event_registration" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "episode_number_idx" ON "live_show_episode" USING btree ("episode_number");--> statement-breakpoint
CREATE INDEX "shift_person_idx" ON "shift_assignment" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "time_entry_person_idx" ON "time_entry" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "vol_application_status_idx" ON "volunteer_application" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "volunteer_profile_person_idx" ON "volunteer_profile" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "support_status_idx" ON "support_request" USING btree ("status");--> statement-breakpoint
CREATE INDEX "audit_action_idx" ON "audit_event" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_object_idx" ON "audit_event" USING btree ("object_type","object_id");--> statement-breakpoint
CREATE INDEX "audit_occurred_idx" ON "audit_event" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "inquiry_type_idx" ON "inquiry" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notification_person_idx" ON "notification" USING btree ("person_id");