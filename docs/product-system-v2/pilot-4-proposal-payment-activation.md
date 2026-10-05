# Pilot 4 — Proposal → Acceptance → Payment → Activation

Status: **Architecture defined — Figma visual pending**

## Why this pilot matters

This is the product hinge between free/pre-client usage and paid Student service.

It must create trust and remove ambiguity.

## Lifecycle states

1. **Campus preparing proposal**
2. **Proposal ready**
3. **Prospect requests discussion**
4. **Proposal updated**
5. **Prospect accepts**
6. **Payment pending**
7. **Payment recorded**
8. **Campus validation pending**
9. **Student access activated**
10. **Payment/activation problem**

## Prospect proposal screen

### Header
- "Votre proposition Campus Allemagne"
- route/service name;
- current status;
- date/version meaningful to the user only when useful.

### Route recommendation
Plain-language explanation:
- what Campus recommends;
- why;
- what is not guaranteed.

### Included service
Grouped, finite list.
Avoid generic marketing text.

### Price
Human display:
- e.g. TND amount;
- payment terms;
- what payment activates.

Never show raw minor-unit values.

### Actions
Primary:
- Accept proposal

Secondary:
- Ask a question / request modification

Tertiary:
- review Orientation / project facts.

## Acceptance confirmation

Before final acceptance:
- route;
- service scope;
- price;
- important conditions;
- statement that Student access is not active until payment/validation requirements are met.

No deceptive pre-checked consent.

## Payment screen

Must show:
- amount;
- payment method/provider;
- payment state;
- secure external-provider handoff when applicable;
- retry/recovery;
- receipt/reference after payment;
- who validates what next.

## Activation state

After payment is recorded:
> Payment received. Campus Allemagne is validating activation.

After validation:
> Your Student space is active.

Primary CTA becomes:
> Enter my Student space

## Admin side

The same transaction should expose:
- proposal accepted timestamp;
- purchase/payment reference;
- payment status;
- validation action;
- activation event;
- audit history.

## Acceptance criteria

- [ ] Prospect understands exactly what they are buying.
- [ ] Price is human-readable.
- [ ] Discuss vs accept is clear.
- [ ] Payment failure/retry states exist.
- [ ] Payment recorded ≠ Student active until the defined validation condition is satisfied.
- [ ] Admin validation is auditable.
- [ ] Activation transition is explicit to both sides.
