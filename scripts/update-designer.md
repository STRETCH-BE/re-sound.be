# Updating the ceiling designer

The designer is a single self-contained HTML app embedded (base64) in
`src/lib/portal/designer-html.ts` and served only to signed-in portal users
via `/api/portal/designer` (it contains the Stretch price matrix — never put
it in `/public`).

To ship a new version of the tool:

```bash
node -e "
const fs = require('fs');
const b64 = fs.readFileSync('abc-floorplan.html').toString('base64');
const chunks = b64.match(/.{1,4000}/g).map(c => '  ' + JSON.stringify(c)).join(' +\n');
fs.writeFileSync('src/lib/portal/designer-html.ts',
  '// CLIENT PORTAL — ceiling designer app (base64, auth-gated).\n' +
  'export const DESIGNER_HTML_B64 =\n' + chunks + ';\n');
"
```

Then commit and deploy. No other file changes needed.
