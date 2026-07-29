CREATE TYPE "public"."assessment_type" AS ENUM('quiz', 'assignment', 'practical');--> statement-breakpoint
CREATE TYPE "public"."attempt_status" AS ENUM('in_progress', 'submitted', 'passed', 'failed', 'needs_review');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('requested', 'under_review', 'matched', 'active', 'closed', 'declined');--> statement-breakpoint
CREATE TYPE "public"."group_role" AS ENUM('member', 'moderator');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('pending', 'published', 'quarantined', 'removed');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('queued', 'reviewing', 'actioned', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."expense_status" AS ENUM('submitted', 'approved', 'rejected', 'paid');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('cart', 'submitted', 'awaiting_payment', 'confirmed', 'ready', 'fulfilled', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."incident_severity" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."risk_rating" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'in_review', 'scheduled', 'sending', 'sent', 'cancelled');--> statement-breakpoint
CREATE TABLE "assessment" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"title" text NOT NULL,
	"type" "assessment_type" DEFAULT 'quiz' NOT NULL,
	"pass_mark" integer DEFAULT 60 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_attempt" (
	"id" text PRIMARY KEY NOT NULL,
	"assessment_id" text NOT NULL,
	"person_id" text NOT NULL,
	"enrollment_id" text,
	"status" "attempt_status" DEFAULT 'in_progress' NOT NULL,
	"score_percent" integer,
	"answers" jsonb DEFAULT '{}'::jsonb,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_question" (
	"id" text PRIMARY KEY NOT NULL,
	"assessment_id" text NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL,
	"prompt" text NOT NULL,
	"choices" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"correct_index" integer DEFAULT 0 NOT NULL,
	"points" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_material" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text,
	"cohort_id" text,
	"title" text NOT NULL,
	"description" text,
	"url" text,
	"storage_key" text,
	"downloadable" boolean DEFAULT true NOT NULL,
	"offline_allowed" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_path" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"published" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learning_path_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "learning_path_step" (
	"id" text PRIMARY KEY NOT NULL,
	"path_id" text NOT NULL,
	"course_id" text NOT NULL,
	"sequence" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_goal" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"title" text NOT NULL,
	"detail" text,
	"status" text DEFAULT 'active' NOT NULL,
	"target_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_application" (
	"id" text PRIMARY KEY NOT NULL,
	"listing_id" text NOT NULL,
	"person_id" text NOT NULL,
	"milestone" text DEFAULT 'interested' NOT NULL,
	"consent_to_share" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentor_match" (
	"id" text PRIMARY KEY NOT NULL,
	"mentee_id" text NOT NULL,
	"mentor_id" text,
	"status" "match_status" DEFAULT 'requested' NOT NULL,
	"topic" text,
	"consent_to_share" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentor_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"expertise" jsonb DEFAULT '[]'::jsonb,
	"languages" jsonb DEFAULT '[]'::jsonb,
	"bio" text,
	"capacity" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentoring_session" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"scheduled_at" timestamp with time zone,
	"notes" text,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_listing" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text,
	"title" text NOT NULL,
	"description" text,
	"role_type" text,
	"compensation" text,
	"eligibility" text,
	"fee_declaration" text DEFAULT 'No fees charged to workers.',
	"accountable_contact" text,
	"verified" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "block" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"blocked_person_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_report" (
	"id" text PRIMARY KEY NOT NULL,
	"reporter_id" text,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"reason" text NOT NULL,
	"status" "report_status" DEFAULT 'queued' NOT NULL,
	"action" text,
	"reviewed_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"purpose" text,
	"rules" text,
	"moderated" boolean DEFAULT true NOT NULL,
	"pre_moderate" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "group_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "group_membership" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
	"person_id" text NOT NULL,
	"role" "group_role" DEFAULT 'member' NOT NULL,
	"display_alias" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post" (
	"id" text PRIMARY KEY NOT NULL,
	"group_id" text NOT NULL,
	"author_id" text NOT NULL,
	"body" text NOT NULL,
	"status" "post_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reply" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"author_id" text NOT NULL,
	"body" text NOT NULL,
	"status" "post_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset" (
	"id" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"identifier" text NOT NULL,
	"name" text NOT NULL,
	"custodian_id" text,
	"location" text,
	"condition" text DEFAULT 'good' NOT NULL,
	"value_band" text,
	"disposed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "asset_identifier_unique" UNIQUE("identifier")
);
--> statement-breakpoint
CREATE TABLE "expense_claim" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'SGD' NOT NULL,
	"category" text,
	"description" text,
	"receipt_storage_key" text,
	"status" "expense_status" DEFAULT 'submitted' NOT NULL,
	"approved_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_line" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"variant_id" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price_cents" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_id" text,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'SGD' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_variant" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"sku" text NOT NULL,
	"label" text NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"reorder_threshold" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variant_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "shop_order" (
	"id" text PRIMARY KEY NOT NULL,
	"person_id" text,
	"status" "order_status" DEFAULT 'cart' NOT NULL,
	"fulfilment" text DEFAULT 'pickup' NOT NULL,
	"purpose" text,
	"total_cents" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'SGD' NOT NULL,
	"provider_reference" text,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movement" (
	"id" text PRIMARY KEY NOT NULL,
	"variant_id" text NOT NULL,
	"delta" integer NOT NULL,
	"reason" text NOT NULL,
	"actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incident" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"severity" "incident_severity" DEFAULT 'low' NOT NULL,
	"summary" text NOT NULL,
	"status" text DEFAULT 'reported' NOT NULL,
	"owner_id" text,
	"reported_by_id" text,
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"held_at" timestamp with time zone,
	"attendees" jsonb DEFAULT '[]'::jsonb,
	"minutes" text,
	"decisions" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_agreement" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"title" text NOT NULL,
	"type" text,
	"effective_at" timestamp with time zone,
	"expiry_at" timestamp with time zone,
	"data_sharing_terms" text,
	"document_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partner_contact" (
	"id" text PRIMARY KEY NOT NULL,
	"partner_id" text NOT NULL,
	"person_id" text NOT NULL,
	"title" text,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"version" text DEFAULT '1.0' NOT NULL,
	"effective_at" timestamp with time zone,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "policy_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "policy_acknowledgement" (
	"id" text PRIMARY KEY NOT NULL,
	"policy_id" text NOT NULL,
	"person_id" text NOT NULL,
	"version" text NOT NULL,
	"acknowledged_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk" (
	"id" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"likelihood" "risk_rating" DEFAULT 'low' NOT NULL,
	"impact" "risk_rating" DEFAULT 'low' NOT NULL,
	"owner_id" text,
	"controls" text,
	"status" text DEFAULT 'open' NOT NULL,
	"review_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_template" (
	"key" text PRIMARY KEY NOT NULL,
	"description" text,
	"subject" text,
	"body" text,
	"locale" "locale" DEFAULT 'en' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_campaign" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"topic" text DEFAULT 'marketing' NOT NULL,
	"channel" text DEFAULT 'email' NOT NULL,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"recipient_count" integer DEFAULT 0 NOT NULL,
	"created_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_post" (
	"id" text PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"copy" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"post_url" text,
	"owner_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriber" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"locale" "locale" DEFAULT 'en' NOT NULL,
	"confirmed" boolean DEFAULT false NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriber_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempt" ADD CONSTRAINT "assessment_attempt_assessment_id_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempt" ADD CONSTRAINT "assessment_attempt_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempt" ADD CONSTRAINT "assessment_attempt_enrollment_id_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_question" ADD CONSTRAINT "assessment_question_assessment_id_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_material" ADD CONSTRAINT "learning_material_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_material" ADD CONSTRAINT "learning_material_cohort_id_cohort_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."cohort"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_step" ADD CONSTRAINT "learning_path_step_path_id_learning_path_id_fk" FOREIGN KEY ("path_id") REFERENCES "public"."learning_path"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_step" ADD CONSTRAINT "learning_path_step_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_goal" ADD CONSTRAINT "career_goal_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_application" ADD CONSTRAINT "listing_application_listing_id_opportunity_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."opportunity_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_application" ADD CONSTRAINT "listing_application_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_match" ADD CONSTRAINT "mentor_match_mentee_id_person_id_fk" FOREIGN KEY ("mentee_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_match" ADD CONSTRAINT "mentor_match_mentor_id_person_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."person"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_profile" ADD CONSTRAINT "mentor_profile_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentoring_session" ADD CONSTRAINT "mentoring_session_match_id_mentor_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."mentor_match"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_listing" ADD CONSTRAINT "opportunity_listing_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block" ADD CONSTRAINT "block_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block" ADD CONSTRAINT "block_blocked_person_id_person_id_fk" FOREIGN KEY ("blocked_person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_report" ADD CONSTRAINT "content_report_reporter_id_person_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."person"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_report" ADD CONSTRAINT "content_report_reviewed_by_id_person_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_membership" ADD CONSTRAINT "group_membership_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_membership" ADD CONSTRAINT "group_membership_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_author_id_person_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reply" ADD CONSTRAINT "reply_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reply" ADD CONSTRAINT "reply_author_id_person_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset" ADD CONSTRAINT "asset_custodian_id_person_id_fk" FOREIGN KEY ("custodian_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_claim" ADD CONSTRAINT "expense_claim_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_claim" ADD CONSTRAINT "expense_claim_approved_by_id_person_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_order_id_shop_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."shop_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_image_id_media_asset_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media_asset"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shop_order" ADD CONSTRAINT "shop_order_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_actor_id_person_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident" ADD CONSTRAINT "incident_owner_id_person_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident" ADD CONSTRAINT "incident_reported_by_id_person_id_fk" FOREIGN KEY ("reported_by_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_agreement" ADD CONSTRAINT "partner_agreement_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_contact" ADD CONSTRAINT "partner_contact_partner_id_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_contact" ADD CONSTRAINT "partner_contact_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_acknowledgement" ADD CONSTRAINT "policy_acknowledgement_policy_id_policy_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policy"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_acknowledgement" ADD CONSTRAINT "policy_acknowledgement_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk" ADD CONSTRAINT "risk_owner_id_person_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_campaign" ADD CONSTRAINT "newsletter_campaign_created_by_id_person_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_post" ADD CONSTRAINT "social_post_owner_id_person_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."person"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attempt_person_idx" ON "assessment_attempt" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "question_assessment_idx" ON "assessment_question" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "material_course_idx" ON "learning_material" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "path_step_idx" ON "learning_path_step" USING btree ("path_id","course_id");--> statement-breakpoint
CREATE INDEX "goal_person_idx" ON "career_goal" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "listing_app_person_idx" ON "listing_application" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "match_mentee_idx" ON "mentor_match" USING btree ("mentee_id");--> statement-breakpoint
CREATE INDEX "listing_published_idx" ON "opportunity_listing" USING btree ("published");--> statement-breakpoint
CREATE UNIQUE INDEX "block_idx" ON "block" USING btree ("person_id","blocked_person_id");--> statement-breakpoint
CREATE INDEX "report_status_idx" ON "content_report" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "group_member_idx" ON "group_membership" USING btree ("group_id","person_id");--> statement-breakpoint
CREATE INDEX "post_group_idx" ON "post" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "reply_post_idx" ON "reply" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "expense_person_idx" ON "expense_claim" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "line_order_idx" ON "order_line" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "variant_product_idx" ON "product_variant" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "order_person_idx" ON "shop_order" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "incident_status_idx" ON "incident" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "partner_contact_idx" ON "partner_contact" USING btree ("partner_id","person_id");--> statement-breakpoint
CREATE UNIQUE INDEX "policy_ack_idx" ON "policy_acknowledgement" USING btree ("policy_id","person_id","version");--> statement-breakpoint
CREATE INDEX "subscriber_email_idx" ON "subscriber" USING btree ("email");