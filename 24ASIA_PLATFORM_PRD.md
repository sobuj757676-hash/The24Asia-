# 24Asia Community Impact Platform
## Complete Product Requirements Document (PRD)

**Document status:** Final product-definition baseline; approval pending the decision gates in §30  
**Version:** 1.1  
**Prepared:** 29 July 2026  
**Product type:** Public website + installable PWA + member/learner portal + volunteer portal + partner portal + staff/admin operating system  
**Primary launch market:** Singapore  
**Primary audience:** Migrant workers, migrant domestic workers, volunteers, trainers, community partners, donors, and 24Asia staff/leadership  
**Product owner:** To be assigned by 24Asia  
**Decision authority:** 24Asia Executive Sponsor / Steering Committee  

> This PRD is implementation-oriented but is not legal, clinical, financial, or safeguarding advice. Singapore-specific privacy, charity, fundraising, employment, child-safety, counselling, payments, and records obligations must be confirmed by qualified local reviewers before launch.

---

## 1. Executive Summary

24Asia currently presents itself as a Singapore-based, volunteer-led migrant empowerment platform focused on free education, career development, social counselling, mental wellbeing, community collaboration, events, live shows, team building, blood donation, and environmental activities. The current WordPress site contains valuable programs and impact evidence, but information is spread across duplicated year pages, static schedules, disconnected forms, public operational links, and inconsistent statistics. It does not yet operate as one reliable system for recruiting, training, scheduling, supporting, communicating with, and measuring the outcomes of learners, volunteers, partners, and donors.

The proposed **24Asia Community Impact Platform** will replace that fragmented experience with one mobile-first, multilingual, low-bandwidth product comprising three connected surfaces:

1. **Public website and PWA:** trusted information, programs, events, impact, resources, stories, donation, volunteer opportunities, and service discovery.
2. **Authenticated portals:** personalized experiences for learners/members, volunteers, trainers, mentors, donors, and partners.
3. **Staff and admin operating system:** structured content management, CRM, learning/program operations, volunteer management, events, communications, safeguarding, partnerships, fundraising, assets, governance, and analytics.

The platform must be easy to use on low-end mobile devices and unstable connections; safe for a potentially vulnerable migrant audience; accessible to WCAG 2.2 AA; compliant by design with Singapore PDPA obligations; auditable; installable as a PWA; and responsive on mobile, tablet, laptop, and desktop.

The recommended delivery strategy is phased. The first release establishes safe public content, structured programs/events, volunteer intake, learner registration, CMS, identity, consent, and essential admin operations. Later releases add richer learning, referrals, mentorship, partner workflows, fundraising, moderated community capabilities, and carefully governed automation.

---

## 2. Research Basis and Current-State Audit

### 2.1 Sources examined

This PRD was informed by:

