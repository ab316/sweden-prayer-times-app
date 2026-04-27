# Architecture Decision Records

Lightweight ADRs for non-obvious technical decisions. The agent (or a human) writes one whenever a change:

- introduces a new dependency that affects more than one feature,
- adds a top-level folder not listed in [`../ARCHITECTURE.md`](../ARCHITECTURE.md#folder-structure),
- deviates from any rule in `ARCHITECTURE.md` or `INTEGRATIONS.md`,
- picks one of the items from [the *TBD pending need* glossary](../ARCHITECTURE.md#glossary-of-tbd-pending-need),
- introduces an integration with auth/secrets,
- or otherwise locks in a choice that future contributors will need to understand without re-deriving.

## How to file one

1. Copy [`0001-template.md`](./0001-template.md) to `NNNN-short-slug.md` where `NNNN` is the next sequential number.
2. Fill it in. Keep it short — one screenful is plenty.
3. Commit it in the same PR as the change it justifies.
4. Once accepted and merged, ADRs are **immutable**. To revise a decision, write a new ADR that supersedes the old one and update the old ADR's status to `Superseded by NNNN`.

Status values: `Proposed`, `Accepted`, `Rejected`, `Superseded by NNNN`, `Deprecated`.
