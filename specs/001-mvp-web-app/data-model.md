# Data Model (Phase 1)

Purpose: Logical (implementation-agnostic) description of entities, attributes, constraints, and lifecycle states supporting MVP functionality.

## Conventions
- `id` fields are opaque UUID v4 unless specified.
- Timestamps ISO 8601 UTC.
- Monetary values in minor currency units (cents) to avoid FP rounding; display layer converts.
- Arrays limited to practical cardinality (documented per field).

## Entities

### Tenant
Represents a customer workspace and top-level isolation boundary.
| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | Stable identifier |
| name | string | 3-60 chars | Display label |
| createdAt | timestamp | immutable | Audit |
| billingMode | enum(`blocks-vendor`,`self`) | default `self` | Affects projection narrative |
| connectionStatus | enum(`unconfigured`,`pending`,`validated`,`error`) | required | Derived from Connection validations |
| lastIngestAt | timestamp? | optional | Used for stale logic |
| rolesEnabled | string[] | optional | Role list subset present |

### Connection
Represents AWS linkage & validation artifacts.
| Field | Type | Constraints | Notes |
| roleArn | string | arn pattern | External trust role |
| externalId | string | 8-64 chars | Provided to stack |
| scopes | string[] | subset(`data_read`,`purchase`) | At least one |
| status | enum(`pending`,`validated`,`error`) | required | Maps to UI checks |
| lastValidatedAt | timestamp? | optional | Display / gating |
| errors | array<ErrorRef> | max 20 | Most recent issues |

`ErrorRef` = { code: string, message: string, hint?: string }

### SpendAggregate
Hourly-level aggregated cost slices (post ingestion normalization).
| Field | Type | Constraints | Notes |
| tenantId | UUID | FK Tenant | Partition scope |
| hour | timestamp (truncated to hour) | unique per (tenantId, hour, service, usageType) | Granularity |
| service | string | <= 64 | Normalized AWS service name |
| usageType | string | <= 64 | From CUR |
| cost | integer | >=0 | Raw blended/amortized baseline minor units |
| amortizedCost | integer | >=0 | If available else = cost |
| tags | object | JSON size < 8KB | Filter subset only |

### SavingsProjection
| Field | Type | Notes |
| tenantId | UUID | FK |
| period | enum(`day`,`week`,`month`,`ytd`) | Partition summary range |
| baselineCost | integer | sum cost period |
| projectedCost | integer | baselineCost * 0.8 (rounded) |
| deltaPct | decimal | computed ((baseline - proj)/baseline) |
| generatedAt | timestamp | recalculation marker |

### Recommendation
| Field | Type | Constraints | Notes |
| id | UUID | PK | |
| tenantId | UUID | FK | |
| category | enum(`rightsizing`,`commitment`,`idle`) | required | |
| status | enum(`draft`,`new`,`acknowledged`,`actioned`,`archived`) | default `new` except system seeds `draft` |
| rationale | string | <= 2000 chars | Human readable explanation |
| expectedSavingsMinor | integer | >=0 | Potential monthly savings |
| metricRefs | array<string> | max 10 | Links to underlying aggregates (hour keys) |
| createdAt | timestamp | | |
| updatedAt | timestamp | | |

### CommitmentState
| Field | Type | Notes |
| tenantId | UUID | FK |
| id | UUID | PK |
| state | enum(`analyzing`,`pending-approval`,`purchased`,`monitoring`) | lifecycle |
| recommendationId | UUID? | optional | Link if derived from rec |
| commitmentValueHourly | integer | optional | Proposed hourly commitment minor units |
| termMonths | integer | one of 12/36 | |
| coveragePct | decimal | 0..1 | Observed coverage |
| utilizationPct | decimal | 0..1 | Observed utilization |
| createdAt | timestamp | |
| updatedAt | timestamp | |

### AssistantInteraction
| Field | Type | Notes |
| id | UUID | PK |
| tenantId | UUID | FK |
| prompt | string | original user query |
| response | string | raw textual output |
| references | array<string> | e.g., [`agg:2025-09-19T10`,`rec:123`] |
| firstTokenLatencyMs | integer | performance metric |
| createdAt | timestamp | |

### AuditEvent
| Field | Type | Notes |
| tenantId | UUID | FK |
| id | UUID | PK |
| eventType | enum(`rec-status-change`,`commit-state-change`,`connection-validate`,`ingest-run`) | |
| actor | string | user or system identifier |
| before | object? | previous state snapshot |
| after | object? | new state snapshot |
| occurredAt | timestamp | |

### ExportArtifact
| Field | Type | Notes |
| id | UUID | PK |
| tenantId | UUID | FK |
| type | enum(`spend-summary`) | initial type |
| filters | object | serialized filter params |
| generatedAt | timestamp | |
| storageRef | string | pointer to stored CSV asset |

## Relationships
- Tenant 1—* Connection (currently max 1 active, future multi)  
- Tenant 1—* Recommendation  
- Tenant 1—* SpendAggregate  
- Tenant 1—* AssistantInteraction  
- Tenant 1—* CommitmentState  
- Tenant 1—* AuditEvent  
- Tenant 1—* ExportArtifact  
- Recommendation 1—* AuditEvent (via eventType filtering)  
- CommitmentState 1—* AuditEvent  

## State Transitions
### Recommendation.status
`draft -> new -> acknowledged -> actioned -> archived`
Rules:
- Only system can create `draft`.
- `archived` terminal; cannot revert.
- Transition to `actioned` requires presence of at least one metricRef.

### CommitmentState.state
`analyzing -> pending-approval -> purchased -> monitoring`
Rules:
- `pending-approval` requires commitmentValueHourly & termMonths.
- `purchased` requires coveragePct and utilizationPct initial snapshot.
- No backward transitions; new cycle creates new CommitmentState record.

## Validation Rules
- Name fields trimmed, disallow leading/trailing whitespace.
- Monetary integers must be >= 0.
- Percentage decimals truncated to 4 decimal places.
- `metricRefs` must match pattern `(agg|rec):[A-Za-z0-9:-]+`.
- `externalId` length 8..64, alphanumeric + hyphen.

## Derived / Computed Fields
- SavingsProjection.deltaPct dynamically recomputed upon baselineCost or projectedCost change.
- FirstTokenLatencyMs measured client → first streamed chunk arrival.

## Data Retention
- AuditEvent: 400 days.
- AssistantInteraction: 180 days (post-MVP adjustable).
- Recommendation & CommitmentState: retained indefinitely (historical decisions value).

## Open Considerations
- Potential sharding of SpendAggregate if hot partition emerges for large tenants.
- Multi-language (future) — ensure field length buffers for localization.

---
End of data-model.md