- The current [24Asia website](https://www.24asia.org/), [robots file](https://www.24asia.org/robots.txt), [page sitemap](https://www.24asia.org/page-sitemap.xml), and [event sitemap](https://www.24asia.org/gva_event-sitemap.xml), accessed 29 July 2026.
- The supplied [Facebook share link](https://www.facebook.com/share/18EDdiLuxE/), accessed 29 July 2026, which resolves to **The24asia | Singapore Singapore**; most page content was login-gated.
- Representative current pages: [About](https://www.24asia.org/about-us-2/), [2026 training schedule](https://www.24asia.org/training-schedule-2026/), [2026 results](https://www.24asia.org/training-results-2026/), [calendar](https://www.24asia.org/our-calendar/), [volunteer recruitment](https://www.24asia.org/join-us-as-a-volunteer/), [volunteer handbook](https://www.24asia.org/volunteer-handbook/), [awards](https://www.24asia.org/our-awards/), [partnerships](https://www.24asia.org/partnership/), [merchandise](https://www.24asia.org/t-shirt-order/), and the public [admin-panel page](https://www.24asia.org/admin-panel/), accessed 29 July 2026.
- Current authoritative standards and sector guidance listed in §35.

No separate research attachment was visible in this session. If one was intended, its insights should be reconciled with this PRD during stakeholder validation.

### 2.2 Current strengths to preserve

- Clear mission around migrant empowerment and community connection.
- Proven activity in free education and practical skills development.
- Broad training catalog: digital literacy, Microsoft Office, cybersecurity, AI/web development, graphic design, video editing, public speaking, AutoCAD/SketchUp, workplace safety, WPLN, leadership, and volunteer management.
- Real community programming: blood donation, beach cleanups, sports, cultural celebrations, team building, live shows, mentorship, and partner activities.
- Strong volunteer identity, leadership structure, code of conduct, and student guidelines.
- Public impact claims and awards that can become structured, verifiable impact records.
- Partnerships and use of recognizable Singapore venues and institutions.
- Existing content, photos, video, testimonials, newsletters, and social channels that can be migrated.

### 2.3 Current problems and opportunities

| Finding | User/operational impact | Product response |
|---|---|---|
| Information is organized into yearly and duplicated pages | Users may see conflicting schedules or old information | One structured program/event database with archive views and automatic expiry |
| Metrics differ across pages | Reduced trust and manual reporting effort | Impact metrics sourced from approved records, with owner and “as of” date |
| Training registration, attendance, results, and certificates are disconnected | Manual work, duplicate entry, limited learner history | End-to-end LMS/program workflow and learner record |
| Volunteer roles are listed as long static text | Hard to discover, apply, screen, schedule, and retain volunteers | Searchable opportunities and full volunteer lifecycle management |
| Calendar content includes inconsistent years/dates | Risk of missed events and reputational harm | Validated date fields, approval workflow, change notifications, calendar subscriptions |
| Public `/admin-panel/` page is effectively empty | Confusing and potentially risky | Private admin application on a protected route/subdomain; remove public page from index |
| Content editing appears page-centric | Duplication and stale translations | Structured CMS with reusable content types, workflow, review dates, and localization |
| No unified identity or preferences | Repeated forms and uncontrolled communications | One account, role-specific portal, channel preferences, and consent ledger |
| No visible closed-loop support/referral process | Help requests may be handled informally | Safe intake, assignment, referral status, follow-up, and restricted notes |
| No visible operational analytics | Difficult to show outcomes or improve services | Governed event tracking, program dashboards, and outcome framework |
| Site experience is not visibly optimized for accessibility/offline use | Excludes users with disability, limited data, or unstable connectivity | WCAG 2.2 AA, low-data mode, installable PWA, selected offline content |

### 2.4 Strategic product opportunity

24Asia should become the **trusted digital front door and operating system for migrant empowerment**, not only a redesigned brochure site. Its differentiator should be the combination of:

- Free, practical learning and employability pathways.
- Migrant-led volunteering and leadership progression.
- Community participation and wellbeing support.
- Verified partner ecosystem and referral pathways.
- Transparent, evidence-backed impact.
- Multilingual, low-bandwidth, safe-by-design access.

---

## 3. Product Vision, Mission, and Principles

### 3.1 Product vision

Every migrant community member should be able to find trusted support, build useful skills, join meaningful activities, and grow into a volunteer or leader through one safe and inclusive platform.

### 3.2 Product mission

Digitally connect 24Asia’s public presence, learning programs, volunteer network, partnerships, community support, and internal operations so that people receive a consistent experience and the organization can scale its impact responsibly.

### 3.3 Product principles

1. **Public help without barriers:** Essential information and resource discovery must not require an account.
2. **Mobile and low-bandwidth first:** Design for low-end Android devices, shared phones, intermittent connectivity, and limited data.
3. **One person, one relationship:** A person may be learner, volunteer, trainer, mentor, donor, and partner contact without duplicate profiles.
4. **Safety before engagement:** Do not optimize vulnerable-community features for virality or time-on-site.
5. **Dignity and agency:** Collect the minimum data, explain why it is needed, and let users control communication and sharing.
6. **Structured once, reuse everywhere:** Program, event, person, partner, resource, and impact data must have one authoritative source.
7. **Human accountability:** Automation assists; humans remain responsible for publishing, eligibility, safeguarding, moderation, and high-impact decisions.
8. **Accessible by default:** Accessibility is a release requirement, not a later enhancement.
9. **Outcomes over activity counts:** Measure completed learning, progression, successful referrals, volunteer retention, and participant benefit—not only clicks or registrations.
10. **Global-ready, Singapore-correct:** Build reusable localization and country configuration while meeting Singapore launch requirements first.

---

## 4. Goals, Outcomes, and Non-Goals

### 4.1 Product goals

| ID | Goal | Initial success measure after baseline period |
|---|---|---|
| G-01 | Make programs and events easy to discover and join | ≥80% successful completion in moderated usability tests for “find and register” |
| G-02 | Build an accurate single operational record | ≥95% of active programs/events managed in the platform; no parallel public schedule spreadsheets |
| G-03 | Reduce volunteer administration | ≥50% reduction in manual scheduling/reminder work within six months |
| G-04 | Improve attendance and completion | Baseline first; then improve registration-to-attendance and course-completion rates by agreed targets |
| G-05 | Improve learner progression | Track learning pathways, competencies, certificates, and next steps for ≥80% of enrolled learners |
| G-06 | Make support requests safe and accountable | 100% of accepted requests assigned, statused, and closed with an outcome or reason |
| G-07 | Demonstrate credible impact | Every public impact metric has a definition, source, owner, and “as of” date |
| G-08 | Expand multilingual reach | Launch priority journeys in approved languages with 100% human review of safety/legal content |
| G-09 | Meet high trust standards | WCAG 2.2 AA, staff MFA, auditable access, tested backups, and no unresolved critical security findings at launch |
| G-10 | Improve resilience for users | Installable PWA with offline public essentials and clear sync/freshness states |

Targets involving organizational improvement must be finalized only after 8–12 weeks of reliable baseline data.

### 4.2 Organizational outcomes

- Fewer duplicate systems and manual handoffs.
- Consistent operating procedures across teams.
- Faster program setup, recruitment, communication, check-in, and reporting.
- Safer handling of participant, volunteer, donor, and partner data.
- Better evidence for grants, partnerships, annual reporting, and board governance.
- A reusable platform model for expansion beyond Singapore.

### 4.3 Non-goals and boundaries

The initial platform will **not**:

- Diagnose or treat mental-health conditions.
- Replace emergency services, legal counsel, immigration advice, licensed employment agencies, or medical providers.
- Publish a public member directory, exact user locations, immigration status, or identity documents.
- Store payment-card data; payments must use a hosted compliant provider.
- Permit unmoderated open direct messaging, anonymous public posting, or engagement-driven feeds at launch.
- Make consequential eligibility, safeguarding, clinical, employment, or disciplinary decisions solely through AI.
- Become a full payroll, general ledger, or enterprise HR system in the first phases.
- Support minors by default. Phase 1–3 are adults-first; any under-18 scope requires a separate child-safety assessment, consent model, and operating capability.
- Require identity verification to read public resources or emergency/support information.

---

## 5. Scope and Release Priorities

### 5.1 Priority definitions

- **P0 — Launch critical:** Required for a safe, coherent first production launch.
- **P1 — Core expansion:** Required to realize the complete operating model after launch stabilization.
- **P2 — Advanced:** Valuable optimization or scale capability; introduced only after evidence and governance are ready.
- **Deferred:** Explicitly excluded until separate approval.

### 5.2 Capability map

| Capability | P0 | P1 | P2 |
|---|---|---|---|
| Public website, responsive design, SEO | Yes | Enhance | Personalization |
| PWA installability and offline public essentials | Yes | Saved packs/background sync | Advanced offline operations |
| Identity, profiles, consent, preferences | Yes | Passkeys/delegated access | Federated identity where useful |
| Structured CMS and media library | Yes | Translation memory/campaign workflow | Assisted tagging/translation QA |
| Programs, courses, cohorts, registration | Yes | Assessments/certificates/pathways | Skills passport and credential verification |
| Events, capacity, waitlists, check-in | Yes | Recurrence/team allocation | Offline check-in and advanced venue ops |
| Volunteer application and opportunities | Yes | Screening/training/shifts/hours/expenses | Skills matching and leadership succession |
| Member/learner portal | Yes | Goals/referrals/appointments | Personalized recommendations |
| Staff/admin dashboards and RBAC | Yes | Workflow automation | Cross-country administration |
| Communications: email and in-app | Yes | SMS/WhatsApp-approved integration/push | Campaign optimization |
| Partner directory and partner records | Basic | Partner portal/referrals/opportunities | Open Referral data exchange |
| Wellbeing resources and private contact request | Basic safe routing | Closed-loop referral | Governed peer support groups |
| Career resources and appointments | Basic | Mentors, verified opportunities, milestones | Skills-to-opportunity matching |
| Donations | Hosted one-time | Recurring plans, donor controls, campaigns, reconciliation | Corporate matching/grants expansion |
| T-shirt/merchandise requests | Basic | Inventory/payment/fulfilment | Store expansion |
| Community | No open community | Limited moderated cohorts | Invitation-only support circles |
| Social publishing | Content calendar/export | Approved platform integrations | Assisted repurposing and performance insights |
| Governance, incidents, audit, retention | Yes | Advanced access reviews | Cross-country policy packs |
| AI assistance | No high-risk AI | Low-risk drafts/tags with approval | Governed recommendations after impact assessment |

---

## 6. Users, Personas, and Jobs to Be Done

### 6.1 Primary personas

#### P-01: Migrant learner/member
- Uses a mobile phone, may have limited data and variable digital literacy.
- Wants to find free training, understand eligibility, register, receive reminders, access materials, track attendance/results, and earn certificates.
- May prefer Bengali, Tamil, Bahasa Indonesia/Malay, Filipino/Tagalog, Burmese, Mandarin, or English.
- Needs privacy from employers or people sharing the same device.

**Job:** “Help me find and complete a useful program without confusing forms or hidden costs.”

#### P-02: Community participant
- Wants to join events, sports, cultural programs, blood donation, environmental activities, or live shows.
- Needs accurate dates, maps, eligibility, what to bring, capacity status, and discreet reminders.

**Job:** “Show me what is happening and make it easy to join or cancel responsibly.”

#### P-03: Volunteer applicant/volunteer
- Wants meaningful roles, clear expectations, onboarding, training, shifts, team communication, hour history, and recognition.
- May progress from general volunteer to team member, assistant team leader, team leader, ambassador, trainer, or mentor.

**Job:** “Give me a clear path to contribute and grow while knowing what I am responsible for.”

#### P-04: Trainer/facilitator/mentor
- Needs cohort rosters, safe participant contact, attendance, materials, assessments, feedback, follow-up, and supervision.

**Job:** “Let me run a quality session without managing multiple spreadsheets and chat threads.”

#### P-05: Program/volunteer coordinator
- Creates programs and opportunities; reviews applications; assigns teams; schedules sessions; sends reminders; resolves no-shows; records outcomes.

**Job:** “Give me one operational view from recruitment through reporting.”

#### P-06: Content editor/translator/reviewer
- Publishes programs, events, news, resources, stories, newsletters, and social content across languages.

**Job:** “Help me publish correct, accessible, on-brand information once and keep every version current.”

#### P-07: Partner/employer/institution contact
- Wants to propose collaboration, venues, trainers, services, volunteer opportunities, sponsorship, or verified career opportunities.

**Job:** “Give me a transparent way to work with 24Asia and see the status of our shared activity.”

#### P-08: Donor/sponsor
- Wants a trusted donation experience, receipt, fund designation, communication choice, and evidence of impact.

**Job:** “Let me support the mission safely and understand how my contribution helps.”

#### P-09: Support/referral coordinator
- Receives private requests, performs non-clinical triage, assigns or refers, records consent, follows up, and closes the loop.

**Job:** “Help me respond safely and consistently without exposing sensitive information.”

#### P-10: Leadership/board/auditor
- Needs trustworthy dashboards, governance evidence, financial summaries, impact metrics, policy acknowledgements, risk status, and audit trails.

**Job:** “Show me whether the organization is effective, safe, compliant, and sustainable.”

#### P-11: Platform administrator
- Manages configuration, roles, integrations, security, data requests, and system health, but should not automatically access safeguarding details.

**Job:** “Let me operate the platform without giving me unnecessary access to people’s sensitive records.”

### 6.2 Accessibility and inclusion considerations

The product must work for users who:

- Have low literacy or limited English proficiency.
- Use screen readers, keyboard navigation, zoom, voice control, captions, or high-contrast modes.
- Share devices or frequently change phone numbers.
- Have limited storage, older browsers, or intermittent mobile data.
- Are uncomfortable creating an account or disclosing personal information.
- Need assisted registration by phone or in person.

---

## 7. Product Surfaces and Information Architecture

### 7.1 Public website/PWA navigation

**Primary navigation**

1. **Learn**
   - All courses
   - Learning pathways
   - Training calendar
   - How free training works
   - WPLN
   - Results and certificates verification
2. **Volunteer**
   - Opportunities
   - How volunteering works
   - Teams and leadership pathways
   - Volunteer handbook
   - Recognition and stories
3. **Events & Community**
   - Upcoming events
   - Calendar
   - Past events/gallery
   - Live shows and media
4. **Get Support**
   - Career and skills support
   - Wellbeing resources
   - Trusted services directory
   - Request contact
   - Emergency and urgent help notice
5. **Our Impact**
   - Impact dashboard
   - Stories
   - Annual reports
   - Awards
   - Partners
6. **About**
   - Mission, vision, values
   - Team and governance
   - Policies
   - Contact
7. **Support Us**
   - Donate
   - Partner with us
   - Sponsor a program
   - In-kind support
8. **Account**
   - Sign in / dashboard

**Global utilities:** Search, language, accessibility/low-data options, saved items, notifications, install app, and urgent-help shortcut.

### 7.2 Learner/member portal navigation

- Dashboard
- My learning
- My events
- My appointments/referrals
- Saved resources
- Certificates and achievements
- Messages/notifications
- Profile, accessibility needs, consent, and communication settings
- Privacy requests and account controls

### 7.3 Volunteer portal navigation

- Volunteer dashboard
- Opportunities
- My applications
- Onboarding and required training
- My shifts and calendar
- Check-in/out and hours
- Assigned tasks/teams
- Expenses (if enabled)
- Supervision, feedback, and recognition
- Documents, policy acknowledgements, and expiring checks
- Safety/incident report
- Profile, availability, skills, consent, and preferences

### 7.4 Partner portal navigation

- Organization profile and verification
- Agreements and documents
- Shared programs/events
- Opportunities/listings
- Referrals (only where contractually approved)
- Contacts and tasks
- Reports and outcomes
- Invoices/donations/in-kind contributions where applicable

### 7.5 Staff/admin application navigation

- Home / role-specific dashboard
- People / constituent CRM
- Programs & learning
- Events
- Volunteers & teams
- Support & referrals
- Career & mentorship
- Community & moderation
- Partners
- Fundraising & donations
- Merchandise, assets & inventory
- Content, media & translations
- Communications & campaigns
- Forms & workflows
- Reports & impact
- Governance, policies & risk
- Safeguarding (separately permissioned)
- Users, roles, integrations & system settings
- Audit, privacy requests & retention

### 7.6 Responsive behavior

- Mobile uses a five-item bottom navigation for the current role, with “More” for secondary items.
- Desktop uses a persistent left navigation in portals/admin and a global header on public pages.
- Tables become cards or prioritized columns on small screens; no required horizontal scrolling for core tasks.
- Forms use one-column mobile layouts, progress steps, autosave, and save/resume.
- Primary actions remain reachable within the thumb zone on mobile.
- Admin supports keyboard-first operation, bulk actions, saved views, and wide-screen density without sacrificing accessibility.

---

## 8. Detailed Functional Requirements

Requirements use **MUST** for mandatory, **SHOULD** for expected unless an approved trade-off exists, and **MAY** for optional/advanced behavior.

### 8.1 Identity, accounts, profiles, and consent

| ID | Pri. | Requirement |
|---|---:|---|
| IAM-001 | P0 | The platform MUST allow public browsing of programs, events, resources, impact, and urgent-help information without an account. |
| IAM-002 | P0 | Users MUST be able to register with email or mobile number using a low-friction verification flow; at least one non-phone recovery option MUST exist. |
| IAM-003 | P0 | One person profile MUST support multiple relationships/roles without duplicate accounts. |
| IAM-004 | P0 | User profiles MUST separate required service fields from optional demographic and impact fields. |
| IAM-005 | P0 | The platform MUST record policy/notice version, purpose, timestamp, channel, and withdrawal for each consent. |
| IAM-006 | P0 | Communication preferences MUST be granular by channel and topic: service, safety, learning, events, volunteering, community, fundraising, and marketing. |
| IAM-007 | P0 | Staff and privileged roles MUST use MFA; passkeys SHOULD be offered. SMS MUST NOT be the only privileged factor. |
| IAM-008 | P0 | Users MUST be able to view active sessions, sign out other devices, change contact details through verification, and initiate account closure. |
| IAM-009 | P0 | The system MUST prevent account enumeration and apply risk-aware rate limits to login, registration, recovery, and verification. |
| IAM-010 | P1 | Users SHOULD be able to merge an assisted/offline record with their verified account through a controlled deduplication workflow. |
| IAM-011 | P1 | The platform SHOULD support pseudonymous display names for any approved community feature. |
| IAM-012 | P1 | Users SHOULD be able to export their own standard profile, registrations, consents, and achievements in a portable format. |
| IAM-013 | P2 | Federated login MAY be offered where it does not exclude users or disclose sensitive affiliations. |
| IAM-014 | P0 | Recovery MUST be risk-based: possession of a current SIM/mobile number alone MUST NOT transfer an existing account; contact changes for accounts with confidential/restricted records require step-up or privacy-preserving assisted review. |
| IAM-015 | P0 | Recovery MUST support passkeys or recovery codes where available, alerts to prior verified channels, revocation of old sessions after recovery, and controlled handling of lost phones, recycled numbers, shared numbers, and inaccessible email. |

**Acceptance summary:** A first-time user can register, verify, set language and preferences, and enroll. Recovery succeeds through a safe risk-based route appropriate to the account; it may require trained staff for ambiguous or high-risk cases. Material consent, contact, session, and recovery changes are auditable.

### 8.2 Public website, discovery, and trust

| ID | Pri. | Requirement |
|---|---:|---|
| WEB-001 | P0 | Public pages MUST be server-rendered or statically generated with meaningful content available without JavaScript. |
| WEB-002 | P0 | Home MUST prioritize active programs, upcoming events, support resources, volunteering, current impact, and urgent notices. |
| WEB-003 | P0 | Every program/event page MUST show status, dates, timezone, location/delivery mode, language, cost, eligibility, capacity state, accessibility, organizer, contact route, and last update. |
| WEB-004 | P0 | Search MUST cover programs, events, resources, articles, policies, and people/partners approved for public display. |
| WEB-005 | P0 | Search filters MUST be keyboard and screen-reader accessible and support language, topic, date, location, delivery mode, audience, and availability. |
| WEB-006 | P0 | Organization, team, awards, partners, governance, policies, annual reports, and contact information MUST establish trust without exposing unnecessary personal data. |
| WEB-007 | P0 | Public impact metrics MUST display a definition or methodology link and “as of” date. |
| WEB-008 | P0 | Expired events and closed programs MUST be clearly labeled and excluded from default active results. |
| WEB-009 | P0 | Users MUST be able to report inaccurate content or broken links from the relevant page. |
| WEB-010 | P1 | Users SHOULD be able to save public resources locally without creating an account. |
| WEB-011 | P1 | The system SHOULD recommend a next relevant program/resource using declared interests and context, not protected-attribute profiling. |
| WEB-012 | P2 | Selected pages MAY offer reviewed audio summaries or text-to-speech support in priority languages. |

### 8.3 Structured CMS, media, translation, and publishing

| ID | Pri. | Requirement |
|---|---:|---|
| CMS-001 | P0 | CMS MUST provide structured types for pages, programs, courses, cohorts, sessions, events, opportunities, services/resources, stories, news, newsletters, policies, people, teams, partners, awards, impact metrics, forms, FAQs, and alerts. |
| CMS-002 | P0 | Content lifecycle MUST support draft → review → approved → scheduled/published → archived, with rejection/revision paths. |
| CMS-003 | P0 | Author, reviewer, translator, and publisher permissions MUST be separable; high-risk content MUST support two-person approval. |
| CMS-004 | P0 | Every item MUST have owner, locale, version, status, created/updated timestamps, review date, expiry behavior, and SEO metadata where public. |
| CMS-005 | P0 | Media library MUST store alt text, caption, credit, copyright/usage rights, consent reference, subjects, location sensitivity, focal point, and retention/expiry. |
| CMS-006 | P0 | The system MUST preserve revision history and allow authorized rollback. |
| CMS-007 | P0 | Preview MUST support locale, device width, authenticated/public context, and scheduled state. |
| CMS-008 | P0 | Scheduled publishing/unpublishing, stale-content reminders, broken-link checks, and missing-translation warnings MUST be supported. |
| CMS-009 | P0 | Safety, health, legal, privacy, employment-rights, and crisis content MUST require named subject-matter review and shorter configurable review intervals. |
| CMS-010 | P1 | Reusable blocks SHOULD support consistent web, email, PWA, and social variants while preserving channel-specific review. |
| CMS-011 | P1 | Translation workflow SHOULD show source changes, translation status, reviewer, semantic-parity confirmation, and stale translations. |
| CMS-012 | P2 | AI MAY suggest tags, summaries, or draft translations only with clear labeling, no sensitive provider exposure, and human approval before publication. |

### 8.4 Programs, courses, learning, and learner management

| ID | Pri. | Requirement |
|---|---:|---|
| LMS-001 | P0 | Staff MUST be able to create reusable course templates and scheduled cohorts with sessions, capacity, instructors, locations, language, prerequisites, eligibility, materials, and outcomes. |
| LMS-002 | P0 | Programs MUST support in-person, online, and hybrid delivery, including safe meeting-link release to enrolled users only. |
| LMS-003 | P0 | Learners MUST be able to register/apply, provide accessibility/language needs, save/resume, withdraw, and join a waitlist. |
| LMS-004 | P0 | Staff MUST be able to review eligibility, approve/decline with reason templates, enroll from the waitlist, and register a person through assisted service. |
| LMS-005 | P0 | The system MUST manage session rosters, QR/manual check-in, attendance status, late arrival, excused absence, cancellation, and no-show. |
| LMS-006 | P0 | Trainers MUST see only assigned cohorts and minimum participant details required to deliver the session. |
| LMS-007 | P0 | Materials MUST be accessible, downloadable where allowed, versioned, and optionally available offline. |
| LMS-008 | P0 | Learners MUST receive schedule/change/cancellation reminders in their chosen permitted channel. |
| LMS-009 | P0 | Feedback MUST support anonymous or identified responses, accessible forms, and locale-specific questions. |
| LMS-010 | P1 | Courses SHOULD support assignments, quizzes, rubrics, attempts, pass rules, manual review, and accommodations. |
| LMS-011 | P1 | Completion SHOULD trigger a verifiable certificate with unique public verification code that exposes only approved fields. |
| LMS-012 | P1 | Learning pathways SHOULD represent prerequisites, recommended sequence, competencies, and next steps. |
| LMS-013 | P1 | Learners SHOULD see progress, attendance, results, certificates, and recommended next actions in one dashboard. |
| LMS-014 | P1 | Staff SHOULD manage instructor availability, substitutions, venue resources, and cohort cloning. |
| LMS-015 | P2 | The system MAY support standards-based learning packages and portable credentials if justified by partner needs. |
| LMS-016 | P2 | A skills passport MAY compile user-approved competencies and evidence for controlled sharing. |

**Key rule:** Public “training results” pages must be generated from approved cohort records, never manually duplicated year pages.

### 8.5 Events and community activities

| ID | Pri. | Requirement |
|---|---:|---|
| EVT-001 | P0 | Events MUST support categories such as education, blood donation, environment, sport, culture, entertainment, team building, volunteer-only, and partner events. |
| EVT-002 | P0 | Registration MUST support individual capacity, waitlists, eligibility, accessibility needs, guest rules, consent, emergency contact only where justified, and attendance. |
| EVT-003 | P0 | Staff MUST be able to change venue/time/status and send targeted change notifications to affected attendees. |
| EVT-004 | P0 | Users MUST be able to cancel; configurable cut-offs and cancellation reasons MUST support responsible capacity management. |
| EVT-005 | P0 | Calendar export MUST support iCal/Google-compatible links; public feeds MUST exclude private details. |
| EVT-006 | P0 | Check-in MUST support QR and manual lookup, with an offline/manual fallback. |
| EVT-007 | P0 | Photo/video preference MUST be recorded per event and visible to authorized event/media staff without publicly identifying a person. |
| EVT-008 | P1 | Recurring events, teams, shifts, equipment, transport, run sheets, risk assessments, and volunteer assignments SHOULD be supported. |
| EVT-009 | P1 | Post-event workflow SHOULD capture attendance, incidents, expenses, feedback, photos/consent, outcomes, and retrospective actions. |
| EVT-010 | P2 | Offline PWA check-in MAY sync idempotently when connectivity returns. |

### 8.6 Volunteer lifecycle and team management

| ID | Pri. | Requirement |
|---|---:|---|
| VOL-001 | P0 | Staff MUST publish structured volunteer opportunities with purpose, duties, skills, commitment, location, schedule, age rule, risk level, screening, training, supervisor, and capacity. |
| VOL-002 | P0 | Applicants MUST be able to create a reusable skills/availability profile and apply to one or more roles. |
| VOL-003 | P0 | Application workflow MUST support submitted, under review, more information, interview, checks/training pending, approved, waitlisted, declined, withdrawn, suspended, and archived. |
| VOL-004 | P0 | Decline/suspension decisions MUST use controlled permissions, reason categories, private notes, and appropriate user communication. |
| VOL-005 | P0 | Approved volunteers MUST acknowledge the current handbook, code of conduct, confidentiality, media, conflict-of-interest, and role-specific policies. |
| VOL-006 | P0 | Required policy/training expiry MUST block assignment to affected high-risk roles. |
| VOL-007 | P0 | Volunteers MUST see assigned supervisor, schedule, duties, venue, check-in instructions, required preparation, and safe incident-report route. |
| VOL-008 | P1 | Staff SHOULD manage references, background/check status where lawful, induction, probation, supervision, and review. Raw check details MUST be minimized. |
| VOL-009 | P1 | Shift management SHOULD support self-signup, approval, recurring commitments, capacity, standby lists, swaps requiring approval, reminders, and no-show follow-up. |
| VOL-010 | P1 | Volunteers SHOULD check in/out and submit hours; supervisors SHOULD approve adjustments with audit history. |
| VOL-011 | P1 | Volunteer profiles SHOULD track skills, languages, interests, availability, credentials, teams, hours, outcomes, training, feedback, and recognition. |
| VOL-012 | P1 | Leadership progression SHOULD support member → volunteer → team role → assistant team leader → team leader → ambassador/trainer/mentor, with criteria and approvals. |
| VOL-013 | P1 | Expense claims SHOULD support policy validation, receipt upload, approval, payment status, and finance export. |
| VOL-014 | P1 | Recognition SHOULD support service milestones, badges/certificates, appreciation events, references, and opt-in public profiles. |
| VOL-015 | P2 | Matching MAY rank opportunities using declared skills, language, availability, location radius, training, and interest; it MUST show reasons and permit coordinator override. |
| VOL-016 | P2 | Succession dashboards MAY identify role coverage and expiring leadership terms without opaque performance scoring. |

### 8.7 People/constituent CRM

| ID | Pri. | Requirement |
|---|---:|---|
| CRM-001 | P0 | Staff MUST access a role-appropriate 360° relationship view covering user-approved identity, roles, programs, events, volunteer activity, communications, consents, and tasks. |
| CRM-002 | P0 | Sensitive support, safeguarding, health, legal, identity-document, and immigration-related records MUST NOT appear in the general 360° view. |
| CRM-003 | P0 | Duplicate detection MUST use conservative matching and require authorized human confirmation before merging. |
| CRM-004 | P0 | Staff MUST be able to create tasks, notes, reminders, tags, and follow-ups, each with visibility classification and owner. |
| CRM-005 | P0 | Bulk communication/export MUST require explicit permission, audience preview, purpose, and audit event. |
| CRM-006 | P1 | Lifecycle segments SHOULD be based on transparent relationship states such as new learner, active learner, graduate, volunteer applicant, active volunteer, inactive, donor, partner contact, and alumni. |
| CRM-007 | P1 | Staff SHOULD be able to record assisted/offline interactions and later associate them with an account. |
| CRM-008 | P1 | Data-quality dashboards SHOULD show duplicates, missing consent, invalid contact routes, stale records, and unowned follow-ups. |

### 8.8 Career development, mentorship, and opportunities

| ID | Pri. | Requirement |
|---|---:|---|
| CAR-001 | P0 | The public site MUST provide reviewed career resources, training pathways, appointment requests, and clear boundaries on advice. |
| CAR-002 | P1 | Members SHOULD be able to define goals, skills, interests, availability, preferred language, and action plans. |
| CAR-003 | P1 | Mentorship workflow SHOULD cover request, suitability review, match, agreement, boundaries, sessions, goals, check-ins, rematch, and closure. |
| CAR-004 | P1 | Mentors MUST see only assigned mentees and approved profile fields. |
| CAR-005 | P1 | Employer/partner opportunities MUST require organization verification, named accountable contact, role details, compensation, eligibility, fee declaration, expiry, and review. |
| CAR-006 | P1 | Listings involving an employment agency MUST verify applicable licensing, require itemized fee/timing/refund disclosure, validate jurisdictional caps, prohibit illegal, excessive, deceptive, or undisclosed fees, and provide an official reporting route. Any stricter 24Asia zero-fee partner rule MUST be labeled as organizational policy rather than Singapore law. |
| CAR-007 | P1 | Users MUST explicitly consent before a profile or document is shared with a mentor/employer/partner. |
| CAR-008 | P1 | Application tracking SHOULD support interested, applied, interview, offered, accepted, declined, withdrawn, placed, and follow-up milestones. |
| CAR-009 | P1 | Outcome follow-up SHOULD support 30/90/180-day check-ins without compelling users to disclose employer or wage data. |
| CAR-010 | P2 | Matching MAY suggest opportunities but MUST NOT infer immigration eligibility or make employment decisions. |

### 8.9 Wellbeing resources, social counselling, and referrals

| ID | Pri. | Requirement |
|---|---:|---|
| SUP-001 | P0 | The platform MUST clearly state that it is not an emergency service unless staffed and governed as one. |
| SUP-002 | P0 | Public wellbeing information MUST be culturally and linguistically reviewed, dated, attributed, and linked to trusted local services. |
| SUP-003 | P0 | Urgent-help content MUST be reachable anonymously within one action from wellbeing/support pages. |
| SUP-004 | P0 | Users MUST be able to request private contact using a safe channel/time and indicate whether a discreet message is required. |
| SUP-005 | P0 | Intake MUST collect only the minimum information needed to route the request and MUST avoid diagnostic claims. |
| SUP-006 | P0 | Requests MUST have severity, owner, status, target response, consented referral, outcome, and follow-up; access MUST be restricted by assignment and purpose. |
| SUP-007 | P0 | Referral workflow MUST record what data the user authorized 24Asia to share, with whom, for what purpose, and when. |
| SUP-008 | P0 | The system MUST support accepted, declined, redirected, unable-to-contact, completed, and unmet-need outcomes. |
| SUP-009 | P1 | A verified services directory SHOULD support topic, language, location, audience, cost, eligibility, accessibility, operating hours, capacity note, and last verification. |
| SUP-010 | P1 | Partner referrals SHOULD support closed-loop status updates without exposing unrelated notes. |
| SUP-011 | P2 | Optional validated wellbeing measures MAY be used only with expert approval, explicit purpose, and non-punitive interpretation. |
| SUP-012 | Deferred | No chatbot may provide diagnosis, therapy, medication advice, legal advice, or crisis determination. |

### 8.10 Community and moderated participation

Community features are **not P0**. They require separate operational readiness.

| ID | Pri. | Requirement |
|---|---:|---|
| COM-001 | P1 | Initial community access MUST be limited to approved cohorts/groups with clear purpose, rules, moderator coverage, reporting, and appeals. |
| COM-002 | P1 | Users MUST be able to use a pseudonymous display name and hide direct contact details. |
| COM-003 | P1 | Every post, reply, profile, listing, and message surface MUST support report, block, and mute. |
| COM-004 | P1 | The composer SHOULD warn before publishing phone numbers, exact locations, IDs, or other likely personal information. |
| COM-005 | P1 | New/high-risk content MUST support pre-moderation or quarantine by configurable policy. |
| COM-006 | P1 | Moderation workflow MUST support report, triage, evidence, action, user notice, appeal, review, and closure. |
| COM-007 | P1 | Verified staff/partner labels MUST be controlled and revocable. |
| COM-008 | P1 | Ranking MUST prioritize recency, relevance, and safety; it MUST NOT optimize for outrage or raw engagement. |
| COM-009 | P2 | Small invitation-only peer support circles MAY launch only with trained facilitators and safeguarding approval. |
| COM-010 | Deferred | Open user-to-user DMs, public member search, precise live location, and unmoderated meetups are prohibited until separately approved. |

### 8.11 Partners, sponsors, institutions, and referrals

| ID | Pri. | Requirement |
|---|---:|---|
| PAR-001 | P0 | Staff MUST maintain partner organization, type, contacts, verification, relationship owner, agreements, programs, contributions, risks, and review date. |
| PAR-002 | P0 | Public partner logos/content MUST require approval, usage rights, display period, and ordering rules. |
| PAR-003 | P0 | Partnership inquiries MUST enter a trackable workflow rather than an unowned mailbox. |
| PAR-004 | P1 | Partner portal SHOULD permit approved contacts to maintain organization details, submit opportunities, exchange approved documents, and view shared activities. |
| PAR-005 | P1 | Agreements SHOULD have owner, type, effective/expiry dates, renewal reminders, obligations, data-sharing terms, and document permissions. |
| PAR-006 | P1 | Partner verification SHOULD include legal/organizational identity, accountable contact, domain, service quality, safeguarding/data terms, and periodic re-verification. |
| PAR-007 | P1 | Shared outcome reports SHOULD expose only aggregated or contractually approved data. |
| PAR-008 | P2 | Service directory exchange MAY implement Open Referral HSDS-compatible import/export. |

### 8.12 Donations, fundraising, sponsorship, and grants

| ID | Pri. | Requirement |
|---|---:|---|
| FUND-001 | P0 | Users MUST be able to make one-time donations through a hosted payment page. Recurring donations MUST remain feature-disabled until FUND-006 controls are released. |
| FUND-002 | P0 | Donation forms MUST show legal recipient, currency, amount, frequency where enabled, fund/campaign, fee treatment, privacy notice, refund/contact route, and tax-deductibility status where applicable. |
| FUND-003 | P0 | Donation completion MUST be confirmed by signed provider webhook, not browser redirect alone. |
| FUND-004 | P0 | The system MUST issue a receipt/acknowledgement, record transaction status, handle failed payments/refunds, and support reconciliation export. |
| FUND-005 | P0 | Donor recognition and marketing consent MUST be optional and separate from payment. Anonymous/public-recognition choices MUST be respected. |
| FUND-006 | P1 | Before recurring donations are enabled, the donor portal MUST provide receipt history, recurring plan view/cancel/update, failed-payment handling, communication settings, and impact updates. |
| FUND-007 | P1 | Campaigns SHOULD have goal, dates, fund restriction, owner, content, progress methodology, source tracking, and report. |
| FUND-008 | P1 | Staff SHOULD track sponsorship, in-kind contributions, grant opportunities, applications, milestones, reporting deadlines, and outcomes. |
| FUND-009 | P0 | Refunds and manual adjustments MUST require role-appropriate approval and audit; requester and approver MUST differ above a configured threshold. |
| FUND-010 | P2 | Corporate matching and peer campaigns MAY be added after fraud and moderation controls are defined. |

### 8.13 Merchandise, T-shirts, assets, and inventory

| ID | Pri. | Requirement |
|---|---:|---|
| MER-001 | P0 | T-shirt requests/orders MUST capture item, size, quantity, purpose/event, pickup/delivery choice, payment status if applicable, and consented contact. |
| MER-002 | P0 | Staff MUST manage order status: submitted, confirmed, awaiting payment, ready, fulfilled, cancelled, refunded. |
| MER-003 | P1 | Inventory SHOULD track item/SKU, variant, quantity, location, reorder threshold, reservation, issue/return, adjustment reason, and audit. |
| MER-004 | P1 | Organization assets SHOULD track category, identifier, custodian, location, condition, issue/return, maintenance, value band, and disposal. |
| MER-005 | P1 | Event/program reservations SHOULD prevent double-booking of controlled assets. |
| MER-006 | P2 | Expanded merchandise commerce MAY be enabled only after tax, fulfilment, refund, and consumer-law review. |

### 8.14 Communications, notifications, newsletters, and social publishing

| ID | Pri. | Requirement |
|---|---:|---|
| MSG-001 | P0 | Notifications MUST use approved localized templates with purpose, channel, priority, expiry, sender, and variables. |
| MSG-002 | P0 | Service messages MUST be separated from marketing/fundraising consent. |
| MSG-003 | P0 | Users MUST control channel/topic preferences, quiet hours, digest frequency, and unsubscribes where applicable. |
| MSG-004 | P0 | Lock-screen, SMS, and subject-line copy MUST be discreet and avoid revealing migrant status, counselling, health/legal topic, or location. |
| MSG-005 | P0 | Delivery status, bounce, complaint, unsubscribe, push expiry, and failed jobs MUST be visible to authorized staff. |
| MSG-006 | P0 | Audience builders MUST preview inclusion/exclusion counts and prevent sending to withdrawn/invalid channels. |
| MSG-007 | P1 | Campaigns SHOULD support draft, review, test send, scheduling, localization, UTM conventions, approvals, and performance reports. |
| MSG-008 | P1 | Newsletter content SHOULD be composed from reusable approved blocks and published to a web archive. |
| MSG-009 | P1 | Social calendar SHOULD support platform, account, owner, asset, copy variant, approval, scheduled date, status, and post URL. |
| MSG-010 | P1 | Direct social publishing MAY use official APIs where stable; manual export MUST remain available. |
| MSG-011 | P1 | WhatsApp/SMS integration MUST use an approved provider and template/consent rules; staff personal accounts MUST NOT be the system of record. |
| MSG-012 | P2 | AI MAY suggest channel variants from approved source content; humans MUST review before publication. |

### 8.15 Staff operations, forms, tasks, documents, and governance

| ID | Pri. | Requirement |
|---|---:|---|
| OPS-001 | P0 | Admin home MUST be role-specific and show actionable queues, deadlines, incidents, data-quality issues, and system notices—not vanity metrics only. |
| OPS-002 | P0 | Configurable forms MUST support versioning, conditional fields, save/resume, validation, translation, consent text, assignment, export control, and retention. |
| OPS-003 | P0 | Tasks MUST support owner, team, due date, priority, related entity, checklist, status, comments, visibility, and reminder. |
| OPS-004 | P0 | Documents MUST support classification, owner, version, access, acknowledgement, review/expiry, and retention. |
| OPS-005 | P0 | Policies MUST support approval, publication, effective date, supersession, acknowledgement, and compliance reporting. |
| OPS-006 | P0 | Conflicts of interest MUST support declaration, reviewer, mitigation, status, and restricted visibility. |
| OPS-007 | P1 | Meetings SHOULD support agenda, attendees, minutes, decisions, actions, approvals, and document links. |
| OPS-008 | P1 | Risk register SHOULD support category, description, likelihood, impact, owner, controls, treatment, review date, and status. |
| OPS-009 | P0 | A minimum incident workflow MUST support operational, safety, data, security, conduct, and reputational incidents with severity, owner, restricted evidence, deadlines, escalation, communication, closure, and audit. Advanced trend analytics MAY follow in P1. |
| OPS-010 | P1 | Organization structure SHOULD model teams, roles, reporting lines, terms, acting appointments, and vacancy/succession status. |
| OPS-011 | P1 | No-code workflow configuration MAY be provided for low-risk approvals, but permission and retention policies MUST remain centrally governed. |

### 8.16 Reporting, impact, and analytics

| ID | Pri. | Requirement |
|---|---:|---|
| REP-001 | P0 | Every KPI MUST have owner, definition, numerator, denominator, source, refresh cadence, allowed dimensions, suppression rule, and target/action threshold. |
| REP-002 | P0 | Dashboards MUST enforce the viewer’s data permissions and suppress small sensitive cohorts. |
| REP-003 | P0 | Core reports MUST include program funnel, attendance/completion, events, volunteer pipeline/hours/retention, communications, referrals, donations, content freshness, and data quality. |
| REP-004 | P0 | Public impact pages MUST use approved aggregated data snapshots rather than live sensitive operational queries. |
| REP-005 | P0 | Exports MUST be purpose-limited, filtered, watermarked where appropriate, time-limited, and audited. |
| REP-006 | P1 | Grant/partner reports SHOULD support reusable metrics, reporting periods, narrative evidence, approvals, and source links. |
| REP-007 | P1 | Cohort comparisons SHOULD show confidence/context and avoid rankings that could stigmatize language or nationality groups. |
| REP-008 | P1 | Scheduled reports SHOULD be delivered only to approved recipients with expiring links rather than sensitive attachments where practical. |
| REP-009 | P2 | Forecasting MAY support capacity/staffing decisions but MUST expose assumptions and MUST NOT determine service eligibility. |

### 8.17 Platform administration and support

| ID | Pri. | Requirement |
|---|---:|---|
| ADM-001 | P0 | Authorized administrators MUST manage users, roles, scoped assignments, locales, taxonomies, templates, feature flags, integrations, and retention policies. |
| ADM-002 | P0 | Administrative configuration changes MUST be versioned and auditable. |
| ADM-003 | P0 | Impersonation MUST be disabled by default; if enabled for support, it MUST require reason, user-visible banner, restricted actions, and audit. |
| ADM-004 | P0 | Support staff MUST have a ticket workflow that does not expose sensitive content by default. |
| ADM-005 | P0 | System status MUST show integrations, queues, failures, storage, backup freshness, and security notices to appropriate operators. |
| ADM-006 | P0 | Production data MUST NOT be copied into test environments. |
| ADM-007 | P1 | Quarterly role/access recertification SHOULD be workflow-managed. |
| ADM-008 | P1 | Time-limited elevated access SHOULD require approval, purpose, step-up authentication, expiry, alert, and post-review. |

### 8.18 Adult scope and accidental minor participation

| ID | Pri. | Requirement |
|---|---:|---|
| SAFE-001 | P0 | Registration, volunteering, event, and support-intake surfaces MUST clearly state the approved adult eligibility rule using plain language. |
| SAFE-002 | P0 | The platform MUST use a minimal age/eligibility attestation rather than routinely collecting identity documents or full date of birth. |
| SAFE-003 | P0 | A disclosure or credible indication that a participant is under the approved age MUST place the record in a restricted `age review` state, halt ordinary assignment/contact, and notify only trained safeguarding staff. |
| SAFE-004 | P0 | The age-review SOP MUST define safe contact, immediate-risk escalation, data preservation/deletion, account restriction, event/application handling, and documentation; ordinary staff MUST NOT improvise guardian contact or consent. |
| SAFE-005 | P0 | A person in age review MUST retain anonymous access to public urgent-help and safety resources. No guardian-consent flow may be enabled unless minors become an explicitly approved product scope. |
| SAFE-006 | P1 | If 24Asia later approves minor participation, a separate child-impact assessment, age-appropriate design, consent/legal basis, staff-minor communication controls, moderation model, and release gate MUST supersede the adults-first rules. |

---

## 9. Core End-to-End Journeys

### 9.1 Learner journey

Discover course → compare eligibility/schedule → register or save → verify account/contact → submit needs/consent → approval/waitlist → reminders → attend/check in → access materials → complete assessment/feedback → receive result/certificate → recommended next step → alumni/volunteer invitation.

**Failure handling:** full course, ineligible, duplicate registration, schedule change, no-show, failed assessment, connectivity loss, missing verification, cancellation, and accessibility request must each have a clear next action.

### 9.2 Event participant journey

Discover event → see accurate logistics/capacity → register → receive confirmation → update accessibility/photo preference → reminder → check in → participate → feedback → view approved recap → next relevant activity.

### 9.3 Volunteer journey

Discover opportunity → create skills/availability profile → apply → review/interview/checks → policy acknowledgement and induction → approval/probation → shifts/tasks → check-in/hours → supervision/feedback → recognition → leadership pathway → pause/exit/alumni.

### 9.4 Support/referral journey

Read anonymously → request safe contact → acknowledgement and urgent-help guidance → trained human review → assignment → consented referral/action → partner response → follow-up → completed/unmet/redirected closure → optional feedback.

### 9.5 Partner journey

Submit inquiry → due diligence/verification → internal owner and evaluation → agreement/data terms → shared program/opportunity → participant/volunteer workflow → outcome report → review/renewal/closure.

### 9.6 Donation journey

Choose campaign/fund → amount/frequency → donor and consent choices → hosted payment → verified webhook → receipt → reconciliation → impact update → recurring controls/renewal/failure recovery.

### 9.7 Content journey

Brief → structured draft → media rights/consent → subject review → translation → language/accessibility/SEO checks → approval → scheduled publication → channel variants → performance → review reminder → update/archive.

### 9.8 Incident/safeguarding journey

Report or staff observation → immediate safety guidance → severity triage → restricted assignment → evidence minimization → safeguarding action/referral → controlled communication → closure/ongoing plan → post-incident review → anonymized trend reporting.

---

## 10. Workflow State Models and Business Rules

### 10.1 Transition-table contract

Implementation MUST maintain a versioned transition table for each workflow with: `from state`, `to state`, authorized actor, guard/eligibility rule, required reason/evidence, side effects, notification, reversibility, terminal flag, and audit event. The tables below define the minimum lifecycle; detailed variants may add states but may not remove required controls.

### 10.2 Program/cohort lifecycle

| From | To | Actor/guard | Required side effects |
|---|---|---|---|
| Draft | Internal review | Owner; required fields complete | Lock reviewed version; notify reviewer |
| Internal review | Draft / Approved | Reviewer distinct where required | Record reason or approval |
| Approved | Published/upcoming | Publisher; locale/content checks pass | Public index/update event |
| Published/upcoming | Registration open / Cancelled | Coordinator; capacity/rules set | Open registration or notify affected people |
| Registration open | Waitlist only / Registration closed / In progress / Cancelled | Coordinator or documented capacity/time rule | Freeze capacity snapshot; notify where material |
| Waitlist only / Registration closed | In progress / Cancelled | Coordinator | Resolve pending registrations |
| In progress | Completed / Cancelled | Coordinator; reason required for cancellation | Attendance/results handling and user notice |
| Completed | Reporting complete | Program owner; metrics reconciled | Approved outcome snapshot |
| Reporting complete | Archived | Records owner; retention rule attached | Remove from active results; preserve history |

### 10.3 Registration, enrollment, and participation lifecycles

These are separate records so application decisions, enrollment status, and attendance are not conflated.

| Record | Required states | Key controls |
|---|---|---|
| Application | Draft, Submitted, Verification pending, Under review, More information, Approved, Waitlisted, Declined, Withdrawn, Archived | User may withdraw before terminal processing; decline needs reason; waitlist promotion needs acceptance window |
| Enrollment | Offered, Accepted/enrolled, Transfer pending, Cancelled, Withdrawn, Completed, Did not complete | Capacity reserved only on accepted enrollment; transfer and cancellation are audited |
| Session attendance | Expected, Checked in, Present, Late, Excused absence, No-show, Corrected | Trainer/coordinator correction requires reason and before/after audit |

### 10.4 Volunteer lifecycle

| Record | Required states | Key controls |
|---|---|---|
| Application | Draft, Submitted, Under review, More information, Interview, Screening/training pending, Approved, Waitlisted, Declined, Withdrawn, Archived | Must match VOL-003; decline/suspension reasons are controlled |
| Volunteer standing | Probation, Active, Paused, Suspended, Exited, Alumni | Suspension is restricted and notified as policy permits; reactivation requires eligibility checks |
| Assignment | Offered, Accepted, Declined, Confirmed, Checked in, Completed, No-show, Cancelled | Expired training/checks block high-risk assignment; hours originate only from eligible completed activity |

### 10.5 Referral/support lifecycle

`Received → Acknowledged → Triage → Assigned → Contact attempted → In progress → Referred → Partner accepted | Partner declined/redirected → Follow-up → Completed | Unable to contact | Unmet need | Withdrawn`

Only assigned trained roles may progress the record. Every transition that shares data requires current consent scope; high-risk escalation follows the safeguarding workflow rather than ordinary referral states.

### 10.6 Content lifecycle

`Draft → Subject review → Translation → Language review → Accessibility/SEO review → Approval → Scheduled/published → Needs review → Archived/superseded`

Rejection may return an item to the prior authoring state with reason. High-risk content requires the configured independent approvals. Publishing and rollback create immutable version/audit records.

### 10.7 Moderation and incident lifecycles

- **Moderation:** `Reported/detected → Queued → Quarantined when policy requires → Human review → No violation | Warning | Restriction/removal | Temporary restriction | Suspension → User notice when safe → Appeal → Upheld/overturned/modified → Closed`.
- **Incident:** `Reported/detected → Acknowledged → Severity assessed → Restricted assignment → Containment/safety action → Investigation/referral → Recovery/follow-up → Closed → Post-incident review`.

Critical evidence is minimized and segregated; automation cannot make unreviewed permanent or safeguarding decisions.

### 10.8 Universal business rules

- State transitions must be permission-checked server-side and audited.
- User-facing reasons must use respectful templates and allow reviewed custom context.
- Internal notes must have explicit visibility classification.
- Automated reminders may prompt action but cannot silently change consequential states unless the business rule is documented and reversible.
- Capacity counts must reserve approved places transactionally and prevent overbooking.
- Waitlist promotion must provide an acceptance window before moving to the next person.
- Historical records must not be rewritten when templates change; they retain the effective version.
- Public counts must use approved reporting snapshots and privacy thresholds.

---

## 11. Roles and Access-Control Model

Use **RBAC plus ABAC**. A role sets the maximum capability; contextual policies restrict access by organization, country, team, assigned program/cohort/case, data sensitivity, purpose, consent, record state, time, and authentication assurance.

### 11.1 Core roles

| Role | Core permissions | Explicit restrictions |
|---|---|---|
| Guest | Read/search public content, save public items, donate, submit inquiry/report | No private records or community posting |
| Member/learner | Own profile, consent, registrations, learning, events, certificates, support status | Own records only; no internal notes |
| Volunteer applicant | Own application, documents, interview status | No participant data |
| Approved volunteer | Assigned opportunities, shifts, training, hours, minimum logistics | No broad member lists or unrelated cohorts |
| Trainer/facilitator | Assigned cohorts, roster, attendance, materials, assessments | No unrelated programs, donor data, or safeguarding details |
| Mentor | Assigned mentees and explicitly shared goals/profile | No general member search or hidden case notes |
| Team leader/coordinator | Scoped team/program applications, schedules, tasks, reviews | No cross-team bulk export by default |
| Support/referral coordinator | Assigned requests/referrals and consented partner sharing | No donor/payment or unrelated records |
| Community moderator | Approved groups, reports, sanctions, appeal queue | No donor, learning, case, or safeguarding records |
| Safeguarding lead | Restricted incidents, risk triage, escalation, safe-contact settings | Separate module; no unrestricted bulk export |
| Content author | Draft approved content types | Cannot publish own high-risk content |
| Translator/language reviewer | Assigned locale content and source comparison | No portal/person records |
| Publisher | Approve/schedule/publish within scope | High-risk two-person rule applies |
| Partner contact | Own organization and contractually shared activities/data | Cannot browse members or export lists |
| Fundraising/finance | Donors, transactions, refunds, reconciliation, campaigns | No program support/safeguarding notes |
| Governance/auditor/DPO | Read-only policy, access, privacy request, and audit evidence | Identifiers masked unless purpose requires them |
| Platform administrator | Identity, roles, configuration, integrations, operations | No implicit safeguarding/case access |
| Super administrator | Emergency limited platform control | No permanent everyday use; just-in-time and independently reviewed |

### 11.2 Separation-of-duty rules

- A user may draft but not solely approve and publish high-risk content.
- Refund requester and final approver must differ above a configurable threshold.
- Role grant requester and approver must differ for privileged roles.
- Safeguarding access cannot be inherited from generic administrator status.
- Bulk exports of high-risk data require step-up authentication and second approval.
- Break-glass access is time-limited, alerted, reasoned, and reviewed.

---

## 12. Conceptual Data Model

### 12.1 Principal entities

| Domain | Entities |
|---|---|
| Identity | Person, Account, ContactPoint, Session, Credential, Role, Assignment, OrganizationMembership |
| Consent/privacy | NoticeVersion, ConsentReceipt, CommunicationPreference, DataRequest, LegalHold, RetentionPolicy |
| Organization | Organization, Team, Position, Term, PartnerProfile, Agreement, ContactRelationship |
| Content | ContentItem, ContentVersion, LocaleVariant, Taxonomy, MediaAsset, MediaConsent, Policy, FAQ, Alert |
| Learning | Program, CourseTemplate, Cohort, Session, Enrollment, Attendance, LearningMaterial, Assignment, Assessment, Result, Competency, Certificate, LearningPath |
| Events | Event, Venue, Registration, WaitlistEntry, CheckIn, EventTeam, EquipmentReservation, Feedback |
| Volunteering | Opportunity, Application, ScreeningItem, PolicyAcknowledgement, VolunteerProfile, Skill, Availability, Shift, ShiftAssignment, TimeEntry, Supervision, ExpenseClaim, Recognition |
| Support | Service, ServiceLocation, SupportRequest, Triage, CaseAssignment, Referral, ReferralConsent, Outcome, FollowUp |
| Career/mentoring | Goal, ActionPlan, MentorProfile, Match, MentoringSession, OpportunityListing, CandidateConsent, ApplicationMilestone |
| Community | Group, Membership, Post, Reply, Report, ModerationCase, ModerationAction, Appeal, Block |
| Fundraising | Campaign, Fund, Donation, PaymentAttempt, Refund, Receipt, Pledge, Sponsorship, Grant, InKindContribution |
| Commerce/assets | Product, Variant, Order, OrderLine, InventoryItem, StockMovement, Asset, AssetIssue, Maintenance |
| Operations | FormDefinition, FormVersion, Submission, Task, Meeting, Decision, Risk, Incident, Document, WorkflowRun |
| Communications | Template, Notification, DeliveryAttempt, Campaign, AudienceSnapshot, SocialPost |
| Measurement | MetricDefinition, MetricSnapshot, OutcomeMeasure, AnalyticsEvent, ReportDefinition |
| Platform | Integration, WebhookEvent, AuditEvent, FeatureFlag, Locale, CountryConfiguration, Job |

### 12.2 Data classification

- **Public:** Approved website content, public programs/events, public partner and impact data.
- **Internal:** Operational plans, tasks, non-sensitive notes, aggregate internal reports.
- **Confidential:** Contact details, applications, attendance, donor records, contracts, expenses.
- **Restricted:** Identity documents, immigration-related data, health/wellbeing details, support narratives, safeguarding records, disciplinary evidence, exact protected locations, authentication secrets.

Every field must have classification, purpose, owner, permitted roles, retention rule, and export/search/indexing policy.

### 12.3 Data-quality rules

- Stable internal IDs; public identifiers are separate and non-sequential.
- Contact points can be verified, invalid, suppressed, shared, or preferred.
- Dates store timezone and original context.
- Country and language use standard codes; locale is not inferred as nationality.
- Free text is avoided for fields that drive routing/reporting; controlled taxonomies remain editable by governance.
- Sensitive narratives never enter analytics or search indexes.
- Deletion propagates through operational stores; backups expire by schedule and replay deletion tombstones after restore.

---

## 13. PWA and Offline Requirements

### 13.1 Installability

- Valid web app manifest with name, short name, icons, theme/background colors, `start_url`, scope, and standalone display.
- HTTPS, a qualifying web app manifest, and a service worker for the defined offline behavior. Installation promotion is browser-specific and MUST NOT be treated as the only way to use the product.
- Branded install education shown only after meaningful engagement, never as an immediate blocking prompt.
- App shortcuts for Learn, Events, Volunteer, Saved, and Support, adapted by role where supported.
- Update-available notice with safe refresh behavior; never lose unsaved work.

### 13.2 Offline experience

**Available offline:**
- App shell and navigation.
- User-selected language pack.
- Previously viewed approved public pages.
- Saved public resources and course materials explicitly permitted for download.
- Upcoming schedule previously synced, with last-sync indicator.
- Offline fallback and retry.

**Never cached by default:**
- Authentication responses/tokens in unsafe storage.
- Identity documents.
- Support/case/safeguarding notes.
- Exact locations designated sensitive.
- Donor/payment details.
- Personalized pages containing restricted data.

### 13.3 Queued actions

Permitted low-risk actions such as attendance feedback drafts or saved-item changes may queue with:

- Idempotency key.
- Visible `Pending / Synced / Failed` state.
- Retry with exponential backoff.
- User cancellation.
- Explicit conflict handling.
- Automatic purge after successful sync or expiry.

Registration, donation, role changes, support/safeguarding reports, and consequential submissions must not claim success until confirmed by the server. A safe draft may be stored only with explicit device disclosure and short expiry.

### 13.4 Shared-device safety

- “Clear this device” control removes offline content, session, drafts, and caches.
- Logout purges personalized caches.
- Sensitive notification previews are off by default.
- The product may provide a configurable “Leave quickly” action only after user research confirms it improves rather than harms safety.

### 13.5 Browser, device, and capability support matrix

The final minimum versions are locked at Phase 0 exit using current traffic and vendor support. The default acceptance matrix is:

| Class | Required coverage | Capability/fallback expectation |
|---|---|---|
| Low-end mobile | Android device profile with 2–4 GB RAM, 360×640 viewport, slow 4G/intermittent network; current and previous two Chrome major versions | Full core journeys, install where offered, offline public content, push/background features only when supported |
| iPhone/iPad | Current and previous two major iOS/iPadOS releases in Safari | Full browser journeys; installation/push/offline use progressive enhancement and platform-supported behavior |
| Desktop Chromium | Current and previous two Chrome and Edge major versions on Windows/macOS | Full journeys, keyboard use, installation where offered |
| Desktop Safari | Current and previous major macOS Safari versions | Full browser journeys; graceful fallback for unsupported PWA APIs |
| Desktop Firefox | Current and previous two major versions | Full browser journeys; no dependency on browser installation promotion |
| Assistive technology | TalkBack/Chrome, VoiceOver/Safari, NVDA/Firefox as specified in §15 | Critical journeys pass with supported browser/AT pairs |

All browsers receive a fully usable responsive website. Installation prompts, push, background sync, periodic sync, app shortcuts, and storage persistence are progressive enhancements. Unsupported APIs MUST produce no broken controls and MUST fall back to in-app/email/manual refresh behavior. The exact version matrix, ownership, test devices, and retirement policy become a controlled release artifact.

---

## 14. Experience Design and Design System

### 14.1 Brand direction

The visual system should communicate energy, dignity, multicultural inclusion, trust, and practical progress. It should preserve recognizable 24Asia brand assets after a brand audit while eliminating inconsistent templates and decorative elements that impair readability.

### 14.2 Design-system requirements

- Tokenized color, typography, spacing, elevation, radius, motion, and breakpoints.
- Accessible components for navigation, cards, tables, forms, date/time, filters, dialogs, toasts, status, file upload, rich content, charts, and offline indicators.
- Component states: default, hover, focus, active, disabled, loading, empty, error, offline, success, pending, and permission denied.
- Plain-language content patterns and locale expansion support.
- No essential information conveyed only by color, icon, animation, or hover.
- Minimum WCAG-compliant target sizes, with 44×44 CSS pixels preferred for primary touch controls.
- Respect `prefers-reduced-motion`, forced colors, zoom, and user font scaling.
- Dark mode MAY be offered after contrast validation; it is not a substitute for an accessible default theme.

### 14.3 Core screen inventory

**Public:** home, global search/results, program/course catalog/detail, event catalog/detail, opportunity catalog/detail, resource directory/detail, impact, story/article, team, partners, donate, contact, policies, urgent help, sign in/register.

**Learner/member:** dashboard, enrollment, calendar, materials, assignment/assessment, certificate, support request/status, preferences, data controls.

**Volunteer:** dashboard, application, onboarding checklist, opportunities, shift calendar/detail, check-in, hours, expense, supervision, recognition, incident report.

**Partner:** organization, verification, agreement, shared project, listing, referral, report.

**Admin:** role dashboard, queue/list/detail patterns for every domain, calendar, form builder, CMS editor, media library, translation workspace, workflow review, reports, permissions, audit, integration health.

### 14.4 Empty/error states

Every screen must define:

- First-use guidance.
- No-results recovery and filter reset.
- Permission-denied route without revealing record existence.
- Offline state and data freshness.
- Partial provider failure.
- Deleted/archived content behavior.
- Clear retry/support route with correlation ID for technical errors.

---

## 15. Accessibility Requirements

The entire public site, PWA, portals, and admin application MUST conform to [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/).

Mandatory implementation expectations:

- Semantic HTML and correct landmark/heading structure.
- Full keyboard operation and visible, unobscured focus.
- Skip links and logical focus restoration.
- Programmatic labels, instructions, errors, descriptions, and status announcements.
- 4.5:1 normal text and 3:1 large text/non-text contrast where WCAG requires.
- 200% zoom without content loss and 400% reflow for applicable content.
- Captions for video, transcripts for audio, alt text, and audio description where needed.
- No autoplay with sound; pause controls for movement.
- Accessible authentication compatible with password managers and paste.
- Accessible alternatives to CAPTCHA, maps, charts, drag/drop, QR-only check-in, and document previews.
- Plain-language forms, progress, save/resume, review-before-submit, and reversible actions.
- Accessible PDFs/documents or equivalent HTML content.
- Published accessibility statement and accessible issue-report route.

**Verification:** automated scanning plus manual keyboard, zoom/reflow, VoiceOver/Safari, TalkBack/Chrome, and NVDA/Firefox testing; representative disabled users must test critical journeys before major launch.

---

## 16. Localization and Content Language

### 16.1 Launch language strategy

The default planning baseline is below and MUST be validated with user demand and sustainable reviewer capacity at Phase 0 exit.

| Tier | Locales | Required coverage | Release rule |
|---|---|---|---|
| P0 default | English (`en-SG`), Bengali (`bn`), Tamil (`ta`) | Complete public top tasks, identity/consent, registration, learner/volunteer portal essentials, notifications, urgent help, privacy, and support boundaries | Cannot launch a locale until named primary/backup reviewers approve all critical content |
| P1 candidate | Bahasa Indonesia/Malay, Tagalog/Filipino, Burmese, Simplified Chinese | Start with reviewed public essentials, then portal workflows based on measured demand | Coverage gaps must be clearly disclosed; no silent English fallback for critical consent/safety copy |
| Future | Other community languages | Defined per country/community evidence | Requires owner, glossary, support route, and review SLA |

For every enabled locale, the controlled coverage register records source language, translated surfaces, fallback behavior, reviewer and backup, last critical review, maximum review age, and launch-blocking defects.

- English may be the source language, but source authority must be explicit.
- Safety-critical content cannot launch in a language without a current human-reviewed version.
- Users choose language; the system must not force it from IP, nationality, employer, or SIM.
- URLs use stable locale paths and reciprocal `hreflang`.

### 16.2 Technical localization

- UTF-8 and canonical BCP 47 tags.
- ICU/CLDR formatting for pluralization, dates, times, numbers, names, and currency.
- `lang` on page/fragments and `dir` based on content language.
- Logical CSS properties and bidirectional isolation.
- Support 30–50% text expansion and mixed-script user input.
- Search handles common transliterations, misspellings, diacritics, and local place synonyms.
- Localize metadata, alt text, captions, errors, notifications, moderation reasons, receipts, and support routes.

### 16.3 Editorial quality

- Define tone: respectful, direct, encouraging, non-patronizing, and plain-language.
- Use “migrant workers” or audience-preferred terms consistently.
- Avoid framing community members only as beneficiaries; represent learners, volunteers, leaders, experts, and contributors.
- Publish translation glossary and style guide per language.
- Machine-translated text must be labeled until human-approved and must never be the sole version of critical guidance.

---

## 17. SEO, Discoverability, and Structured Data

- Crawlable, localized, stable URLs.
- Unique title, description, heading, canonical, Open Graph, and social image.
- XML sitemaps by content type/locale with only canonical indexable pages.
- Redirect map from all valuable current URLs; remove demo/sample/duplicate pages from the index.
- `noindex` plus authentication for portal, admin, drafts, internal search, support, moderation, and personal pages. `robots.txt` is not access control.
- Structured data where accurate: Organization, Event, Course, Article/NewsArticle, BreadcrumbList, FAQ only where eligible, ProfilePage for approved public team profiles, and Donation/Action patterns only if supported.
- Event status/date changes reflected in markup.
- Image optimization, descriptive filenames, captions, rights metadata, and responsive variants.
- Content freshness and broken-link reporting.
- Search Console/Bing equivalent monitoring and controlled redirects during migration.

---

## 18. Privacy, Consent, Retention, and Data Rights

The platform must implement Singapore PDPA obligations including accountability, notification, consent where applicable, purpose limitation, accuracy, protection, retention limitation, transfer limitation, access/correction, and breach notification. See [PDPC’s obligation overview](https://www.pdpc.gov.sg/-/media/files/pdpc/pdf-files/resource-for-organisation/data-protection-obligations-under-the-pdpa.pdf) and [education-sector guidance](https://www.pdpc.gov.sg/-/media/files/pdpc/pdf-files/advisory-guidelines/advisory-guidelines-for-education-sector_25-apr-2024.pdf).

### 18.1 Privacy requirements

- Maintain a field-level data inventory: purpose, basis, source, sensitivity, recipient, residency, owner, retention trigger, deletion method.
- Publish layered privacy notices in approved languages.
- Separate operational necessity from optional analytics, research, public storytelling, fundraising, and marketing.
- Collect immigration status, health, ethnicity, religion, trauma, or exact protected location only when a documented service purpose and control set require it. NRIC, FIN, Work Permit, or equivalent national identifiers may be collected only when required by law or demonstrably necessary for high-fidelity identity verification, with documented approval and an alternative identifier where practical.
- Do not use participant data to train general-purpose models.
- Do not use advertising pixels, fingerprinting, cross-site tracking, session replay, or keystroke capture.
- Strip image metadata and scan uploads.
- Provide access, correction, consent withdrawal, account closure, and request tracking.
- Document vendors, subprocessors, regions, transfers, deletion, and incident terms.
- Appoint and publish contact details for the Data Protection Officer.

### 18.2 Proposed retention baseline

Final periods require legal/operational approval.

| Record | Default proposal | Trigger/behavior |
|---|---:|---|
| Unsaved sensitive device draft | ≤24 hours | Purge after sync/logout/expiry |
| Failed upload | 7 days | Delete payload; retain minimal error metadata |
| General application logs | 30 days | Redacted at source |
| Raw first-party analytics | 90 days | Aggregate then delete |
| Closed basic account/profile | Delete/anonymize within 30 days | Subject to documented obligations/holds |
| Program/event registration | 2 years after completion | Anonymize for impact where possible |
| Volunteer operational record | 2 years after exit, then review | Longer only for justified screening/conduct obligations |
| Support/referral record | 2 years after closure, then review | Separate sensitive narrative schedule |
| Donation/financial record | Statutory finance/tax requirement | Confirm locally |
| Security/privileged audit | 12 months | Extend only by approved risk/legal need |
| Consent/policy evidence | Processing life + applicable limitation period | Store receipt/version, not unrelated data |
| Safeguarding record | Jurisdiction/policy-specific | Segregated; safeguarding/legal approval |
| Backups | 35-day rolling proposal | Encrypted; deletion by expiry; restore reapplies tombstones |

### 18.3 Data-rights operations

- Requests receive identity-proportionate verification.
- Dashboard tracks deadline, scope, exemptions/holds, reviewer, fulfillment, and communication.
- Exports exclude other people’s data and internal protected information.
- Deletion performs a dry-run impact preview and preserves only required minimal records.
- Quarterly deletion reports prove retention jobs are operating.

### 18.4 Numbered privacy and breach controls

| ID | Pri. | Requirement |
|---|---:|---|
| PRIV-001 | P0 | A suspected personal-data breach MUST enter a controlled workflow recording discovery, containment, affected data/people, harm assessment, notifiability decision, approvals, regulator/individual communication, evidence, and closure. |
| PRIV-002 | P0 | Statutory assessment and notification deadlines MUST be configurable and monitored; missed/at-risk deadlines MUST alert the DPO and incident owner. |
| PRIV-003 | P0 | Telephone/SMS/voice marketing audiences in Singapore MUST retain consent evidence and apply applicable Do Not Call checks/suppressions before send; service messages MUST remain separately classified. |
| PRIV-004 | P0 | Forms that request NRIC/FIN/Work Permit or equivalent identifiers MUST require an approved necessity/law configuration, explain purpose, prohibit display in general CRM/search, and apply restricted retention/access. |
| PRIV-005 | P0 | Privacy notices, consent receipts, data sharing, access/correction, and withdrawal MUST be available in the enabled critical locales. |

Operational implementation must follow current [PDPC breach reporting guidance](https://www.pdpc.gov.sg/report-data-breach), [Do Not Call guidance](https://www.pdpc.gov.sg/-/media/Files/PDPC/PDF-Files/Resource-for-Organisation/DNC-Rules-for-Organisations-v3.pdf), and applicable [national-identifier guidance](https://www.pdpc.gov.sg/-/media/Files/PDPC/PDF-Files/Press-Room/2019/Media-Release-on-Reminder-on-NRIC-Advisory-Guidelines.pdf), with local counsel/DPO validation before launch.

---

## 19. Security Requirements

Use [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) Level 2 as the general verification baseline and relevant Level 3 controls for safeguarding, bulk export, privileged administration, and restricted records. Align the program with [NIST CSF 2.0](https://www.nist.gov/cyberframework), [NIST SSDF](https://csrc.nist.gov/pubs/sp/800/218/final), and Singapore [CSA cyber guidance](https://www.csa.gov.sg/our-programmes/support-for-enterprises/sg-cyber-safe-programme/).

### 19.1 Application and infrastructure security

- TLS everywhere, HSTS, secure cookies, CSRF protection, strict CORS, restrictive CSP, frame protection, Referrer-Policy, output encoding, parameterized queries, and safe redirects.
- Tokens never in URLs or insecure browser storage; short-lived access and rotating refresh tokens.
- MFA for staff; phishing-resistant factors for privileged users where supported.
- Breached-password screening, rate limiting, account enumeration protection, and secure recovery.
- Managed secrets/KMS, least privilege, environment isolation, credential rotation, and no production data in lower environments.
- WAF/DDoS protection and action-aware rate limits that avoid blocking entire dormitories/shared networks.
- Private-by-default object storage with short-lived authorized downloads.
- Upload allowlist, renamed object keys, size limits, MIME/content verification, malware scanning, image transcoding, and separate serving origin.
- Dependency, secret, SAST, DAST, IaC, container, and license scanning; SBOM and signed build artifacts.
- Critical internet-facing vulnerabilities mitigated within 24 hours and High within 7 days, or affected functionality disabled under documented exception.
- Annual independent penetration test and after material identity/data-boundary changes.

### 19.2 Audit requirements

Append-only/tamper-evident audit events for:

- Authentication, recovery, MFA, and session changes.
- Role/assignment/policy/configuration changes.
- Sensitive reads, searches, downloads, and exports.
- Consent and privacy-request actions.
- Content approval/publication.
- Registration/result/certificate changes.
- Donation/refund/reconciliation actions.
- Moderation, disciplinary, incident, safeguarding, and break-glass actions.
- Integration/webhook and retention/deletion activity.

Audit records include UTC time, actor/service, action, object type and pseudonymous ID, scope, outcome, reason, policy version, assurance, source context, and correlation ID—but no tokens, secrets, request bodies, or unnecessary personal values.

---

## 20. Safeguarding, Moderation, and Ethical Controls

### 20.1 Required operating model

Before launching high-risk features, 24Asia must establish:

- Named safeguarding lead and backup.
- Approved safeguarding policy, code of conduct, complaints procedure, referral map, and incident SOP.
- Safe recruitment and role-risk assessment.
- Staff/volunteer training and acknowledgement.
- Confidential online and offline reporting routes.
- Staffed coverage hours and truthful response expectations.
- Survivor-centered safe-contact and consent practices.
- Post-incident learning without exposing affected people.

### 20.2 Report taxonomy

- Spam/scam/impersonation.
- Harassment, hate, bullying, discrimination.
- Personal information/doxxing/stalking.
- Recruitment exploitation, fees, trafficking, coercion.
- Sexual exploitation/abuse or volunteer misconduct.
- Child-safety concern.
- Self-harm/immediate danger.
- Dangerous or false health/legal/employment advice.
- Exposed shelter/protected location.
- Data/security incident.

### 20.3 Initial response policy

The system should support configurable severity SLAs. A proposed starting model:

- Immediate danger: show official emergency/urgent alternatives immediately; do not imply 24Asia real-time monitoring.
- Critical safeguarding report: alert trained on-call coverage and acknowledge within the declared staffed window.
- High risk: human review within four staffed hours.
- Routine reports: human review within one business day.

If staffing cannot meet the declared model, disable the corresponding high-risk feature.

### 20.4 Automation limits

Automated systems may flag, prioritize, redact previews, or identify likely PII. They may not make unreviewed permanent sanctions, safeguarding disposition, diagnosis, immigration/employment eligibility, or police/reporting decisions.

---

## 21. Performance, Reliability, and Scalability

### 21.1 Performance budgets

At p75 real-user measurement, segmented responsibly by device/route/locale:

- LCP ≤2.5 seconds.
- INP ≤200 milliseconds.
- CLS ≤0.1.

For critical public routes on a low-end Android/slow-4G profile:

- TTFB ≤800 ms.
- First meaningful content target ≤1.8 s.
- Core content usable ≤3.5 s.
- Primary action usable ≤5 s.
- Initial compressed HTML/CSS/JS/fonts ≤250 KB.
- Initial JavaScript ≤100 KB where feasible.
- Above-fold image ≤150 KB.
- Total first load ≤500 KB target.

Use responsive AVIF/WebP with fallback, lazy media, font subsets/system fonts, no autoplay, and no mandatory map or tag manager.

### 21.2 Service-level objectives

- Public verified information: 99.95% monthly availability.
- Authenticated core workflows: 99.9%.
- Successful accepted writes: 99.9%.
- Urgent notification jobs handed to provider: 99% within five minutes, excluding documented provider outage.
- API read p95 ≤500 ms and write p95 ≤1 s, excluding named third-party latency.

### 21.3 Capacity and resilience

- Load test at 2× forecast peak with ≥30% resource headroom.
- Idempotency, bounded queues, backpressure, retries with jitter, timeouts, circuit breakers, and dead-letter queues.
- Graceful degradation if search, maps, translation, analytics, social, or notification providers fail.
- Public safety information and previously saved resources remain available during partial outage.

**Provisional planning assumptions—replace with validated Phase 0 forecasts:**

| Measure | Launch design | 12 months | 24 months |
|---|---:|---:|---:|
| Registered accounts | 7,500 | 15,000 | 30,000 |
| Monthly active users | 3,000 | 7,500 | 15,000 |
| Normal concurrent users | 100 | 250 | 500 |
| Peak concurrent users | 300 | 600 | 1,200 |
| Registration-opening burst | 30 writes/sec for 5 min | 60 writes/sec | 120 writes/sec |
| Event check-ins in 30 minutes | 500 | 1,000 | 2,000 |
| Notification campaign burst | 10,000 recipients | 25,000 | 50,000 |
| Managed media/object storage | 250 GB | 500 GB | 1 TB |

Peak tests cover registration opening, QR/manual check-in, campaign delivery, report generation, and provider degradation. Phase 0 must also approve provider quotas, data growth, and a monthly infrastructure/vendor cost ceiling.

**SLO calculation:** monthly calendar window; availability uses eligible user requests excluding documented synthetic traffic and client-side offline operation. Planned maintenance counts as unavailable unless the same journey remains usable. Third-party failure counts when the platform lacks the committed fallback. Error-budget burn triggers feature freeze/remediation thresholds defined in the operations policy.

### 21.4 Backup and disaster recovery

- Identity, consent, protected records, and core writes: RPO ≤15 minutes; RTO ≤4 hours.
- Public content: RPO ≤24 hours; RTO ≤1 hour.
- Analytics: RPO/RTO ≤24 hours.
- Encrypted immutable backups in a logically separate account/region as approved.
- Daily backup verification, monthly sample restore, quarterly full-service restore, annual disaster exercise.

---

## 22. Observability and Operations

Use vendor-neutral telemetry compatible with [OpenTelemetry](https://opentelemetry.io/docs/specs/otel/).

Monitor:

- Availability, latency, error rate, saturation, and Core Web Vitals.
- Queue age, retries, dead letters, and provider status.
- Login/recovery anomalies and permission denials.
- Registration/payment/referral workflow failures.
- Notification delivery and opt-out failures.
- Stale critical content and translation backlog.
- Moderation/safeguarding queue age without exposing content.
- Consent, access/deletion, retention, and backup jobs.
- Search zero-result and broken-link rates.
- Offline sync conflicts and failed updates.

Telemetry must use an allowlist and exclude names, contact details, message/content bodies, exact coordinates, tokens, restricted IDs, and full sensitive URLs/query strings.

P1 safety/security/major outage alerts require on-call escalation, runbook, user communication template, status-page path, and post-incident review.

---

## 23. Recommended Technical Architecture

### 23.1 Architecture style

Start with a **modular monolith** with strict domain modules and event/outbox integration. It reduces cost and operational complexity while preserving boundaries for future extraction.

### 23.2 Logical architecture

1. **Edge:** DNS, CDN, DDoS/WAF, TLS, image optimization, cache.
2. **Web/PWA:** server-rendered public application plus progressively enhanced authenticated application.
3. **Backend/API:** backend-for-frontend and versioned OpenAPI contract.
4. **Domain modules:** identity/consent, CMS/localization, learning, events, volunteering, CRM, support/referrals, career/mentoring, community/moderation, partners, fundraising, commerce/assets, communications, reporting, governance.
5. **Data:** relational transactional database; encrypted object storage; public/approved search index; cache; queue; append-only audit store; analytics warehouse using minimized events.
6. **Control plane:** identity provider, policy engine, KMS/secrets, feature flags, country/locale configuration, observability, backup, retention jobs.
7. **Integration layer:** provider adapters, signed webhooks, transactional outbox, idempotent consumers.

### 23.3 Trust boundaries

Logically and cryptographically separate:

- Public content.
- General authenticated profile/participation data.
- Support/referral data.
- Safeguarding data.
- Payments/financial data.
- Audit data.
- Analytics data.

Search, analytics, translation, maps, social, and AI vendors receive no restricted fields by default.

### 23.4 Technology selection principles

The final stack should be selected after team capability and budget review. Mandatory characteristics:

- Mature accessible web framework with server rendering.
- Relational database with robust transactions and row-level policy options.
- Standards-based OIDC identity provider with MFA/passkeys.
- Private object storage and CDN.
- Managed queue/background jobs.
- Headless or integrated structured CMS supporting workflow/localization.
- Infrastructure as code and separate dev/staging/production environments.
- Automated backups, observability, vulnerability management, and controlled feature flags.
- Data portability and avoidance of irreversible vendor lock-in.

---

## 24. Integrations

### 24.1 P0 integrations

- Email delivery.
- Hosted payments and webhook reconciliation.
- Calendar links/feeds.
- Maps/directions link with text alternative; avoid mandatory embedded map.
- Malware scanning for uploads.
- First-party privacy-preserving analytics.
- Error monitoring/observability.
- Existing social links and approved embeds using privacy-conscious loading.

### 24.2 P1 integrations

- SMS and/or WhatsApp Business through approved providers.
- Push notifications.
- Video meeting provider for enrolled cohorts.
- Accounting export/import.
- Background-check provider only where lawful and necessary.
- Partner/referral APIs.
- Social publishing APIs.
- Credential/certificate verification.

### 24.3 Integration controls

Every integration needs:

- Business purpose and data-field map.
- Owner, security/privacy review, processor terms, data region, retention, subprocessors, and exit plan.
- Scoped OAuth/service identity, encrypted secrets, egress controls, strict schemas, rate/size limits, timeouts, and circuit breakers.
- Signed, timestamped, replay-protected webhooks.
- Idempotency and reconciliation.
- Contract tests, versioning, deprecation plan, alerting, and manual fallback.

---

## 25. Analytics Event Model and KPIs

### 25.1 Privacy-preserving event model

Each event definition must specify purpose, fields, sensitivity, owner, consent/basis, retention, and allowed reporting dimensions.

Core event families:

- `content_viewed`, `search_performed`, `search_zero_results`, `resource_saved`.
- `program_viewed`, `registration_started/submitted/approved/cancelled`, `waitlist_joined/promoted`.
- `session_checked_in`, `attendance_recorded`, `course_completed`, `certificate_issued`.
- `event_registered/attended/cancelled`.
- `volunteer_opportunity_viewed`, `volunteer_application_submitted/status_changed`, `shift_signed_up/completed`, `hours_approved`.
- `support_request_submitted/assigned/referred/closed` using no narrative data.
- `donation_started/completed/failed/refunded` using provider references, never card data.
- `notification_queued/delivered/failed/opened/actioned` where lawful and proportionate.
- `consent_granted/withdrawn`, `privacy_request_submitted/completed`.
- `offline_content_saved`, `sync_started/completed/failed/conflict`.

No free text, names, contact details, exact location, immigration/health narrative, document content, or safeguarding detail enters analytics.

### 25.2 KPI framework

| Area | KPIs |
|---|---|
| Reach/access | Unique people served; priority-language reach; assisted/offline registrations; task success; search zero-result rate; mobile completion; accessibility issues |
| Learning | View-to-registration; approval time; attendance; completion; competency gain; certificate issuance; next-program uptake; learner-reported usefulness |
| Events | Registration-to-attendance; waitlist conversion; cancellations/no-shows; accessibility requests fulfilled; satisfaction; incidents |
| Volunteers | Application-to-approval; screening time; training compliance; shift fill; attendance; hours; supervision cadence; retention; leadership progression; participant feedback |
| Support/referrals | Time to acknowledgement/first human response; assignment; referral acceptance; closure; unmet-need reason; follow-up; user-reported ease/dignity |
| Career | Plan completion; mentorship engagement; verified applications; interview/placement; 90/180-day follow-up; exploitative listing reports |
| Content | Freshness; translation parity; broken links; search success; useful-vote rate; publication cycle time |
| Community safety | Reports per 1,000 active users; review SLA; sampled violation prevalence; repeat harm; appeal overturn; blocked/muted use; language quality |
| Fundraising | Checkout completion; recurring retention; failed-payment recovery; receipt delivery; campaign progress; restricted-fund reconciliation |
| Trust/governance | Consent withdrawal completion; data-request time; access review completion; break-glass use; export volume; retention deletion; backup restore; incidents |
| Platform | Availability; CWV; API latency; error rate; notification delay; offline sync success; provider failures; support tickets |

A lower report count is not automatically success; it may indicate inaccessible reporting. Equity breakdowns must use voluntarily collected, purpose-approved data and minimum cohort thresholds.

---

## 26. Admin Dashboards and Saved Views

### 26.1 Executive dashboard

- Active people served and trend.
- Program/event/volunteer outcome funnel.
- Outcome targets and methodology.
- Partner/fundraising summary.
- High-level safety, privacy, security, and operational risks.
- Data freshness and confidence warnings.

### 26.2 Program dashboard

- Registrations, eligibility queue, capacity/waitlist.
- Attendance, no-shows, completion, outcomes.
- Instructor/venue/material readiness.
- Accessibility needs and fulfillment status.
- Upcoming actions and communications.

### 26.3 Volunteer dashboard

- Applicant pipeline, onboarding blocks, expiring training/checks.
- Shift coverage and no-show risk.
- Hours awaiting approval.
- Supervision overdue.
- Team capacity and leadership vacancies.

### 26.4 Content dashboard

- Draft/review/approval queue.
- Stale/expiring critical content.
- Missing or stale translations.
- Missing alt text/rights/consent.
- Broken links and low-search success topics.

### 26.5 Safety/governance dashboard

- Restricted role/access review due.
- Incident queue by severity and age.
- Policy acknowledgement gaps.
- Privacy requests and retention jobs.
- Audit anomalies and break-glass reviews.

Dashboards show only what the role may access and must never expose sensitive case details in notification previews.

---

## 27. Migration and Content Remediation

### 27.1 Inventory and mapping

- Crawl all current URLs, media, forms, sitemaps, redirects, metadata, and inbound-link value.
- Classify each item: migrate, consolidate, rewrite, archive, redirect, or delete.
- Map yearly schedules/results/events into structured entities.
- Remove or protect public operational pages such as `/admin-panel/`, HRM/email/assets links, samples, demo shop pages, duplicate home layouts, and obsolete donation/dashboard routes.
- Establish authoritative values for impact claims before migration.

### 27.2 Data migration

- Import people only where a valid purpose and notice exist; avoid blindly importing historical contact lists.
- Deduplicate using controlled review.
- Record source, migration batch, consent status, and confidence.
- Malware-scan and rights-review media.
- Preserve historical event/program context without presenting old information as current.
- Validate counts and sample records with business owners.

### 27.3 SEO migration

- Preserve valuable slugs where sensible.
- Implement tested 301 redirect map.
- Generate new sitemaps and canonicals.
- Remove low-value demo/duplicate pages from index.
- Monitor crawl errors, rankings, search queries, and redirects for at least 12 weeks after launch.

### 27.4 Cutover

- Content freeze window and final delta migration.
- Parallel read-only validation where practical.
- DNS/traffic cutover with rollback.
- Forms, payment, email, redirects, search, analytics, and PWA smoke tests.
- Archive old system securely with defined retention and access.

### 27.5 Migration acceptance control totals

Migration cannot pass on spot checks alone. The signed reconciliation pack MUST show:

- 100% of discovered URLs have an approved `migrate / consolidate / archive / redirect / delete` disposition.
- 100% of URLs with inbound links, current search traffic, active campaign use, or organizational/legal value have a tested destination; the agreed high-value list has zero unresolved redirect failures.
- Source and target record counts by entity, migration batch, status, and exclusion reason reconcile.
- Zero unowned restricted records; all imported confidential/restricted records have purpose, owner, classification, and retention.
- Consent/notice exceptions and suspected duplicates are zero or within an explicitly approved quarantine threshold; quarantined records cannot be messaged or exposed.
- Stratified field-accuracy sampling meets ≥99.5% for critical identity/contact/consent/status fields and ≥98% for noncritical migrated fields, with 100% correction of sampled critical failures before release.
- Media without confirmed rights/consent is quarantined and not public.
- Public schedules, event dates, locations, and impact counts are signed by business data owners.
- Rollback/forward recovery is rehearsed with measured recovery time and immutable source exports.

---

## 28. Phased Delivery Plan

Durations are indicative and must be replanned after discovery, content inventory, team capacity, vendor selection, and legal/safeguarding review.

### Phase 0 — Discovery, co-design, and safety foundation (4–6 weeks)

**Deliverables**
- Stakeholder map and decision governance.
- Compensated research with migrant learners, volunteers, coordinators, trainers, partners, disabled users, and priority-language users.
- Top-task journeys and tested prototypes.
- Content/data/system inventory.
- Role matrix, data map, retention schedule, threat model, DPIA, safeguarding assessment, and child-access decision.
- KPI dictionary and baseline plan.
- Technical spike, architecture decision, vendor shortlist, and migration plan.

**Exit gate:** Named product, privacy, security, accessibility, content, operations, and safeguarding owners approve scope and risks.

### Phase 1 — Safe foundation, released in increments (24–32 weeks total)

The complete P0 baseline is too broad for one undifferentiated release. Phase 1 is delivered to a pilot audience through independently releasable increments. Planning assumes the core team in §29 has at least one dedicated product manager, designer, technical lead, 2–3 frontend/PWA engineers, 2–3 backend/integration engineers, QA/accessibility support, content/localization operations, and part-time security/privacy/safeguarding specialists. Re-estimate after Phase 0.

#### Phase 1A — Public, CMS, content, and PWA foundation (8–10 weeks)

- Responsive public information architecture and design system.
- Structured CMS/media/translation, review/expiry, current programs/events/opportunities, search, impact, resources, and policies.
- PWA shell, install where supported, offline public essentials, low-bandwidth and graceful-fallback behavior.
- SEO inventory/redirect framework, accessibility baseline, analytics allowlist, infrastructure, observability, backup, and security foundation.

**Gate:** Public content, accessibility, PWA fallback, critical translations, infrastructure, and migration pilot evidence pass. No authenticated sensitive workflow or payment is exposed merely because 1A launches.

#### Phase 1B — Identity and operational pilot (10–14 weeks)

- Identity, risk-based recovery, consent, preferences, adult eligibility/age-review controls.
- Programs/courses/cohorts, events, registration, waitlists, attendance, learner dashboard.
- Volunteer opportunities, applications, acknowledgements, basic assignment information, volunteer dashboard.
- Staff/admin queues, scoped CRM, forms/tasks/documents, minimum incident and restricted safeguarding workflow, audit, privacy requests, and retention jobs.
- Private support-contact/referral workflow required by SUP-004–SUP-008 and basic career appointment requests, but each public intake remains feature-disabled until named trained coverage, response times, official pathways, and escalation pass the operational gate.
- Email and in-app service notifications.

**Gate:** Pilot cohort completes end-to-end learner, volunteer, incident, privacy, and support drills; role/resource authorization, shared-number recovery, accidental-minor handling, and backup restore pass.

#### Phase 1C — Transactions, migration, and production hardening (6–8 weeks)

- One-time hosted donations, receipts, refunds/approval, and reconciliation after legal-entity/tax/refund approval.
- Partnership inquiry and basic partner records; T-shirt request may launch only if it does not delay safety-critical P0 work.
- Full approved content/data migration, redirects, performance/capacity testing, support training, penetration test, disaster/incident/rollback exercises, and production cutover.
- Recurring donations remain disabled until Phase 2 FUND-006 controls exist.

**Phase 1 exit gate:** Every applicable P0 requirement has traceable acceptance evidence under §31.8; critical content and migration controls are signed; staff are trained; no launch-blocking decision remains open. Capabilities whose legal or operational prerequisite is not approved remain off behind feature flags rather than weakening the gate.

### Phase 2 — Learning and volunteer operating system (10–14 weeks)

**Deliverables**
- Assessments, certificates, pathways, materials, trainer workflows.
- Full volunteer screening, required training, shifts, hours, expenses, supervision, recognition, and leadership progression.
- Partner records/agreements and portal basics.
- Donor portal, recurring-plan self-service/failed-payment controls, campaigns, and recurring donation activation only after FUND-006 passes.
- Campaign/newsletter workflow, SMS/WhatsApp where approved, push notifications.
- Inventory/assets, governance documents, meetings, risks, advanced reports.

**Exit gate:** Pilot teams can retire designated spreadsheets; access recertification and data-rights workflows operate end-to-end.

### Phase 3 — Advanced support, career, partner referrals, and controlled community (12–18 weeks)

**Deliverables**
- Verified services directory and partner-connected closed-loop referral integration building on the Phase 1 restricted support workflow.
- Career goals, mentorship, verified opportunity listings, application milestones, and outcomes; appointment requests already piloted in Phase 1B.
- Expanded safeguarding operations for the new high-risk features.
- Limited moderated cohort community, reporting, appeals, and multilingual moderation.
- Advanced partner reporting and support/referral outcome analytics.

**Non-negotiable gates:**
- No community launch without trained moderators, coverage, report/appeal tooling, and safeguarding escalation.
- No career marketplace without employer/listing verification and anti-exploitation policy.
- No wellbeing intake without current official pathways and trained human response.
- No minor access without separate specialist child-safety design.

### Phase 4 — Optimization and responsible scale (ongoing)

- Open Referral interoperability.
- Skills passport and controlled credential sharing.
- Advanced offline packs/check-in.
- Cross-country configuration.
- Carefully evaluated recommendations.
- Low-risk AI assistance with human approval, evaluation, opt-out, and kill switch.

---

## 29. Suggested Delivery Team and Governance

### 29.1 Core team

- Executive sponsor.
- Product manager/product owner.
- Delivery/project manager.
- Service designer/user researcher.
- Product designer with accessibility expertise.
- Content strategist/editor and localization lead.
- Technical lead/architect.
- Frontend/PWA engineers.
- Backend/integration engineers.
- QA/accessibility engineer.
- DevOps/SRE/security support.
- Data/analytics engineer or analyst.
- Migration/content operations support.
- Volunteer operations and program SMEs.
- Privacy/DPO, safeguarding, legal, finance, and fundraising reviewers.
- Priority-language reviewers and compensated community advisors.

### 29.2 Decision model

- Product owner prioritizes backlog within approved outcome/safety constraints.
- Design, engineering, content, operations, accessibility, security/privacy, and safeguarding each have release sign-off responsibility for their domain.
- High-risk features require a documented safety case and operational owner.
- Architecture decisions and policy exceptions are recorded with owner, rationale, expiry, and review date.

### 29.3 Provisional budget and affordability envelope

These are **planning assumptions in Singapore dollars, not vendor quotations**. They include loaded product/design/engineering/QA/delivery effort and specialist privacy, accessibility, security, localization, migration, and safeguarding support. They exclude donation principal, payment percentage fees, office/venue costs, and major third-party licenses not yet selected.

| Cost area | Lean controlled pilot | Recommended base | High-complexity/accelerated |
|---|---:|---:|---:|
| Phase 0 discovery and controls | S$60k–100k | S$100k–160k | S$160k–250k |
| Phase 1A–1C foundation | S$450k–700k | S$700k–1.10m | S$1.10m–1.60m |
| Phase 2 learning/volunteer operations | S$180k–300k | S$300k–500k | S$500k–750k |
| Phase 3 advanced support/career/community | S$220k–350k | S$350k–650k | S$650k–950k |
| 24-month cloud, vendors, maintenance, on-call | S$250k–450k | S$450k–750k | S$750k–1.10m |
| 24-month localization/content/moderation/support operations | S$250k–450k | S$450k–800k | S$800k–1.30m |
| Independent security/accessibility/legal exercises and contingency | S$120k–220k | S$220k–380k | S$380k–600k |
| **Indicative total through Phase 3 plus 24 months operation** | **S$1.53m–2.57m** | **S$2.57m–4.34m** | **S$4.34m–6.55m** |

**Planning recommendation:** use the recommended-base range until Phase 0 replaces it with a bottom-up cost model. The lean case is viable only by narrowing languages, integrations, migration volume, and advanced workflows—not by weakening accessibility, privacy, security, safeguarding, or operational gates. A 15–20% contingency must remain visible. Phase 0 must produce unit assumptions for staff/FTE months, cloud/storage, email/SMS/WhatsApp/push, payment fees, identity, CMS/search, monitoring, malware scanning, backups, translation per word/hour, moderation/support coverage, annual penetration tests, and accessibility audits. Each release increment receives a “run-cost added” estimate and cannot proceed without 24-month operating funding.

---

## 30. Dependencies and Open Decisions

### 30.1 Dependencies

- Confirm legal entity, charity/IPC status, donation/tax treatment, and fundraising permissions.
- Confirm current systems, hosting, WordPress ownership, domains, mailboxes, databases, forms, spreadsheets, social accounts, payment providers, and analytics.
- Confirm data owner and lawful migration basis for historical learner/volunteer records.
- Confirm translation languages and sustainable reviewer capacity.
- Confirm safeguarding and support operating coverage.
- Confirm payment, messaging, accounting, video, and identity vendors.
- Confirm budget, delivery team, operating support, and target launch date.

### 30.2 Launch-blocking decision register

This register is authoritative. `Product owner`, `executive sponsor`, and the named control owner approve the final value by Phase 0 exit unless an earlier procurement/content lead time applies. An unresolved blocker keeps the related capability disabled.

| Decision | Planning default | Owner/approver | Due | Affected scope | Blocker |
|---|---|---|---|---|---|
| Launch market/personas | Singapore; adults; migrant learners/community participants, volunteers, trainers, coordinators, donors, and basic partners | Product / Sponsor | Phase 0 week 2 | All | Yes |
| Minor participation | Adults-only; SAFE-001–005 handle accidental disclosure; no guardian flow | Safeguarding / Sponsor | Phase 0 week 2 | IAM, LMS, EVT, VOL, SUP | Yes |
| P0 languages | `en-SG`, Bengali, Tamil under §16.1; others P1 candidates | Localization / Product | Phase 0 week 2 | Content, UI, notifications, acceptance | Yes |
| Legal entity/charity/IPC and tax status | Unconfirmed; donations remain disabled until verified | Finance/legal / Sponsor | Before payment vendor contract | FUND | Yes |
| Payment scope | One-time donations P0; no merchandise payment or recurring charge until later controls | Finance / Product | Phase 0 week 3 | FUND, MER | Yes |
| Staffed support channels/hours | Unconfirmed; public private-contact form stays off, public verified resources remain on | Support+safeguarding / Sponsor | Before 1B pilot | SUP, CAR, incidents | Yes |
| Direct versus referred counselling | Default referral/navigation only; no diagnosis or clinical care | Safeguarding/clinical adviser / Sponsor | Before 1B design lock | SUP | Yes |
| Volunteer screening by role | Risk assessment determines references/checks/probation/supervision; no blanket check | Volunteer lead+safeguarding | Phase 0 week 4 | VOL | Yes |
| Historical data migration | Public content/events first; personal records only with approved purpose, notice, owner, and retention | DPO+data owners / Sponsor | Before migration build | §27, CRM | Yes |
| Verified impact claims | No number publishes without source, definition, owner, and “as of” date | Impact lead / Sponsor | Before 1A content freeze | WEB, REP | Yes |
| Tenant/country horizon | Single Singapore organization for first 24 months; country configuration retained, no multi-tenant UI | Product+architecture / Sponsor | Phase 0 week 3 | Architecture, data | No |
| Partner self-service/data sharing | Basic organization profile/inquiry P0; shared participant data off until agreement and P1 portal | Partnerships+DPO | Before partner portal | PAR, SUP, CAR | Yes for sharing |
| Authenticated offline materials | Public/saved approved materials only P0; no restricted personalized cache | Product+security | Phase 0 week 4 | PWA, LMS | No |
| Existing tools/integrations | Inventory in Phase 0; no integration is mandatory without owner, contract, and exit plan | Architecture+operations | Phase 0 week 4 | §24 | Yes where replacing live workflow |
| Budget/cost ceiling | Recommended-base planning envelope S$2.57m–4.34m through Phase 3 plus 24 months operation; Phase 0 must approve a bottom-up ceiling and funded run-cost | Sponsor+finance | Phase 0 week 2 | Delivery and vendor choices | Yes |
| Named product owner and launch date | Unassigned / no approved date | Sponsor | Before Phase 0 starts | Governance and schedule | Yes |

A decision log records selected value, rationale, approving names/date, linked requirement IDs, and superseded default. This baseline is not “Final/Approved” until all rows marked blocker have a selected value.

---

## 31. Acceptance Criteria and Release Gates

### 31.1 Functional launch acceptance

- A guest can find an active course/event/opportunity in their language and complete the intended public action on mobile and desktop.
- A learner can register, verify, set needs/preferences, receive confirmation, see enrollment, cancel, check in, and access permitted materials.
- A volunteer can apply, complete required acknowledgements, see status, and receive assignment information.
- Staff can create, review, translate, approve, schedule, publish, update, cancel, and archive content without developer intervention.
- Staff can manage capacity, waitlists, attendance, cancellations, and communication from one record.
- Hosted one-time donation success/failure/refund and receipt/reconciliation paths work from signed provider events; card data never reaches the platform.
- A manual refund requires the configured approval/audit path. Before recurring donations are enabled, a donor can view, cancel, and update the plan and staff can resolve failed payments without hidden continued charging.
- Admin permissions prevent cross-team, cross-program, and restricted-record access.
- Audit trail reconstructs consent, publication, role change, export, donation adjustment, and sensitive-record access.
- Existing high-value URLs redirect correctly; no public demo/admin/private page is indexed.
- PWA installs on supported platforms and provides the defined offline experience without caching restricted data.

### 31.2 Accessibility gate

- Critical journeys have documented WCAG 2.2 AA conformance evidence for every applicable success criterion; no known A/AA failure is open on those journeys.
- Automated scan plus manual keyboard, screen-reader, zoom/reflow, contrast, target, reduced-motion, caption, and error-recovery checks pass.
- Representative disabled and target-language users complete top tasks without assistance beyond the task’s intended support.
- Accessibility exceptions are not permitted for critical journeys. A noncritical known issue requires severity, workaround, named approver, user impact, expiry, and committed correction date.

### 31.3 Security/privacy gate

- Approved threat model, data-flow diagram, DPIA/privacy review, data inventory, retention schedule, vendor register, and incident plan.
- Staff MFA and privileged step-up work.
- Authorization tests cover every resource/action pair, including files, search, exports, jobs, and APIs.
- No unresolved Critical vulnerability, restricted-data authorization failure, payment-integrity failure, or active safeguarding exposure. A High finding may be exceptionally time-limited only when not in those categories and when the security owner and product sponsor approve a compensating control, user-risk statement, expiry, and disabled/rollback trigger.
- Data access/correction/export/closure and retention deletion are tested end-to-end.
- Payment data never enters platform logs/storage.
- Backup restore meets stated RPO/RTO.

### 31.4 Performance/PWA gate

- CI budgets pass for critical routes.
- Critical-journey performance and reliability targets pass; remediation-only exceptions are limited to noncritical routes and require measured user impact, approver, compensating action, and expiry.
- Install, first launch, offline fallback, saved content, update, storage eviction, logout purge, queued action, failed sync, and conflict scenarios pass across the §13.5 matrix where the capability is supported.
- Critical public content remains readable with JavaScript failure and on unstable networks.

### 31.5 Localization/content gate

- No missing message IDs in launch locales.
- Pseudo-localization, text expansion, mixed-script, date/time/number, and RTL tests pass where relevant.
- 100% of safety, privacy, consent, employment-rights, health, and urgent-help content is human reviewed.
- Every public item has owner, status, locale, review date, and correct metadata.
- Media has rights/consent and accessible alternatives.
- Current schedules and metrics are reconciled to authoritative records.

### 31.6 Operational gate

- Staff training and role assignments complete.
- Runbooks exist for account takeover, lost device, bad publication/translation, payment mismatch, notification failure, provider outage, doxxing, exploitation report, safeguarding concern, data breach, accidental export, data request, and restore.
- On-call/escalation and user communication routes are tested.
- Critical forms have assisted/offline alternatives.
- Rollback can complete within 15 minutes for application release; data migration rollback/forward plan is approved.

### 31.7 Definition of done for every feature

A feature is done only when:

- Requirements and acceptance criteria are approved.
- Empty/loading/error/offline/permission states are designed.
- Mobile, desktop, keyboard, and screen-reader behavior are covered.
- Localization, content, analytics, privacy, security, retention, audit, and support impacts are resolved.
- Role permissions and abuse cases are tested.
- Documentation/runbook and operational owner exist.
- Monitoring and rollback/disable mechanism exist.
- Known limitations are user-visible where relevant.

### 31.8 Requirements traceability and acceptance evidence

The numbered requirements in §8 and §18.4 are the authoritative product requirement register. Before a requirement enters implementation, its delivery record MUST contain: `requirement ID`, release increment, source/risk, owner, Given/When/Then scenarios, positive and failure paths, role/data scope, applicable locale/device/offline variants, test level, evidence link, and approver. No P0 item can pass only because an epic-level demonstration succeeds.

| Requirement families | Planned release | Minimum acceptance evidence owner |
|---|---|---|
| IAM, SAFE | 1B | Product + security + safeguarding: account/recovery/session/consent and age-review scenarios |
| WEB, CMS | 1A | Content + accessibility + SEO: structured lifecycle, search, expiry, locale, rights, redirects |
| LMS, EVT | 1B | Program lead + QA: capacity, waitlist, attendance, cancellation/change, permissions, offline fallback |
| VOL | 1B basics; P1 depth in Phase 2 | Volunteer lead + safeguarding: application/status/policy/assignment and eligibility-block scenarios |
| CRM, ADM, OPS | 1B/1C | Operations + security: object/action authorization matrix, audit, data quality, incidents, feature flags |
| CAR | Public resources/appointment gate 1B; full Phase 3 | Career lead + safeguarding/legal: boundaries, consent, verified listing/fee controls |
| SUP | Restricted intake 1B; directory/partner loop Phase 3 | Support+safeguarding: safe contact, triage, consented sharing, response, closure, urgent fallback |
| COM | Phase 3 only | Moderation+safeguarding: report/quarantine/action/notice/appeal and abuse simulations |
| PAR | Basic 1C; portal/referrals Phase 2–3 | Partnerships+DPO: verification, agreement, data-sharing scope, expiry |
| FUND | One-time 1C; recurring Phase 2 | Finance+security: signed webhook, reconciliation, receipt, refund approval, plan cancellation |
| MER | Optional 1C basics; inventory Phase 2 | Operations+finance: status, stock, payment-disabled behavior, fulfilment/refund where enabled |
| MSG | Email/in-app 1B; other channels Phase 2 | Communications+DPO: preferences, DNC where applicable, discreet previews, failure/suppression |
| REP | Baseline 1C; advanced Phase 2 | Impact lead+DPO: metric definition, permission, small-cell suppression, source reconciliation |
| PRIV | 1B/1C | DPO+security: data rights, breach workflow/deadlines, identifier restrictions, retention deletion |
| §§13–24 NFRs | 1A foundation; complete by 1C | Accessibility, security, SRE, localization, privacy owners using §31 gates |
| §27 migration | 1A inventory; 1C cutover | Migration lead + data/content owners using §27.5 control totals |

**Critical journey definition:** public urgent-help access; locale selection; registration/sign-in/recovery; course/event discovery and registration/cancellation; volunteer application/incident report; staff publication and participant management; support intake when enabled; donation/refund when enabled; privacy request; restricted-record access denial; and logout/clear-device.  
**High-value URL definition:** any current URL with inbound links, organic traffic, active campaign/printed use, current operational value, legal/policy value, or stakeholder designation.  
**Required test sample:** all P0 locales and §13.5 browser classes for each applicable critical journey; every role-resource-action pair for confidential/restricted objects; 100% high-value URLs plus automated coverage of the complete redirect map.

---

## 32. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Scope becomes “everything at once” | Delays, poor quality, unsafe launch | Enforce P0/P1/P2 phases and safety gates |
| Inconsistent source data | Loss of trust and bad reporting | Data owners, reconciliation, definitions, “as of” dates |
| Volunteer operations lack capacity | Unanswered requests and stale records | Pilot teams, queue dashboards, SLAs based on actual staffing |
| Sensitive migrant data is over-collected | Safety, legal, and reputational harm | Data minimization, restricted domains, retention, access review |
| Community features attract scams/harassment | Direct user harm | Defer open community; limited cohorts, moderation, reporting, appeals |
| Users share devices/change numbers | Account/privacy failures | Alternative recovery, safe notifications, clear-device controls |
| Translation quality creates harm | Misunderstanding of support, rights, or consent | Human review, glossary, version parity, short review intervals |
| PWA caches sensitive information | Privacy exposure | Explicit allowlist, no personalized caching, logout purge |
| Over-reliance on third-party messaging/social APIs | Delivery failure/vendor lock-in | Provider abstraction, consent ledger, email/in-app fallback, export path |
| AI produces false or biased guidance | Safety and discrimination risk | Limit to low-risk assistance; human approval; no high-impact automation |
| Staff use shadow spreadsheets/chat | Fragmented source of truth | Co-design, migration, training, usable admin, phased retirement plan |
| Historical WordPress SEO is lost | Reduced discoverability | URL inventory, redirects, sitemap/canonical monitoring |
| Donation/merchandise rules are unclear | Financial/compliance issues | Confirm entity/tax/refund/accounting requirements before activation |
| Under-18 users participate unexpectedly | Safeguarding risk | Adults-first messaging and handling SOP; separate child-safety design |

---

## 33. Future Advanced Features—Only After Foundation Maturity

- User-controlled skills passport and verifiable credentials.
- Open Referral-compatible service exchange.
- Cross-organization volunteer opportunities with shared safeguarding standards.
- Advanced low-bandwidth audio and downloadable learning packs.
- On-device or privacy-preserving translation assistance.
- Capacity forecasting and suggested scheduling.
- Responsible program/resource recommendations with explanations, opt-out, fairness evaluation, and kill switch.
- Partner grant and sponsorship marketplace.
- Multi-country configuration with country-specific policies, data residency, languages, and support directories.
- Native wrapper only if a measured capability cannot be delivered adequately by the PWA.

These are not launch commitments and require evidence of user value, operating capacity, privacy/safety review, and total-cost approval.

---

## 34. Product Launch Success Review

At 30, 60, and 90 days after each major release, review:

- Top-task success and user feedback by device/language/access need.
- Registration, attendance, completion, and volunteer funnel.
- Staff workload and shadow-system use.
- Content accuracy, translation freshness, search success, and redirects.
- Privacy requests, consent withdrawal, access anomalies, incidents, and retention jobs.
- Accessibility defects and support tickets.
- Performance, reliability, offline use, and notification delivery.
- Safety reports, response quality, and whether feature limits remain appropriate.
- Outcome evidence, not just activity volume.
- Whether the next phase’s operational gates are truly ready.

Leadership must be willing to pause, narrow, or disable a feature when safety, accessibility, data quality, or staffing is inadequate.

---

## 35. Research and Standards References

The following sources informed this PRD. Linked material was synthesized and rephrased rather than reproduced.

### 35.1 Current-state evidence register

| Source | Publisher/type | Access/version | Supports | Limitation |
|---|---|---|---|---|
| [24Asia home](https://www.24asia.org/) | 24Asia; first-party observation | Accessed 29 Jul 2026 | Mission, impact claims, activity areas, partners/testimonials, current navigation | Public claims require internal source validation |
| [Page sitemap](https://www.24asia.org/page-sitemap.xml) and [event sitemap](https://www.24asia.org/gva_event-sitemap.xml) | 24Asia/Rank Math; technical inventory | Accessed 29 Jul 2026 | Duplicated/year-specific pages, historical event/program breadth, public operational/demo routes | Sitemap presence does not prove active use |
| [2026 schedule](https://www.24asia.org/training-schedule-2026/), [results](https://www.24asia.org/training-results-2026/), and [calendar](https://www.24asia.org/our-calendar/) | 24Asia; first-party content | Accessed 29 Jul 2026 | Training/event model and conflicting date/year observations | Current accuracy must be confirmed by owners |
| [Volunteer recruitment](https://www.24asia.org/join-us-as-a-volunteer/) and [handbook](https://www.24asia.org/volunteer-handbook/) | 24Asia; first-party policy/content | Accessed 29 Jul 2026 | Roles, progression, conduct, privacy, safety, attendance, team operations | Policy approval/effective version not independently confirmed |
| [Facebook share link](https://www.facebook.com/share/18EDdiLuxE/) | 24Asia/Meta; social presence | Accessed 29 Jul 2026 | Resolves to The24asia Singapore page | Most content login-gated; no quantitative audit performed |
| Standards and official guidance below | Regulators/standards/domain authorities | Versions linked; recheck before approval | Requirements for accessibility, privacy, security, PWA, migrant safety, payments, and governance | Some international/UK guidance is analogous, not Singapore law |

Evidence labels used in delivery: **Observation** (direct current-product inspection), **First-party claim** (requires owner/source validation), **Regulatory/standards requirement**, **Domain guidance**, **Planning assumption**, and **Stakeholder/user evidence**. Phase 0 MUST add research method, dates, participant/sample summary, findings, and resulting requirement changes. Until then, this is a desk-research-informed baseline, not a completed co-design record.

### 35.2 24Asia and Singapore context

- [24Asia current website](https://www.24asia.org/)
- [Singapore PDPC: Data Protection Obligations under the PDPA](https://www.pdpc.gov.sg/-/media/files/pdpc/pdf-files/resource-for-organisation/data-protection-obligations-under-the-pdpa.pdf)
- [Singapore PDPC: Advisory Guidelines for the Education Sector](https://www.pdpc.gov.sg/-/media/files/pdpc/pdf-files/advisory-guidelines/advisory-guidelines-for-education-sector_25-apr-2024.pdf)
- [Singapore PDPC: report a personal-data breach](https://www.pdpc.gov.sg/report-data-breach)
- [Singapore PDPC: Do Not Call rules for organizations](https://www.pdpc.gov.sg/-/media/Files/PDPC/PDF-Files/Resource-for-Organisation/DNC-Rules-for-Organisations-v3.pdf)
- [Singapore PDPC: national identifier guidance reminder](https://www.pdpc.gov.sg/-/media/Files/PDPC/PDF-Files/Press-Room/2019/Media-Release-on-Reminder-on-NRIC-Advisory-Guidelines.pdf)
- [Singapore Charity Portal: revised Code of Governance announcement](https://www.charities.gov.sg/PublishingImages/News-and-Notices/Newsroom/Press-Releases/Documents/2023/4%20Apr%202023%20-%20Media%20Release%20-%20Publication%20of%20Revised%20Code%20of%20Governance.pdf)
- [Singapore CSA: SG Cyber Safe Programme](https://www.csa.gov.sg/our-programmes/support-for-enterprises/sg-cyber-safe-programme/)
- [Singapore MOM: migrant worker publications and multilingual resources](https://www.mom.gov.sg/passes-and-permits/work-permit-for-foreign-worker/publications-and-resources)
- [Singapore MOM: employment-agency fee explanation](https://mom.gov.sg/newsroom/press-replies/2024/1108-forum-reply-on-employment-agencies)
- [Singapore MOM: wellbeing barriers for migrant workers](https://www.mom.gov.sg/newsroom/speeches/2025/1005-speech-by-mos-for-world-mental-health-day-event)
- [Singapore MOH: national mindline 1771](https://www.moh.gov.sg/newsroom/national-mindline-1771-to-provide--round-the-clock-support-for-mental-health/)

### 35.3 Accessibility, web, PWA, and SEO

- [W3C Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C guidance for applying WCAG 2.2 to mobile](https://www.w3.org/TR/wcag2mobile/)
- [W3C internationalization quick tips](https://www.w3.org/International/quicktips/Overview)
- [web.dev: PWA getting started](https://web.dev/learn/pwa/getting-started/)
- [web.dev: PWA install criteria](https://web.dev/articles/install-criteria)
- [web.dev: Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)
- [Google Search: localized page versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google Search: event structured data](https://developers.google.com/search/docs/appearance/structured-data/event)
- [Google Search: organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)

### 35.4 Security, identity, audit, and architecture

- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP API Security Top 10](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework)
- [NIST SP 800-63-4 Digital Identity Guidelines](https://pages.nist.gov/800-63-4/)
- [NIST SP 800-162 ABAC Guide](https://csrc.nist.gov/pubs/sp/800/162/upd1/final)
- [NIST Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final)
- [OpenTelemetry specification](https://opentelemetry.io/docs/specs/otel/)
- [OpenAPI 3.1 specification](https://spec.openapis.org/oas/v3.1.0)

### 35.5 Migrant services, safeguarding, wellbeing, and nonprofit operations

- [IOM Operational Guidance on Data Responsibility](https://migrantprotection.iom.int/en/resources/manuals-toolkits-and-guidance/operational-guidance-data-responsibility-humanitarian)
- [UNHCR: Enabling Safe Access to Digital Spaces](https://www.unhcr.org/innovation/wp-content/uploads/2021/03/Enabling-Safe-Access-to-Digital-Spaces.pdf)
- [WHO: Mental health and forced displacement](https://www.who.int/news-room/fact-sheets/detail/mental-health-and-forced-displacement)
- [WHO: Ethics and governance guidance for large multimodal models](https://www.who.int/news-room/articles-detail/who-releases-ai-ethics-and-governance-guidance-for-large-multi-modal-models)
- [ILO: recruitment risks facing migrant workers](https://www.ilo.org/resource/article/fly-now-pay-later-one-traps-migrant-workers)
- [UK Charity Commission safeguarding guidance](https://www.gov.uk/guidance/safeguarding-and-protecting-people-for-charities-and-trustees)
- [CHS Alliance complaints best-practice guidance](https://www.chsalliance.org/get-support/article/meeting-chs-commitment-5-five-best-practice-tips-when-responding-to-complaints/)
- [Open Referral Human Services Data Specification](https://docs.openreferral.org/en/latest/hsds/overview.html)
- [PCI SSC payment-page security guidance](https://blog.pcisecuritystandards.org/new-information-supplement-payment-page-security-and-preventing-e-skimming)

**Licensing note:** Content derived from external sources was paraphrased and synthesized for compliance with licensing restrictions.

---

## 36. Final Product Decision

Build 24Asia as a **unified, multilingual Community Impact Platform**, not as separate public, volunteer, and admin websites with duplicated data. Use one design system, one identity/consent layer, one structured source of truth, and policy-scoped portals for each role. Launch the safe operational foundation first; add community, advanced referrals, matching, and AI only when governance and staffing prove ready.

This approach gives 24Asia a credible path from its current content-rich volunteer website to a top-tier management platform that can support mobile and desktop users, operate as a PWA, improve day-to-day delivery, protect migrant communities, demonstrate impact, and scale responsibly.
