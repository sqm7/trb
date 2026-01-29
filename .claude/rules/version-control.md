---
description: ALWAYS include Date and Time when listing git commits or history.
globs: ["**/*"]
---

# Version Control Reporting

- When listing git commits, restore points, or history, **ALWAYS** include the Date and Time.
- Preferred format: `Hash | Date Time | Message` (e.g., `git log --pretty=format:'%h | %cd | %s' --date=format:'%Y-%m-%d %H:%M:%S'`)
