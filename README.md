# ParallelEvent™ — User Portal & Profile Architecture

> **Document Type:** Technical Reference & Product Specification  
> **Version:** 1.0  
> **Status:** Internal — Protected under NDA  
> **Last Updated:** May 2026

---

## Table of Contents

- [Overview](#overview)
- [Portal Access Summary](#portal-access-summary)
- [Portal 1 — Company / Event Organizer](#portal-1--company--event-organizer)
  - [Who They Are](#who-they-are--why-they-exist)
  - [Profile Section Breakdown](#profile-section-breakdown)
    - [Organization Name & Company Registration](#organization-name--company-registration)
    - [Primary Contact & Role Title](#primary-contact--role-title)
    - [Account Tier](#account-tier--starter--professional--enterprise)
    - [Billing & Subscription](#billing--subscription)
    - [Assigned Events](#assigned-events)
    - [Team Members & Sub-Accounts](#team-members--sub-accounts)
    - [Venue Portfolio](#venue-portfolio)
    - [Kids' Zone Templates](#kids-zone-templates)
    - [API Key](#api-key)
- [Portal 2 — Attendee / Parent (PMI)](#portal-2--attendee--parent-pmi)
  - [Who They Are](#who-they-are--why-they-exist-1)
  - [Profile Section Breakdown](#profile-section-breakdown-1)
    - [Full Name & Profile Photo](#full-name--profile-photo)
    - [Linked Child Profiles](#linked-child-profiles)
    - [Upcoming Events](#upcoming-events)
    - [Notification Preferences — Haptic Alert Matrix](#notification-preferences--haptic-alert-matrix)
    - [Bio-Link History](#bio-link-history)
    - [Trusted Guardians](#trusted-guardians)
    - [Emergency Contact](#emergency-contact)
- [Portal 3 — Admin / CEMS Operator](#portal-3--admin--cems-operator)
  - [Who They Are](#who-they-are--why-they-exist-2)
  - [Profile Section Breakdown](#profile-section-breakdown-2)
    - [Full Name & Designation](#full-name--designation)
    - [Bio-Key Status](#bio-key-status)
    - [Clearance Level](#clearance-level)
    - [Assigned Events](#assigned-events-1)
    - [Terminal Access](#terminal-access)
    - [Active Sessions](#active-sessions)
    - [Override Log](#override-log)
    - [Proximity Breach History](#proximity-breach-history)
    - [2FA Configuration](#2fa-configuration)
    - [Permissions Matrix](#permissions-matrix)
- [Cross-Portal Workflow: Event Day Timeline](#cross-portal-workflow-event-day-timeline)

---

## Overview

ParallelEvent™ operates across **three distinct authenticated portals**, each serving a fundamentally different type of user with different operational needs, access levels, and interface paradigms. The separation between portals is not cosmetic — it is a core architectural decision that enforces accountability, prevents configuration accidents, and ensures that the right people have access to exactly the capabilities they need, and nothing more.

| Portal | User Type | Interface | Primary Relationship to Events |
|--------|-----------|-----------|-------------------------------|
| **Portal 1** | Company / Event Organizer | Web (desktop-first) | Pre-event configuration, post-event analytics |
| **Portal 2** | Attendee / Parent | Mobile app (iOS & Android) | Live monitoring during event |
| **Portal 3** | Admin / CEMS Operator | Web terminal (desktop-only) | Real-time operational control on event day |

---

## Portal Access Summary

| Feature | Company | Attendee / Parent | Admin |
|---------|---------|-------------------|-------|
| Event configuration | ✅ Full | ❌ | ✅ Override only |
| Kids' Zone live feed | ❌ | ✅ Own child only | ✅ All cameras |
| CEMS Dashboard | ❌ | ❌ | ✅ Full |
| Bio-Link wristband control | ❌ | ❌ | ✅ |
| Emergency Lockdown | ❌ | ❌ | ✅ |
| Analytics & reports | ✅ Post-event | ❌ | ✅ Live + historical |
| Quiet-Alert receipt | ❌ | ✅ | ✅ Staff channel |
| Gate override authority | ❌ | ❌ | ✅ (dual-confirm required) |
| Billing & subscription | ✅ | ❌ | ❌ |
| Team member management | ✅ | ❌ | ❌ |
| Audit log export | ✅ Post-event | ❌ | ✅ Live |
| Trusted Guardian management | ❌ | ✅ | ❌ |
| Clearance level assignment | ❌ | ❌ | ✅ L9 only |

---

## Portal 1 — Company / Event Organizer

### Who They Are & Why They Exist

The Company portal is the **commercial entry point** of the entire system. Without this user, no event exists. They are the paying client — the wedding planner who contracts ParallelEvent™ for a Saturday gala, the corporate HR director running an annual family day, or the conference organizer hosting a 3-day summit. Their entire relationship with the platform is **pre-event and post-event** — they configure everything before guests arrive, and they review everything after guests leave. They never touch live security or real-time operations.

**Who uses this portal:**
- Wedding planners and social event agencies
- Corporate HR teams running company family days or galas
- Event management agencies
- Hotel and resort event departments
- Conference and summit organizers

The reasoning for keeping them entirely separate from the Admin portal is deliberate: a wedding planner should never have access to gate override controls, and a CEMS security officer should never be able to edit a client's billing details. These are fundamentally different concerns handled by fundamentally different people.

---

### Profile Section Breakdown

#### Organization Name & Company Registration

This is the **legal identity anchor** of the account. The organization name appears on every document generated by the platform — event confirmation letters, Kids' Zone wristband packaging, PMI app event banners, post-event analytics reports, and invoice PDFs. The company registration number or tax ID is required for enterprise billing, invoice generation, and audit compliance.

If a large hotel chain is white-labeling the ParallelEvent™ platform under their own brand, the organization name populates the white-label skin automatically — every parent-facing interface, email, and printed material will carry the hotel's identity rather than the ParallelEvent™ brand.

> **Workflow:** Entered once during onboarding, verified against a business registry API, and locked from casual editing thereafter. Any changes require a re-verification process with a 48-hour review window.

---

#### Primary Contact & Role Title

This is the human the platform reaches when something needs a decision that software cannot make alone — an unusual Kids' Zone configuration request, a billing dispute, a last-minute venue change 48 hours before an event. The role title matters because it determines the tone and content of system-generated communications.

A `"Senior Event Director"` at a luxury hotel receives different onboarding guidance and feature suggestions than a `"Solo Wedding Planner"` running boutique events. The system uses this role context to surface relevant documentation and templates at setup time.

> **Workflow:** The primary contact is the account owner. They can assign a secondary contact (their assistant or junior coordinator) who receives CC copies of all system communications but cannot make billing or account-level changes.

---

#### Account Tier — Starter / Professional / Enterprise

This is the most consequential profile field for the Company user because it governs every capability they have access to across the platform.

| Tier | Events/Year | Max Children/Event | Kids' Zone Templates | Staff Sub-Accounts | API Access | White-Label |
|------|-------------|-------------------|---------------------|-------------------|------------|-------------|
| **Starter** | 1–4 | 30 | 1 | ❌ | ❌ | ❌ |
| **Professional** | Unlimited | 150 | Unlimited | 3 | ✅ | ❌ |
| **Enterprise** | Unlimited | Unlimited | Unlimited | Unlimited | ✅ | ✅ |

- **Starter** is designed for independent planners. Includes basic PMI functionality and standard post-event PDF reports. No API access, no white-labeling, no multi-staff sub-accounts.
- **Professional** unlocks unlimited Kids' Zone templates, advanced analytics dashboards, 3 staff sub-accounts, and the Venue Portfolio feature for saving floor plan configurations across venues.
- **Enterprise** is for hotel chains, large conference operators, and agencies managing multiple simultaneous events. Includes dedicated account manager assignment, SLA-backed uptime guarantees, and priority support routing.

> **Workflow:** Tier is selected at signup and can be upgraded instantly (billing is prorated). Downgrading requires a 30-day notice period to protect active events already configured under the higher tier's feature set.

---

#### Billing & Subscription

The billing section tracks three cost streams simultaneously:

1. **Base subscription cost** — monthly or annual SaaS fee for the selected tier
2. **Per-event credits consumed** — each registered child consumes one credit; credits are replenished monthly on Professional/Enterprise or purchased in bundles on Starter
3. **Hardware rental charges** — wristband sets and SACG reader units, itemized per event

The reason all three are unified in one view is that the Company user needs to understand their **total cost of using ParallelEvent™ per event**, not just their monthly fee. Hardware rental fees are itemized separately because they are recoverable costs that the Company user may pass through to their end client (the bride, the corporate client, etc.) as a line item on their own invoice.

> **Workflow:** Billing dashboard shows current cycle spend, projected next invoice, credit balance with depletion rate, and a per-event cost breakdown table. Stripe handles payment processing. Invoice PDFs are downloadable and include a ParallelEvent™ service description suitable for client reimbursement requests.

---

#### Assigned Events

This is the **operational heart** of the Company profile — the list of every event they have created, configured, or managed. Each event card shows the event name, venue, date, current status, the number of registered children, and a quick-access link to the event's configuration dashboard.

**Event Status System:**

| Status | Meaning | Company User Access |
|--------|---------|---------------------|
| `Draft` | Event created but Parallel Timeline not configured | Full edit |
| `Configured` | All settings complete, ready for Admin handover | Full edit |
| `Live` | Event actively running | Read-only status feed |
| `Completed` | Event ended, analytics report ready | Analytics access |
| `Archived` | Events older than 90 days, cold storage | Download only |

> **Workflow — 5-Step Event Creation Wizard:**
> 1. **Event details** — name, date, venue, expected adult guest count
> 2. **Kids' Zone configuration** — expected children count, age range, theme selection
> 3. **Parallel Timeline setup** — entering the adult event schedule, reviewing the auto-generated Kids' Zone activity schedule
> 4. **Staff assignment** — selecting which team members are assigned to this event
> 5. **Confirmation** — generating wristband order quantities and scheduling hardware delivery

---

#### Team Members & Sub-Accounts

Large event companies don't run events with one person. The sub-account system gives each team member a role-scoped login with permissions that prevent configuration accidents structurally, rather than relying on human discipline.

| Role | Event Config | Billing | Analytics | Live Read | Edit Roles |
|------|-------------|---------|-----------|-----------|------------|
| **Planner** | ✅ Full | ✅ View | ✅ | ✅ | ❌ |
| **Coordinator** | ✅ Edit only | ❌ | ❌ | ✅ | ❌ |
| **On-Site Tech** | ❌ Read-only | ❌ | ❌ | ✅ Hardware only | ❌ |

> **Workflow:** Account owner invites team members by email. The invited person receives a branded email with a one-click account creation link. Their role is pre-assigned by the inviting account owner and can only be changed by the account owner. Sub-accounts are automatically deactivated if the parent organization account is closed.

---

#### Venue Portfolio

Venues have fixed architectural constraints — wall positions, electrical outlet locations, fire exit corridors, ceiling heights that affect acoustic partition performance. The Venue Portfolio stores a digital configuration profile for each venue a Company user has worked with, so they never start from scratch when re-booking a known location.

**Each venue profile stores:**
- Venue name and full address
- Floor plan annotation showing SACG gateway positions, acoustic partition layout, Kids' Zone boundary
- Acoustic partition configuration that was used (panel count, arrangement, STC performance notes)
- Operational notes from past events (e.g., `"North wall has concrete columns — partition anchoring requires specialized hardware"`)

> **Workflow:** The first time a Company user configures an event at a new venue, they build the venue profile from scratch. On completion, they are prompted to save it to their Portfolio. On subsequent events at the same venue, selecting the saved profile pre-populates the entire floor plan configuration, reducing setup time significantly.

---

#### Kids' Zone Templates

Saved, reusable Kids' Zone configurations that capture the full setup of a themed zone so it can be deployed repeatedly without reconfiguration.

**Each template captures:**
- Zone theme name (e.g., `"The Little Gala"`, `"Junior Summit"`, `"Tiny Scientists"`)
- Activity schedule structure mapping activities to relative event milestones
- Decor color scheme and branding specification
- Branded activity kit material list (what to order and quantities)
- Recommended staffing ratio (supervisors per registered child)

> **Workflow:** Templates are created from scratch through a template builder, or saved directly from a completed event configuration via `"Save this event as a template"`. Templates can be shared across sub-accounts within the same organization. Enterprise users can share templates with other Enterprise accounts — useful for franchise hotel chains standardizing the guest experience across locations.

---

#### API Key

Enterprise and Professional accounts receive an API key that allows their existing booking and RSVP software to push guest data directly into the ParallelEvent™ CEMS database, eliminating manual data entry entirely.

**API capabilities:**
- **Push:** Guest RSVPs with child declarations → automatically creates child profiles in CEMS (name, age, allergy data)
- **Pull:** Post-event analytics data → feed into the Company's own reporting dashboards or CRM systems
- **Webhooks:** Real-time push notifications for key events (child checked in, Family Moment triggered, event completed)

> **Workflow:** The API key is generated once, shown only at generation time, then permanently masked. It can be rotated at any time through the developer settings page. API documentation is available in the Company portal's developer section. All API requests are authenticated via HMAC-SHA256 signature verification.

---

## Portal 2 — Attendee / Parent (PMI)

### Who They Are & Why They Exist

The Parent portal is the **most emotionally sensitive interface** in the entire system. This person is not a professional events operator — they are a guest at someone else's event, attending a wedding or corporate gala with their child. Their primary emotional state is one of divided attention: they want to enjoy the event, but they are fundamentally responsible for a small human being and cannot fully relax without knowing that child is safe, entertained, and reachable.

**Who uses this portal:**
- Parents and guardians attending any ParallelEvent™-managed gathering
- Trusted Guardians designated by a primary parent (via QR code access, no account required)

Every design decision in this portal is made around **one goal: reducing parental anxiety without requiring the parent to leave the event.** The interface must be fast, readable in low-light event conditions, operable with one hand, and surface critical information without requiring the parent to hunt for it.

This portal is **mobile-first by design** — a native app experience (iOS and Android) that also has a web interface for pre-event registration. During the event itself, the app is the only interface that matters.

---

### Profile Section Breakdown

#### Full Name & Profile Photo

The parent's name and photo serve two operational functions:

1. **At the SACG terminal:** When the parent taps their wristband at the Kids' Zone gate, the security supervisor's terminal displays the parent's photo alongside their registered child's photo — providing a human visual confirmation layer on top of cryptographic Bio-Link verification.
2. **In the supervisor's staff app:** Kids' Zone supervisors can visually identify which adult is authorized to collect which child, even without checking the wristband.

> **Workflow:** Photo is uploaded during pre-event registration. The system runs a basic image quality check (face clearly visible, minimum resolution enforced). The photo is stored encrypted and deleted 30 days after the event per GDPR/COPPA data retention policy.

---

#### Linked Child Profiles

This is the **most complex and most important section** of the Parent profile. A parent can register multiple children (useful for parents of 2–3 children attending together). Each child has their own sub-profile containing several distinct data categories, each serving a specific operational purpose.

---

**Child's Name, Age & Photo**

The name appears on Kids' Zone activity registers and supervisor attendance sheets. The age is used by the Activity Personalization Engine to filter age-appropriate activities — a 4-year-old and a 10-year-old should not be in the same activity group. The photo appears on the SACG terminal during checkout for visual verification.

---

**Allergy & Dietary Flags**

Color-coded using a traffic-light system:

| Color | Category | Examples |
|-------|----------|---------|
| 🔴 Red | Severe / anaphylactic allergy | Peanuts, tree nuts, shellfish |
| 🟡 Amber | Intolerance | Dairy, gluten |
| 🟢 Green | Dietary preference | Vegetarian, halal, kosher |

Each flag generates an automatic instruction in the Kids' Zone catering module. Before the kid-friendly buffet service begins, catering staff receive a printed allergy summary for every registered child. The flag also triggers a Quiet-Alert haptic notification to the parent's device when a food consumption event is logged — confirming their child's dietary restrictions were respected.

> **Reasoning:** Allergy management at events is a genuine life-safety concern. Centralizing this data and surfacing it automatically to catering staff eliminates the risk of verbal communication failure — where a parent tells a supervisor about an allergy who then fails to relay it to the kitchen.

---

**Interests**

The parent selects from a predefined set of interest categories during registration:

- 🎨 Creative Arts
- ⚽ Active Play
- 🔬 STEM & Discovery
- 🎭 Storytelling & Performance
- 🎵 Music
- 🎬 Film & Animation

These selections feed directly into the **Activity Personalization Engine**, which assigns the child to the most engaging activity track within the Kids' Zone. A child who selects Creative Arts is placed at the craft station; a child who selects Active Play is directed toward movement-based games.

> **Reasoning:** The system's ability to keep children genuinely engaged — not just supervised — is the core value proposition for parents. Generic activities that don't match a child's interests lead to restlessness, which generates alerts, which pulls parents away from the adult event. Personalization directly reduces alert frequency.

---

**Emergency Medical Notes**

A free-text field for information that doesn't fit standard allergy categories:
- Asthma requiring an on-site inhaler
- Epilepsy protocols
- Fear of loud noises (flagged to supervisors during speeches)
- Toilet training reminders

This field is visible **only** to Kids' Zone supervisors through their staff app. It is not visible to other parents, not surfaced in activity systems, and not included in any analytics reports.

---

**Bio-Link Wristband ID**

This field is **empty during pre-event registration** and is auto-populated the moment the parent and child tap their wristbands at the SACG check-in terminal on event day. The wristband ID (a cryptographic UUID) is stored in the child's profile for the duration of the event and used to verify every checkout attempt. After the event ends, the wristband ID is disassociated from the profile and the physical wristband is decommissioned.

> **Workflow:** The entire child profile is completed during a pre-event registration flow accessed via a link in the event invitation email. The flow takes approximately 4–6 minutes per child. Data is saved incrementally so a parent can complete it across multiple sessions. Incomplete profiles generate reminder push notifications at 72 hours and 24 hours before the event.

---

#### Upcoming Events

Each event the parent is registered for appears as a card showing:
- Event name, date, and venue
- Countdown timer to event start
- Number of children registered for that event
- Profile completion percentage with a prompt to complete missing fields

Tapping the event card opens the event-specific view showing the Parallel Timeline (the Kids' Zone activity schedule), the venue map, parking and arrival information, and step-by-step check-in instructions.

> **Workflow:** Parents are added to an event when the Company user marks them as registered (manually or via API from their RSVP system). The parent then receives an email invitation to create or log into their PMI account, link their child profile to this specific event, and complete any missing data fields.

---

#### Notification Preferences — Haptic Alert Matrix

The parent's control panel for how the system communicates with them during the event. The philosophy: different parents have different tolerance levels for interruption, and the system must respect that — while ensuring critical alerts always break through regardless of preference settings.

| Alert Type | Default | Can Disable? | Trigger |
|-----------|---------|-------------|---------|
| **Dietary Restriction** | On | ✅ | Food/drink consumption logged for child |
| **Behavioral Insight** | On | ✅ | Supervisor logs outlier behavioral note |
| **Activity Transition** | Off | ✅ | Child moves to next activity block |
| **Family Moment** | On | ❌ | 10min before and at start of Family Moment |
| **Emergency Priority** | On | ❌ | Proximity breach, medical alert, unauthorized checkout |

Each alert type also has an **intensity setting** — light tap, medium buzz, or strong pulse — because a parent sitting at a quiet speeches table needs a subtler notification than a parent on the dance floor.

> **Workflow:** The Haptic Alert Matrix is configured during pre-event registration and can be adjusted in real time through the app during the event. Changes take effect immediately and sync with the CEMS within 3 seconds.

---

#### Bio-Link History

A chronological log of every ParallelEvent™ event the parent has attended with a registered child. Each entry shows:
- Event name, date, venue
- Child(ren) who attended
- Check-in and check-out timestamps
- Summary of alerts received during that event

**Why this section exists:**

1. **Personal record** — parents have their own attendance history
2. **Legal copy** — the parent's own timestamped check-in/out record in case of any future dispute about when a child was released and to whom
3. **Personalization refinement** — the system uses historical interest data from past events to improve activity recommendations for future events

---

#### Trusted Guardians

A parent may not be the only adult authorized to collect their child. The Trusted Guardian system allows the parent to pre-register up to **3 secondary authorized adults** per child.

**Each Trusted Guardian entry requires:**
- Full name and relationship to child
- Mobile number
- Photo

The Trusted Guardian does **not** need a PMI account. They are registered within the parent's profile and their authorization is stored in the CEMS Bio-Link record. On event day, a Trusted Guardian presents a QR code generated by the primary parent's PMI app at the SACG terminal to authorize collection.

> **Reasoning:** Without this feature, a child could only be released to the exact Bio-Linked parent — creating problems if the parent falls ill, needs to leave early, or if a couple has separated and wants to share authorized pickup authority. The Trusted Guardian system maintains security (the primary parent controls who is authorized) while providing operational flexibility.

---

#### Emergency Contact

A field entirely separate from the Trusted Guardian, specifically for a person to be contacted if the **parent themselves becomes unreachable** during a medical or security emergency. This person is not authorized to collect the child — they are only contacted if the parent cannot be reached and a decision about the child's welfare needs to be made.

> **Access:** Visible only to Kids' Zone supervisors and the Admin/CEMS operator in a declared emergency. Invisible to all other parents. Never used for marketing or non-emergency communication.

---

## Portal 3 — Admin / CEMS Operator

### Who They Are & Why They Exist

The Admin portal is where the system's **power, complexity, and responsibility** are concentrated. CEMS Operators are the professionals who run the platform on event day — not the planners who configured it, not the parents who consume its output. They sit at a terminal in the venue's operations room, watch the density map, respond to proximity breach alerts, authorize gate overrides, and make real-time decisions that affect the physical safety of children.

**Who uses this portal:**
- ParallelEvent™ internal CEMS operations staff
- On-site venue security supervisors with assigned system access
- Kids' Zone floor supervisors (L1/L2 clearance)
- Senior event security officers (L3/L9 clearance)

This portal is **intentionally complex and unforgiving.** Every action is logged with a timestamp, the operator's identity, and the result. There is no undo for most actions. The design language reinforces seriousness: dense data displays, explicit confirmation dialogs, dual-authorization requirements for high-stakes actions, and a cryptographically sealed audit trail that cannot be modified by anyone.

> **Core principle:** If a child is released to an unauthorized adult, the system must be able to tell you exactly which operator authorized it, on which terminal, at what time, using which override protocol, and whether the dual-confirmation requirement was fulfilled. This auditability is what makes the system legally defensible.

---

### Profile Section Breakdown

#### Full Name & Designation

The operator's name and job title define their place in the security team hierarchy. Designation titles are **not cosmetic** — they map directly to clearance levels and appear verbatim on every action logged in the system audit trail.

| Designation | Clearance Level |
|------------|----------------|
| Kids' Zone Supervisor | L1 |
| SACG Terminal Operator | L2 |
| Senior Security Coordinator | L3 Executive |
| Chief Event Security Officer | L9 Master Override |
| System Administrator | L9 Master Override |

When a gate override is reviewed post-event, the audit log shows:
```
Authorized by: Director Alaric Thorne | L9 Master Override | SACG-01 | 14:22:10
```

---

#### Bio-Key Status

The CEMS Admin portal requires a **higher authentication standard** than username and password. The Bio-Key system is a multi-factor biometric authentication layer. For L3 and above operators, two Bio-Key factors must be active and verified for the session to remain live.

**Factor 1 — Retinal Scan:**
Verified at the start of each shift using a retinal scanner integrated with the SACG terminal hardware. Sessions expire after 4 hours and require re-verification. The timestamp of last verification is displayed in real time in the profile.

**Factor 2 — Subcutaneous Implant Signal (optional):**
An opt-in RFID chip implanted in the operator's hand that provides continuous passive authentication — the system knows the operator is physically present at the terminal without requiring repeated active scans. Signal strength is monitored in real time and displayed in the profile header.

> **Reasoning:** Standard password-based authentication is insufficient for a system that controls physical gate access to children. Biometric verification ensures that every logged action was taken by the specific named human — not someone with their password.

> **Workflow:** Bio-Key status is checked every time the operator attempts a high-privilege action. If the retinal scan has expired, the action is blocked until re-verification is completed.

---

#### Clearance Level

The most technically consequential field in the Admin profile. The clearance level is a **hard architectural gate** — certain actions are impossible below a required level, not merely hidden in the UI.

| Level | Title | Key Capabilities |
|-------|-------|-----------------|
| **L1** | Visitor | Read-only dashboard and Kids' Zone feed. Used for observers, auditors, trainees |
| **L2** | Operator | Standard gate operations, activity logging, Quiet-Alert dispatch |
| **L3** | Executive | Staff Override (dual-confirm), live timeline modification, audit log access |
| **L9** | Master Override | Emergency lockdown, wristband revocation, force-release any gate, clearance level assignment, full data export. **One per event.** |

> **Why L9 exists:** Emergencies are real. A fire, a medical crisis, a genuine security threat — these situations require one person with authority to override every protocol. But that authority must be traceable: every L9 action generates an automatic incident report dispatched to all stakeholders within 60 seconds.

---

#### Assigned Events

The Admin operator sees a fundamentally different version of the events list than the Company user. Rather than configuration status and billing, the Admin sees:

- Live attendance counts (current vs. capacity)
- Active alert counts (unacknowledged proximity breaches, pending gate requests)
- Kids' Zone capacity utilization percentage
- SACG terminal health status
- Real-time CEMS engine sync status

Each assigned event shows whether the operator is designated as **Primary** (responsible for all decisions) or **Secondary** (backup monitoring, defers to Primary). Primary operators have access to a dedicated escalation channel that bypasses the standard support ticket queue.

---

#### Terminal Access

Each SACG terminal in the venue (`Gate G-01`, `Gate G-12`, etc.) is independently controlled. An operator's Terminal Access record specifies **exactly** which gates they are authorized to open, override, or monitor. This prevents a rogue operator with physical access to one part of the venue from controlling a gate in another area.

> **Workflow:** The Terminal Access list is configured before the event by the L9 administrator and cannot be changed during a live event without L9 authorization. Any change made during a live event is flagged in the audit log as a `"live-event modification"` and triggers an automatic notification to the Company user.

---

#### Active Sessions

Every device the operator is currently logged into simultaneously:

| Session Type | Details Shown |
|-------------|---------------|
| Primary SACG Terminal | Device ID, venue location, login timestamp |
| Mobile Staff App | Device model, OS, last activity |
| Backup Terminal | Standby status, last sync |

**Why this section exists:**
- **Security:** If credentials are compromised, the L9 administrator can identify unauthorized sessions and kill them instantly
- **Operations:** The operations room supervisor can confirm all required positions are staffed and active in real time

> **Workflow:** Clicking any session shows its full activity log. The `"Kill All Other Sessions"` action terminates all sessions except the current one, generates an automatic security alert, and requires the operator to file an incident explanation within 5 minutes.

---

#### Override Log

Every manual override action taken by this operator — across their entire history on the platform — is recorded here permanently.

**Actions recorded:**
- Gate force-opens
- Manual child releases
- Emergency lockdowns
- Wristband revocations
- Event timeline edits
- Clearance level changes

**Each log entry contains:**
- Action type
- Event name and date
- Exact timestamp
- Justification entered by the operator at time of action
- Dual-confirmation partner's name (for actions requiring dual authorization)

> **Critical property:** The Override Log **cannot be deleted, modified, or hidden** — not even by L9 administrators. It is write-once and cryptographically signed at the moment of creation. This is the feature that makes the system legally defensible in any post-event investigation.

---

#### Proximity Breach History

A dedicated performance and accountability log of every proximity breach alert this operator received and how they responded.

**Each entry contains:**
- Child identifier (masked to initials for privacy in the default view)
- Breach type (inner perimeter, authorized zone, vault boundary)
- Response time (seconds from alert dispatch to operator acknowledgment)
- Action taken (investigated and cleared / escalated to L9 / dispatched supervisor)
- Final resolution

> **Performance metric:** Response time is tracked and reviewed. An operator who consistently takes more than 90 seconds to acknowledge a proximity breach alert is flagged in the monthly performance review for additional training.

---

#### 2FA Configuration

Manages all authentication factors for the operator's account:

| Factor | Details |
|--------|---------|
| **Staff PIN** | Masked, shows last-changed date and days since last rotation |
| **Biometric Method** | Retinal / Fingerprint / Both — registration status shown |
| **Physical Backup Key** | Vault reference code — location of 24-word recovery key in the venue's physical security vault |

The physical vault reference is the **emergency fallback** for when all digital authentication fails — retinal scanner malfunction, dead phone, terminal offline. Retrieving and entering the physical key is logged as a `"physical key authentication event"` and automatically generates a security review ticket requiring explanation within 24 hours.

---

#### Permissions Matrix

The most granular section of the Admin profile. A detailed table of exactly what this specific operator can and cannot do, presented as explicit yes/no values rather than role labels — because two L3 Executive operators may have different permission subsets based on their specific role at a given event.

| Permission | L1 | L2 | L3 | L9 |
|-----------|----|----|----|----|
| Emergency Lockdown | ❌ | ❌ | ❌ | ✅ |
| Staff Override (dual-confirm) | ❌ | ❌ | ✅ | ✅ |
| Staff Override (solo) | ❌ | ❌ | ❌ | ✅ |
| Wristband Revocation | ❌ | ❌ | ❌ | ✅ |
| Event Timeline Edit | ❌ | ❌ | ✅ | ✅ |
| Clearance Level Assignment | ❌ | ❌ | L1/L2 only | ✅ All |
| Audit Log Export | ❌ | ❌ | ✅ | ✅ |
| Camera Feed Access | ❌ | Assigned only | Assigned only | ✅ All |
| Support Ticket Management | ❌ | ✅ | ✅ | ✅ |
| Bio-Link Dissolution | ❌ | ❌ | ❌ | ✅ |

> **Workflow:** The Permissions Matrix is set by the L9 administrator at the **start of each event**, not as a permanent account setting. The same person may be a Primary L3 Executive at a 500-person corporate gala one week, and a Secondary L2 Operator at a small private party the next.

---

## Cross-Portal Workflow: Event Day Timeline

The three portals don't operate in isolation — they form a connected chain of actions running from the Company user's initial configuration all the way through to the Admin's post-event audit seal.

```
T-6 WEEKS ─── Company Portal
│
│  Company user creates the event, configures the Parallel Timeline,
│  selects the Kids' Zone theme, assigns team members.
│  CEMS generates the event ID and dispatches guest registration invitations.
│
T-2 WEEKS ─── Parent Portal (Web)
│
│  Parents receive PMI invitations, create accounts, complete child profiles:
│  allergies, interests, Trusted Guardian designations, photo upload.
│  Incomplete profiles trigger reminder notifications at T-72h and T-24h.
│
EVENT MORNING ─── Admin Portal
│
│  Admin operator logs into SACG terminal.
│  Bio-Key authentication verified (retinal scan).
│  Terminal access confirmed.
│  CEMS runs pre-event hardware check: NFC readers, camera feeds,
│  acoustic partition sensors, mesh network health.
│
EVENT START ─── All Three Portals Active
│
│  Parents arrive and check children in at the SACG gateway.
│  Each check-in creates a Bio-Link connecting parent app to child's session.
│  Admin operator monitors density map as Kids' Zone populates.
│  Company Coordinator monitors activity feed in read-only mode.
│
DURING EVENT ─── Parent Portal (Mobile) + Admin Portal
│
│  System runs autonomously per the Parallel Timeline.
│  Admin responds to proximity breach alerts, gate requests, support tickets.
│  Parents receive haptic notifications; view live feed via PMI app.
│  At scheduled Family Moments: CEMS dispatches PMI notifications to all
│  parents simultaneously and auto-unlocks the SACG for the defined interval.
│
EVENT END ─── Admin Portal + Parent Portal + Company Portal
│
│  CEMS triggers reunification sequence.
│  Parents tap wristbands at exit gate.
│  Each checkout is verified by the Admin terminal and logged.
│  CEMS generates post-event analytics report → delivered to Company user.
│  Override Log is finalized and cryptographically sealed.
│  Child profile data deletion is scheduled (30-day retention window).
│  Hardware decommissioning order is raised for wristband collection.
│
T+30 DAYS ─── Automated
│
   All child PII is permanently deleted from the CEMS database.
   Parent photos and wristband IDs are disassociated.
   Event record moves to Archived status in Company portal.
   Anonymized aggregate analytics data is retained for platform improvement.
```

---

## Data Retention & Privacy Summary

| Data Type | Retention Period | Who Can Access | Deletion Method |
|-----------|-----------------|----------------|-----------------|
| Child PII (name, photo, allergy data) | 30 days post-event | Kids' Zone supervisors, Admin (emergency only) | Automated secure deletion |
| Parent profile data | Until account closure | Parent only | Self-service or account closure |
| Bio-Link wristband IDs | Event duration only | Admin terminal | Auto-disassociated at event end |
| Override Log entries | Permanent | L3+ Admin, legal requests | Cannot be deleted |
| Post-event analytics | Indefinite (anonymized) | Company user | Aggregate only, no PII |
| API request logs | 90 days | Company user (own requests) | Automated rolling deletion |

---

> **Confidentiality Notice**  
> This document is internal to ParallelEvent™ and protected under signed Non-Disclosure Agreements. It is intended for development, product, and legal teams only. Unauthorized reproduction or distribution is prohibited.  
>
> © 2026 ParallelEvent™. All rights reserved.
