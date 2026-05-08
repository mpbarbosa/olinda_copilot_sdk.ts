# Skills

This directory contains the GitHub Copilot CLI skills available in this project.

## Evidence discipline

When a skill evaluates AI workflow logs or prompt parts against the live
repository, treat **negative existence claims** with extra care. Claims such as
"this file is missing", "that directory is undocumented", "no tests exist", or
"the repo lacks X" must be backed by repository evidence, not just by a
truncated excerpt.

- A confirmed absence claim should cite the searched repo surfaces by path, and
  where relevant name the search evidence used.
- If the available evidence is only a visible excerpt or a truncated context
  block, classify the finding as a **context limitation** using wording such as
  `insufficient context` or `not visible in provided context`.
- Do not turn excerpt-only observations into concrete repository issues.

For the full index of skills, their descriptions, and usage instructions, see
[`.github/SKILLS.md`](../SKILLS.md).
