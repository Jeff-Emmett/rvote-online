---
id: TASK-6
title: Add SpaceRole bridge for cross-module membership sync
status: Done
assignee: []
created_date: '2026-02-17 22:34'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Bridge NextAuth session + EncryptID SDK SpaceRole system. Resolves user's effective SpaceRole by checking local rVote membership first, then falling back to EncryptID server. Includes 5-minute cache and hasCapability helper.
<!-- SECTION:DESCRIPTION:END -->
