---
id: task-1
title: Deploy rVote.online with demo and explainer pages
status: Done
assignee: []
created_date: '2026-02-05 04:58'
updated_date: '2026-02-05 11:10'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create and deploy rVote.online website with quadratic voting system for community proposal ranking
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Completed Work

### Core Application
- Next.js 16 with TypeScript and Tailwind CSS v4
- PostgreSQL database with Prisma ORM
- NextAuth v5 with credentials provider (email/password)
- shadcn/ui components for modern UI

### Quadratic Voting System
- Credit system: 10 credits/day, start with 50, max 500
- Vote cost = weight² (1=1, 2=4, 3=9 credits)
- Vote decay: starts at 30 days, fully decayed by 60 days
- Auto-promotion to pass/fail voting at score +100

### Two-Stage Voting
1. Ranking Stage: Quadratic up/down voting
2. Pass/Fail Stage: 7-day time-boxed voting, one member = one vote

### Pages Created
- Landing page with comprehensive quadratic voting explainer
- Interactive demo page at /demo (no account required)
- Proposal list, detail, and creation pages
- Voting page for pass/fail stage
- User profile with credit display
- Auth pages (signin/signup)

### Deployment
- Dockerized with multi-stage build
- docker-compose with PostgreSQL and Traefik labels
- Pushed to Gitea (gitea.jeffemmett.com)

### Pending: Deployment to rvote.online
- Deploy to Netcup RS 8000
- Configure Cloudflare tunnel

## Deployment Complete (2026-02-05)

- Site live at https://rvote.online
- Cloudflare DNS configured and propagated
- Traefik routing working
- Database tables created
- Demo page and landing page functional
- Auth pages ready for user registration
<!-- SECTION:NOTES:END -->
