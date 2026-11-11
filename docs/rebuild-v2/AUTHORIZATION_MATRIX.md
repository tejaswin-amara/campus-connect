# Authorization Matrix

This is the baseline policy; J01 validates actual college policy. Default is deny.

| Capability | Visitor | Student | Org member | Org admin | Event operator | College admin |
|---|---:|---:|---:|---:|---:|---:|
| Browse public events | Yes | Yes | Yes | Yes | Yes | Yes |
| View private event | No | Eligibility only | If org scope | If org scope | If assigned | Yes |
| Register/cancel self | No | Yes | Yes | Yes | Yes | Policy |
| Create event draft | No | No | If granted | Yes | No | Yes |
| Edit organization event | No | No | If granted | Yes | Assigned fields only | Yes |
| Approve event | No | No | No | No by default | No | Yes |
| View roster | No | Own registration | If granted | Own org events | Assigned event | Justified admin |
| Check in attendee | No | No | No by default | If assigned | Assigned event | Yes |
| Manage org membership | No | No | No | Own org | No | Yes |
| Manage ingestion sources | No | No | No | No | No | Yes |
| View audit | No | Own limited history | Own org scoped | Own org scoped | Assigned event scoped | Yes |

## Rules
- Permission is evaluated on every request and resource.
- Organization roles do not imply college administrator.
- Event operator permission is event-specific, revocable and time-bounded where appropriate.
- A user cannot approve their own event by default; explicit policy exceptions require an ADR and audit.
- Search, export, file, calendar, job and cache paths enforce the same policy.
- UI hiding is not authorization.
- Negative tests must attempt direct object access and mass assignment.
