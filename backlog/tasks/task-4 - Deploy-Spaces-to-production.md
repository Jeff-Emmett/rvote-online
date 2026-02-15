---
id: task-4
title: Deploy Spaces to production
status: Done
assignee: []
created_date: '2026-02-13 04:32'
labels:
  - deployment
  - infrastructure
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Production deployment of Spaces feature: applied schema via direct SQL (Prisma CLI broken in container), ran seed migration (Legacy space + 2 users + 5 proposals), added wildcard *.rvote.online CNAME in Cloudflare DNS, added wildcard to Cloudflare tunnel remote config via API, configured Traefik routing.
<!-- SECTION:DESCRIPTION:END -->
