# Evidence handoff for course operations

**Status: Working contract (2026-07-09).** This document defines the course-side
half of a privacy-safe evidence handoff to CTI experiments. It does not change
the Canvas publishing workflow or authorize a new kind of learner-data export.

## Purpose

Course operations can produce useful signals about how an activity or learning
environment is working. The receiving experiment needs the signal's source,
scope, and limits, not a claim that the course system has proved an outcome.

The team-side interpretation contract lives in
[cti-chief-of-staff's experiment-design evidence handoff](https://github.com/profsathya/cti-chief-of-staff/blob/main/methodology/experiment-design/evidence-handoff.md).

## What this repository may provide

Provide only the smallest, documented input needed for a named experiment
question:

- De-identified aggregate operational signals, such as completion, submission,
  participation, or tool-use patterns.
- A data dictionary: activity, period, cohort definition, denominator, missing
  data, and known changes in instrumentation or course design.
- Human-reviewed, anonymized qualitative themes only when their handling has
  been approved for the course context.

Do not place learner names, Canvas IDs, raw submissions, raw discussion text,
or small-group results in a shared CTI evidence packet.

## Before a handoff

1. Name the receiving experiment question and its owner.
2. Confirm the signal is necessary and that aggregate reporting is safe. If the
   group is too small or the result could identify a learner, report that the
   evidence is insufficient instead.
3. Record the source, period, denominator, exclusions, and any instrumentation
   changes.
4. Separate factual observations from interpretation. The course system reports
   the former; a human reviewer and experiment lead make the latter.
5. Link the packet to its approved source location rather than copying
   learner-level data into another repository.

## Handoff shape

```md
- **Experiment question:** ...
- **Course source and period:** ...
- **De-identified signals:** ...
- **Data dictionary / denominator:** ...
- **Known limits and plausible alternatives:** ...
- **Human reviewer and date:** ...
- **Receiving experiment decision date:** ...
```

The handoff is complete only after the receiving experiment lead has made or
declined a design decision. Until then it remains a working input, not a
canonical finding.

## Publishing boundary

A source-file save and a Canvas publish are different events. This evidence
handoff never publishes or changes course material, Canvas grades, or learner
records. Follow the repository's existing validation and Canvas publishing
workflow for any student-facing change.
