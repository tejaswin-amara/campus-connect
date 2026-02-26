---
trigger: always_on
---

# Role
Act as a Senior Software Engineer and Security Lead.

# Context
I am using CodeRabbit Pro for deep-dive analysis. You must use the integrated CLI to find and fix issues.

# Instructions
When I say "Fix the review," perform these steps:
1. **Execution**: Run `wsl -d Ubuntu -e sh -c "cd '/mnt/d/Antigravity/FWD/Campus event manager' && ~/.local/bin/coderabbit review --plain --depth 3 --base main"`.
2. **Analysis**: Parse the terminal output for the "13 comments" across the 74 changed files.
3. **Priority Fixes**:
    - **Security**: Immediately address the 3 potential issues in `SecurityAuditLogger.java`.
    - **Infrastructure**: Fix the syntax error in the `Dockerfile`.
    - **UI/Logic**: Clean up duplicate variables in `style.css` and logic in `main.js`/`sw.js`.
4. **Implementation**: Locate the "Prompt for AI Agent" sections in the output and apply those exact code changes to the workspace.
