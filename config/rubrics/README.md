# Assignment Rubrics

Place plain text files here to customize the quality criteria the LLM uses when analyzing each assignment.

**Filename**: Use the assignment key from the CSV (e.g., `s1-five-whys.txt`).

**Content**: A brief description of what "quality" means for this assignment. The LLM uses this to rate submissions on a 1-5 scale.

## Example

File: `s1-five-whys.txt`
```
Quality criteria: The student identified a specific root cause (not surface-level), showed the full chain of 5 whys reasoning, and the final why points to something actionable and within their control. High quality responses show genuine self-reflection rather than generic answers.
```

## Defaults

If no rubric file exists for an assignment, the analyzer uses a default based on the assignment type (reflection, quiz, or assignment). See `submission-analyzer.js` for the defaults.
