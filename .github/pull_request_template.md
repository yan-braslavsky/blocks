# Pull Request

## Summary
Explain the change in 2-3 sentences: scope, intent, and user/system impact.

## Constitutional Principles Alignment
<!-- REQUIRED: Reference principles from /memory/constitution.md -->

**Primary Principle**: 
**Secondary Principles** (if applicable):

**Justification**:
> Brief explanation of how this change aligns with the selected principles.

## Changes
- [ ] Code implementation
- [ ] Tests (unit/integration/contract)
- [ ] Documentation/Spec update
- [ ] Observability (logs/metrics)
- [ ] Security/IAM
- [ ] Performance optimization
- [ ] Accessibility improvement

### Technical Details
- **Key Components**: 
- **Breaking Changes**: Yes/No + migration plan if applicable
- **Dependencies**: Any new/updated dependencies
- **Feature Flags**: Configuration changes required

## Testing & Validation
Describe validation approach (include commands, evidence, screenshots for UI):

```bash
# Example validation commands
npm run test
npm run typecheck
npm run lint
```

**Mobile Testing** (if UI changes):
- [ ] Tested on mobile viewport (≤420px)
- [ ] Touch targets ≥44px
- [ ] No horizontal scroll

**Accessibility** (if UI changes):
- [ ] WCAG 2.1 AA contrast maintained
- [ ] ARIA labels present
- [ ] Keyboard navigation working

## Risk Assessment
- **Risk Level**: Low/Medium/High
- **Rollback Plan**: 
- **Performance Impact**: 
- **Data Migration**: None/Required (details)

## Follow-up Tasks
List any deferred work or spawned tickets:
- 

## Checklist
- [ ] Constitutional principle(s) referenced and justified
- [ ] Tests added/updated for new functionality
- [ ] No credentials or secrets committed
- [ ] Performance budgets respected (or exception documented)
- [ ] Documentation updated for user-facing changes
- [ ] Mobile-first approach maintained (if UI)
- [ ] Accessibility requirements met (if UI)
