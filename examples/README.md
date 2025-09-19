# Diagram Examples

This folder contains ready-to-use example scripts for each supported diagram type. Paste the contents into the left "Diagram Code" panel in the app and click "Draw Code".

Files
- `class.txt` — Class diagram examples (supports `class`, `extends`, +/−/# for visibility)
- `sequence.txt` — Sequence diagram examples (sync `->`, async `-->`)
- `flow.txt` — Flow diagram examples (nodes inferred by names: start/end/decision/process)
- `usecase.txt` — Use case diagram examples (actors and use cases `( ... )`)
- `mindmap.txt` — Mind map examples (two-space indentation per level)

Tips
- Class: types/return types should be single words (e.g., `String`, `Int`, `Void`).
- Sequence: actor/object names must be single words; messages can have spaces.
- Flow: naming determines node shape; add a `: Label` after the arrow to annotate.
- Use case: define actors with `actor Name` then connect: `Actor -> (Use Case)`.
- Mind map: indent each level by two spaces (`level = indent/2`).

You can also load these files directly using the "Load from file" control in the app's control bar.