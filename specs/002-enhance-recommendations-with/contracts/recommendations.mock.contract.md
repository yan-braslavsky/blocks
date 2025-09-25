# Contract: GET /api/mock/recommendations

Purpose: Provide mock recommendation stubs for evaluation mode.

## Request
- Method: GET
- Auth: None (or same guard as evaluation gating) [NEEDS CLARIFICATION: exposure rules]

## Response (200)
```json
{
  "recommendations": [
    {
      "id": "rightsizing-ec2",
      "title": "Rightsize EC2 Instances",
      "shortDescription": "Identify over-provisioned instances",
      "impactLevel": "High",
      "status": "Prototype",
      "category": "cost",
      "displayOrder": 1,
      "rationalePreview": "Large instance family with <20% avg utilization"
    }
  ]
}
```

## Error Cases
- 500: Should not occur (in-memory); if thrown, respond with fallback list of zero-length array and log internally.

## Notes
- All data mock; no persistence.
- Deterministic list ordering after de-dup.
