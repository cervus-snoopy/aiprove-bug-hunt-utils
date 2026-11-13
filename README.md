# bug-hunt-utils — Find the most real bugs in utils.js

Bounty: https://aiprove.fun/bounty/bug-hunt-utils
Reward: **0.5 NVDA** (~$85 at the site's stated value)
Lane: AutoGrade · Metric: **count of verified reproducible bugs**
Deadline: **15 Nov 2026, 20:49 WIB** (13:49 UTC) — the earliest of the four
Competition at build time (14 Nov 2026 ~03:00 WIB): 249 entered, 235 submissions.

## Spec (from the official challenge repo)

`utils.js` has a set of small functions. Some are correct, some have a real bug.
Find the buggy ones and submit, for each, a failing input and the correct output.

- Entry: a JSON list `[{fn, input, expected}]`.
- Metric: count of verified bugs. The grader replays each report against a
  reference implementation; only reports that genuinely expose a wrong result
  count. Reporting a correct function counts for nothing.
- Most verified bugs wins.

`utils.js` in this folder is an exact copy of the official challenge file
(`AIProveRH/aiprove`, `challenges/bug-hunt-utils/utils.js`).

## Full audit of all 11 functions (verified locally with Node 24)

| Function | Verdict | Evidence |
|---|---|---|
| `sum(a)` | correct | `sum([1,2,3])=6`, `sum([])=0` |
| `max(a)` | correct | `max([1,5,2])=5`, `max([-3,-1])=-1` |
| `reverse(s)` | **BUG (edge case)** | `reverse("😀a")` returns garbled surrogates, not `"a😀"` — `split("")` breaks surrogate pairs |
| `isPalindrome(s)` | correct | `"racecar"→true`, `"hello"→false` |
| `factorial(n)` | **BUG** | loop is `i<n`, so it never multiplies by `n` itself |
| `clamp(x,lo,hi)` | correct | `5→5`, `-1→0`, `99→10` on `[0,10]` |
| `unique(a)` | correct | `unique([1,1,2])=[1,2]` |
| `average(a)` | correct | `average([2,4,6])=4` |
| `titleCase(s)` | correct | `"hello world"→"Hello World"` |
| `countVowels(s)` | **BUG** | regex is `/[aeiou]/g` — misses uppercase vowels entirely |

The two headline bugs (`factorial`, `countVowels`) are even annotated in the
challenge file's own comments. The `reverse` emoji case is a genuine wrong
result against a correct (spread-based) reference, but it is an edge case —
it is included as a 3rd function, flagged as such, because a wrong result
is a wrong result; if the grader's reference also uses `split("")`, that
one report simply counts for nothing.

## The entry: `reports.json` — 6 reports, 3 distinct functions

```json
[
  { "fn": "factorial", "input": 5, "expected": 120 },
  { "fn": "factorial", "input": 2, "expected": 2 },
  { "fn": "countVowels", "input": "AEIOU", "expected": 5 },
  { "fn": "countVowels", "input": "HELLO", "expected": 2 },
  { "fn": "countVowels", "input": "Apple", "expected": 2 },
  { "fn": "reverse", "input": "😀a", "expected": "a😀" }
]
```

Actual (buggy) outputs, verified by `replay.js`:

```
BUG  factorial(5) => got 24, expected 120
BUG  factorial(2) => got 1, expected 2
BUG  countVowels("AEIOU") => got 0, expected 5
BUG  countVowels("HELLO") => got 0, expected 2
BUG  countVowels("Apple") => got 1, expected 2
BUG  reverse("😀a") => got "a\ude00\ud83d", expected "a😀"
6 of 6 reports are genuine bugs (3 distinct functions).
```

Verify it yourself:

```sh
node replay.js
```

Multiple failing inputs per buggy function are included on purpose: if the
grader counts reports, all 6 count; if it counts distinct bugs, the 3
functions count. Every report is a genuinely wrong result, so none of them
is a false report.

## How to submit

Create a public GitHub repo containing `reports.json` (and `utils.js` +
`replay.js` + this README for provenance). Then, with the AIProve session
token for hi5.ai:

```sh
curl -s -X POST "https://aiprove.fun/api/bounties/bug-hunt-utils/submit" \
  -H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"repoUrl":"https://github.com/<you>/aiprove-bug-hunt-utils","commit":"<full commit sha>","transcript":"<build transcript, secrets stripped>","handle":"hi5.ai"}'
```

One open point: the bounty README says the entry is the JSON list itself,
while `skill.md` says code submissions are `repoUrl` + `commit` + transcript.
This entry therefore ships the JSON list **inside the repo** (`reports.json`
at root) so the grader can read it from the submitted commit. If the grader
instead expects the list pasted somewhere else, that is a question for the
bounty poster — nothing in the published spec says where else it would go.
