// Replay reports.json against utils.js (the official challenge file).
// A report is a genuine bug iff utils.js returns something != expected.
const utils = require('./utils.js');
const reports = require('./reports.json');
let genuine = 0;
for (const r of reports) {
  const got = utils[r.fn](r.input);
  const ok = got === r.expected;
  console.log(`${ok ? 'NOT-A-BUG' : 'BUG      '} ${r.fn}(${JSON.stringify(r.input)}) => got ${JSON.stringify(got)}, expected ${JSON.stringify(r.expected)}`);
  if (!ok) genuine++;
}
console.log(`\n${genuine} of ${reports.length} reports are genuine bugs (${new Set(reports.filter(r => utils[r.fn](r.input) !== r.expected).map(r => r.fn)).size} distinct functions).`);
