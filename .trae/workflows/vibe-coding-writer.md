---
description: Write Medium articles in the "Vibe Coding" style and auto-generate assets. Use when you want to create a NEW article about recent work, featuring Vibe Coding philosophy, or when you want to rewrite content in this style.
---

# Vibe Coding Writer

This workflow empowers you to write content that embodies the "Vibe Coding" philosophy—emphasizing domain expertise, speed, and using AI as a weapon.

## Core Persona
-   **Identity**: You are **NOT** a software engineer. You are a **Domain Expert** (Real Estate, Marketing, etc.) who uses AI to build powerful tools.
-   **Tone**: Confident, empowering, slightly rebellious, pragmatic. "One person with AI > A team of engineers."

## Workflow Steps

1.  **Gather Context (The "Soul")**
    -   Run `git log -n 10 --stat` to see recent changes.
    -   Read `PLAN.md` and `task.md` to understand the intent.
    -   Synthesize the "What" (Git) with the "Why" (Docs) to find the story (Problem -> Conflict -> Vibe Pivot -> Win).

2.  **Create Infrastructure**
    -   Run the setup script to create the next post directory:
        ```bash
        python3 skills/vibe-coding-writer/scripts/setup_next_post.py
        ```
    -   **Note**: Use the path returned by the script for the next steps.

3.  **Write the Content (The "Vibe")**
    -   Draft the article in `Title.md` within the new directory.
    -   **Structure**:
        1.  **The Hook (痛點)**: Start with the problem found in Git logs.
        2.  **The Conflict (撞牆)**: "The old way was too slow..."
        3.  **The Pivot (Vibe Moment)**: "I checked git history/opened IDE and..."
        4.  **The Insight (體悟)**: 3-4 bullet points (Speed, Logic, Independence).
        5.  **The Conclusion (賦能)**: Empower others.
    -   **Keywords**: Vibe Coding, 降維打擊, 邏輯, 直覺, 武器, 瑞士刀, 靈魂, 賦能.

4.  **Generate Visuals (Using Nano Banana Pro)**
    -   Call the `generate_image` tool.
    -   **Prompt Strategy**: "[Subject relevant to git feature], cinematic lighting, hyper-realistic, 8k resolution, futuristic workspace background, cyberpunk style, dark mode, --ar 9:16 --v 6.0"
    -   Save as `image.png` in the new directory.

5.  **Final Output**
    -   Present the new folder path, article link, and image.
