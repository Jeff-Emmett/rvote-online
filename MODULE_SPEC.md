# rVote — Decision Engine

**Module ID:** `rvote`
**Domain:** `rvote.online`
**Version:** 0.1.0
**Framework:** Next.js 16 / React 19 / Prisma / PostgreSQL
**Status:** Active

## Purpose

Credit-weighted conviction voting engine for collaborative governance. Spaces can run ranked proposals with configurable parameters — daily credit allocation, promotion thresholds, voting periods — and binary final votes. Integrates with the r*.online ecosystem via EncryptID passkey authentication.

## Data Model

### Core Entities (Prisma)

| Model | Key Fields | Relationships |
|-------|-----------|---------------|
| **User** | id, did (EncryptID DID), username, totalCredits | has many SpaceMember, Proposal, Vote, FinalVote |
| **Space** | slug, name, visibility, promotionsThreshold, votingPeriodHours, dailyCredits, maxCredits, startingCredits | has many SpaceMember, SpaceInvite |
| **SpaceMember** | userId, spaceSlug, role (ADMIN/MEMBER), credits, lastCreditUpdate | belongs to User, Space |
| **SpaceInvite** | spaceSlug, email, token, role, expiresAt, maxUses, useCount | belongs to Space |
| **Proposal** | id, title, description, spaceSlug, authorId, status, voteCount, finalYes/No/Abstain | belongs to Space, User; has many Vote, FinalVote |
| **Vote** | userId, proposalId, weight, credits, decayTime | ranking phase vote |
| **FinalVote** | userId, proposalId, vote (YES/NO/ABSTAIN) | binary phase vote |

### Proposal Status Flow

```
RANKING → (crosses threshold) → VOTING → (period expires) → PASSED / FAILED
                                                           → ARCHIVED (manual)
```

## Permission Model

### Space Integration

- **SpaceVisibility:** All four levels supported (public, public_read, authenticated, members_only)
- **Default role for open spaces:** PARTICIPANT (can view proposals and vote)

### Capabilities

| Capability | Required SpaceRole | AuthLevel | Description |
|-----------|-------------------|-----------|-------------|
| `view_proposals` | VIEWER | BASIC | See proposal list and details |
| `create_proposal` | PARTICIPANT | STANDARD | Submit new proposals |
| `cast_vote` | PARTICIPANT | STANDARD | Vote on ranking and final phases |
| `moderate_proposals` | MODERATOR | STANDARD | Edit/archive others' proposals |
| `configure_voting` | ADMIN | ELEVATED | Change space voting parameters |

### Module-Specific Overrides

Currently uses `SpaceRole { ADMIN, MEMBER }` in Prisma. Migration path:
- `MEMBER` → `PARTICIPANT`
- Add `VIEWER` and `MODERATOR` to the Prisma enum
- Replace `requireSpaceMembership()` / `requireSpaceAdmin()` with `hasCapability()` from SDK

### Current Auth Implementation

- NextAuth 5 (beta) + EncryptID session
- `requireSpaceMembership(slug, session)` checks SpaceMember table
- `requireSpaceAdmin(slug, session)` checks SpaceMember.role === ADMIN

## API Endpoints

| Method | Path | Auth Required | Capability | Description |
|--------|------|---------------|------------|-------------|
| GET | /api/spaces | No | — | List public spaces |
| POST | /api/spaces | Yes | — | Create a new space |
| GET | /api/spaces/[slug] | Depends | view_proposals | Get space info |
| PUT | /api/spaces/[slug] | Yes | configure_voting | Update space settings |
| GET | /api/spaces/[slug]/members | Yes | view_proposals | List space members |
| POST | /api/spaces/[slug]/members | Yes | configure_voting | Add member |
| GET | /api/proposals | Depends | view_proposals | List proposals in space |
| POST | /api/proposals | Yes | create_proposal | Create proposal |
| POST | /api/proposals/[id]/vote | Yes | cast_vote | Submit ranking vote |
| POST | /api/proposals/[id]/final-vote | Yes | cast_vote | Submit final vote |
| GET/POST | /api/spaces/[slug]/invites | Yes | configure_voting | Manage invites |

## Canvas Integration

rVote can embed as a `demo-poll` shape in the rSpace canvas:
- Shape type: `demo-poll`
- Displays question + vote counts inline on canvas
- Click to expand into full voting interface
- Real-time vote count sync via Automerge

## Cross-Module Dependencies

| Module | Integration |
|--------|------------|
| **rSpace** | Embedded poll shapes on canvas |
| **rFunds** | Proposals can trigger funding flows when passed |
| **rNetwork** | Voter graph visualization |
| **canvas-website** | Tldraw integration via shape system |

## Local-First / Offline Support

- Currently server-authoritative (Prisma/PostgreSQL)
- No offline vote caching
- Future: CRDT proposal state for offline draft proposals, sync on reconnect

## Migration Plan

1. Add `VIEWER` and `MODERATOR` to Prisma `SpaceRole` enum (migration)
2. Rename existing `MEMBER` data to `PARTICIPANT` (data migration)
3. Import `SpaceRole` from `@encryptid/sdk` types for client-side use
4. Replace `requireSpaceMembership()` with `hasCapability(role, cap, RVOTE_PERMISSIONS)`
5. Replace `requireSpaceAdmin()` with `hasCapability(role, 'configure_voting', RVOTE_PERMISSIONS)`
6. Add `resolveSpaceRole()` call in API route middleware
