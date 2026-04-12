// ============================================================
// attackEngine.ts — Core simulation logic for all attack types
// ============================================================

export type AttackOutcome = {
  success: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'none';
  title: string;
  description: string;
  serverResponse: string;
  dbQuery?: string;
  cookieStolen?: string;
  xpEarned: number;
  visualization: AttackVisualization;
};

export type AttackVisualization = {
  steps: VisualStep[];
  exploitedNodes: string[];
};

export type VisualStep = {
  from: string;
  to: string;
  label: string;
  type: 'request' | 'response' | 'exploit' | 'data';
  delay: number;
};

// ─── XSS Engine ──────────────────────────────────────────────
export function simulateXSS(payload: string, target: 'reflected' | 'stored' | 'dom' = 'reflected'): AttackOutcome {
  const hasScript = /<script[\s\S]*?>/i.test(payload);
  const hasEvent = /on\w+\s*=/i.test(payload);
  const hasSvg = /<svg/i.test(payload);
  const hasImg = /<img/i.test(payload);
  const hasCookieSteal = /document\.cookie/i.test(payload);
  const hasFetch = /fetch\(/i.test(payload);

  const isXSS = hasScript || hasEvent || hasSvg || hasImg;

  if (!isXSS) {
    return {
      success: false,
      severity: 'none',
      title: 'Input Sanitized',
      description: 'No XSS vectors detected in payload. The application filtered your input.',
      serverResponse: `HTTP/1.1 200 OK\n\n<p>You searched for: ${escapeHtml(payload)}</p>`,
      xpEarned: 0,
      visualization: { steps: [], exploitedNodes: [] },
    };
  }

  const cookieValue = hasCookieSteal
    ? 'sessionid=eyJhbGciOiJIUzI1NiJ9.admin; csrf_token=8f3a2b1c'
    : undefined;

  const serverResponse = target === 'reflected'
    ? `HTTP/1.1 200 OK\nContent-Type: text/html\n\n<p>Search results for: ${payload}</p>`
    : `HTTP/1.1 201 Created\nContent-Type: application/json\n\n{"status":"comment_saved","id":42}`;

  return {
    success: true,
    severity: hasCookieSteal || hasFetch ? 'critical' : 'high',
    title: target === 'stored' ? '🔴 Stored XSS Executed!' : '🟡 Reflected XSS Executed!',
    description: hasCookieSteal
      ? `Session cookie exfiltrated! Token: ${cookieValue?.split(';')[0]}. The victim's session is now compromised.`
      : `Script injected and executed in the browser context. A real attacker could steal cookies, log keystrokes, or redirect users.`,
    serverResponse,
    cookieStolen: cookieValue,
    xpEarned: hasCookieSteal ? 60 : hasEvent ? 50 : 40,
    visualization: {
      exploitedNodes: ['browser', 'webapp'],
      steps: [
        { from: 'attacker', to: 'webapp', label: 'Inject payload', type: 'exploit', delay: 0 },
        { from: 'webapp', to: 'db', label: target === 'stored' ? 'Store payload' : 'Reflect payload', type: 'data', delay: 500 },
        { from: 'webapp', to: 'victim', label: 'Serve malicious page', type: 'response', delay: 1000 },
        { from: 'victim', to: 'attacker', label: hasCookieSteal ? 'Send stolen cookie' : 'Execute script', type: 'exploit', delay: 1500 },
      ],
    },
  };
}

// ─── SQL Injection Engine ──────────────────────────────────────
export async function simulateSQLi(payload: string, extra?: string): Promise<AttackOutcome> {
  // Use `payload` for username, `extra` for password
  const username = payload;
  const password = extra || '';

  // 1. Call the real API
  let apiRes;
  try {
    apiRes = await fetch('/api/labs/sqli', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
  } catch (e) {
    return {
      success: false,
      severity: 'none',
      title: 'Server Error',
      description: 'Network failed.',
      serverResponse: 'HTTP 500',
      xpEarned: 0,
      visualization: { steps: [], exploitedNodes: [] }
    }
  }

  const data = await apiRes.json();
  
  if (!apiRes.ok || !data.success) {
    return {
      success: false,
      severity: 'none',
      title: 'Login Failed',
      description: data.dbError ? 'Database Syntax Error Triggered' : 'Valid query, but no user found.',
      serverResponse: `HTTP 401 Unauthorized\n\n${JSON.stringify(data, null, 2)}`,
      dbQuery: data.executedQuery,
      xpEarned: 0,
      visualization: { steps: [], exploitedNodes: [] },
    };
  }

  // 2. Real SQLi Successful
  // Calculate severity based on what they got
  const usersReturned = Array.isArray(data.data) ? data.data.length : 0;
  const firstUserRole = usersReturned > 0 ? data.data[0].role : '';
  const isDestructive = data.executedQuery?.toUpperCase().includes('DROP') || data.executedQuery?.toUpperCase().includes('DELETE');
  const isUnion = data.executedQuery?.toUpperCase().includes('UNION');
  const isAuthBypass = usersReturned > 0 && !isUnion;

  return {
    success: true,
    severity: isDestructive ? 'critical' : isUnion ? 'high' : 'high',
    title: isDestructive ? '💣 Destructive Query Executed!' : isUnion ? '🗄️ Database Dumped via UNION!' : '🔓 Authentication Bypassed!',
    description: `REAL EXPLOIT EXECUTED! The database returned ${usersReturned} rows.`,
    serverResponse: `HTTP 200 OK\n\n${JSON.stringify(data.data, null, 2)}`,
    dbQuery: data.executedQuery,
    xpEarned: isDestructive ? 150 : isUnion ? 100 : 80,
    visualization: {
      exploitedNodes: ['webapp', 'db'],
      steps: [
        { from: 'attacker', to: 'webapp', label: `Inject: ${payload}`, type: 'exploit', delay: 0 },
        { from: 'webapp', to: 'db', label: 'Malformed query executed natively', type: 'exploit', delay: 500 },
        { from: 'db', to: 'webapp', label: `Returned ${usersReturned} rows`, type: 'data', delay: 1000 },
        { from: 'webapp', to: 'attacker', label: 'Exploit data rendered', type: 'response', delay: 1500 },
      ],
    },
  };
}

// ─── CSRF Engine ──────────────────────────────────────────────
export function simulateCSRF(payload: string): AttackOutcome {
  const hasForm = /form/i.test(payload);
  const hasImg = /<img/i.test(payload);
  const hasAmount = /amount|transfer|value/i.test(payload);
  const hasTokenBypass = /csrf_token/i.test(payload);

  if (!hasForm && !hasImg && !hasAmount && !hasTokenBypass) {
    return {
      success: false,
      severity: 'none',
      title: 'No CSRF Vector',
      description: 'No recognizable CSRF attack pattern detected.',
      serverResponse: `HTTP/1.1 403 Forbidden\n\n{"error":"CSRF token missing"}`,
      xpEarned: 0,
      visualization: { steps: [], exploitedNodes: [] },
    };
  }

  return {
    success: true,
    severity: 'high',
    title: '💸 CSRF Attack Successful!',
    description: hasAmount
      ? 'A forged fund transfer was submitted from the victim\'s session. $10,000 sent to attacker account without victim knowledge.'
      : 'Cross-site request successfully forged using victim\'s active session cookies.',
    serverResponse: `HTTP/1.1 200 OK\n\n{"status":"transfer_complete","amount":10000,"to":"ATTACKER_ACC_8812","from":"victim_acc","balance":0}`,
    xpEarned: 80,
    visualization: {
      exploitedNodes: ['webapp', 'db'],
      steps: [
        { from: 'attacker', to: 'victim', label: 'Send malicious link', type: 'exploit', delay: 0 },
        { from: 'victim', to: 'webapp', label: 'Browser auto-sends request + cookies', type: 'request', delay: 600 },
        { from: 'webapp', to: 'db', label: 'Process forged transaction', type: 'data', delay: 1200 },
        { from: 'db', to: 'attacker', label: '$10,000 transferred', type: 'response', delay: 1800 },
      ],
    },
  };
}

// ─── Broken Auth Engine ───────────────────────────────────────
export function simulateBrokenAuth(payload: string): AttackOutcome {
  const isJWT = /eyJ[A-Za-z0-9+/=]+\.eyJ[A-Za-z0-9+/=]*\./i.test(payload);
  const hasJWTNone = /alg.*none|none.*alg/i.test(payload) || (isJWT && payload.split('.').length === 3 && payload.split('.')[2] === '');
  const hasCommonPass = /password123|admin|letmein|123456|qwerty/i.test(payload);
  const hasSessionFixation = /SESSIONID|session=/i.test(payload);
  const hasCookieTamper = /role=.*admin|admin.*role/i.test(payload);

  if (!hasJWTNone && !hasCommonPass && !hasSessionFixation && !hasCookieTamper) {
    return {
      success: false,
      severity: 'none',
      title: 'Authentication Held',
      description: 'No broken auth vector detected in payload.',
      serverResponse: `HTTP/1.1 401 Unauthorized\n\n{"error":"Invalid credentials","attempts_remaining":4}`,
      xpEarned: 0,
      visualization: { steps: [], exploitedNodes: [] },
    };
  }

  if (hasJWTNone) {
    return {
      success: true,
      severity: 'critical',
      title: '🔑 JWT alg:none Bypass!',
      description: 'JWT signature verification skipped! The server accepted an unsigned token with admin privileges.',
      serverResponse: `HTTP/1.1 200 OK\n\n{"user":"admin","role":"superadmin","permissions":["read","write","delete","admin_panel"]}`,
      xpEarned: 100,
      visualization: {
        exploitedNodes: ['webapp'],
        steps: [
          { from: 'attacker', to: 'webapp', label: 'Send JWT with alg:none', type: 'exploit', delay: 0 },
          { from: 'webapp', to: 'webapp', label: 'Skip signature verification', type: 'exploit', delay: 500 },
          { from: 'webapp', to: 'attacker', label: 'Admin access granted', type: 'response', delay: 1000 },
        ],
      },
    };
  }

  if (hasCookieTamper) {
    return {
      success: true,
      severity: 'critical',
      title: '👑 Privilege Escalation via Cookie!',
      description: 'Role parameter in cookie was not server-side validated. Admin access granted by simply modifying the cookie.',
      serverResponse: `HTTP/1.1 200 OK\n\n{"redirect":"/admin/dashboard","user":"current_user","role":"superadmin"}`,
      xpEarned: 90,
      visualization: {
        exploitedNodes: ['webapp', 'db'],
        steps: [
          { from: 'attacker', to: 'webapp', label: 'Send tampered cookie', type: 'exploit', delay: 0 },
          { from: 'webapp', to: 'db', label: 'Role check on client data', type: 'data', delay: 500 },
          { from: 'webapp', to: 'attacker', label: 'Admin dashboard unlocked', type: 'response', delay: 1000 },
        ],
      },
    };
  }

  return {
    success: true,
    severity: 'high',
    title: '🔓 Weak Credentials Accepted!',
    description: 'Common password found in the credential database. Account compromised via brute-force/credential stuffing.',
    serverResponse: `HTTP/1.1 200 OK\nSet-Cookie: session=ADMIN_TOKEN_4A8F\n\n{"user":"admin","last_login":"2024-01-15","role":"admin"}`,
    xpEarned: 40,
    visualization: {
      exploitedNodes: ['webapp', 'db'],
      steps: [
        { from: 'attacker', to: 'webapp', label: 'Submit common password', type: 'request', delay: 0 },
        { from: 'webapp', to: 'db', label: 'Check credentials', type: 'data', delay: 500 },
        { from: 'db', to: 'webapp', label: 'Match found', type: 'response', delay: 1000 },
        { from: 'webapp', to: 'attacker', label: 'Session established', type: 'response', delay: 1500 },
      ],
    },
  };
}

// ─── File Upload Engine ───────────────────────────────────────
export async function simulateFileUpload(payload: string, filename: string): Promise<AttackOutcome> {
  let apiRes;
  try {
    const formData = new FormData();
    // we bypass actual File constructor in the browser for simulation by making a Fake string blob
    formData.append('file', new Blob([payload], { type: 'text/plain' }), filename);

    apiRes = await fetch('/api/labs/upload', {
      method: 'POST',
      body: formData
    });
  } catch (e) {
    return {
      success: false, severity: 'none', title: 'Network Error', description: 'Fetch failed.', serverResponse: '500 Error', xpEarned: 0, visualization: { steps: [], exploitedNodes: [] }
    };
  }

  const data = await apiRes.json();

  if (!apiRes.ok || !data.success) {
    return {
      success: false,
      severity: 'none',
      title: 'File Upload Rejected',
      description: data.message,
      serverResponse: data.serverResponse || `HTTP 400\n\n${JSON.stringify(data)}`,
      xpEarned: 0,
      visualization: { steps: [], exploitedNodes: [] },
    };
  }

  const hasMagicBytes = data.detail.includes('MIME');
  const isDoubleExt = data.detail.includes('Double');
  
  return {
    success: true,
    severity: 'critical',
    title: '💀 Webshell Uploaded & Executing!',
    description: data.detail,
    serverResponse: `HTTP/1.1 200 OK\n\n${JSON.stringify({ file: data.file, url: data.url, output: data.output }, null, 2)}`,
    xpEarned: 120,
    visualization: {
      exploitedNodes: ['webapp', 'db'],
      steps: [
        { from: 'attacker', to: 'webapp', label: 'Upload disguised PHP file', type: 'exploit', delay: 0 },
        { from: 'webapp', to: 'webapp', label: 'Extension/MIME check bypassed', type: 'exploit', delay: 600 },
        { from: 'attacker', to: 'webapp', label: 'Request /uploads/shell.php?cmd=id', type: 'request', delay: 1200 },
        { from: 'webapp', to: 'attacker', label: 'Server executes & returns output', type: 'response', delay: 1800 },
      ],
    },
  };
}

// ─── SSRF Engine ──────────────────────────────────────────────
export function simulateSSRF(url: string): AttackOutcome {
  const isLocalhost = /127\.0\.0\.1|localhost|\[::1\]|0\.0\.0\.0/i.test(url);
  const isAWS = /169\.254\.169\.254/i.test(url);
  const isInternalNetwork = /192\.168\.|10\.\d+\.\d+\.|172\.(1[6-9]|2[0-9]|3[01])\./i.test(url);

  if (!isLocalhost && !isAWS && !isInternalNetwork) {
    return {
      success: false,
      severity: 'none',
      title: 'URL Blocked',
      description: 'The server fetched the URL but it doesn\'t expose internal services.',
      serverResponse: `HTTP/1.1 400 Bad Request\n\n{"error":"Cannot connect to external URL"}`,
      xpEarned: 0,
      visualization: { steps: [], exploitedNodes: [] },
    };
  }

  if (isAWS) {
    return {
      success: true,
      severity: 'critical',
      title: '☁️ AWS Credentials Stolen via SSRF!',
      description: 'Accessed the AWS EC2 metadata service and retrieved IAM role credentials! Full AWS account compromised.',
      serverResponse: `HTTP/1.1 200 OK\n\n{\n  "Code": "Success",\n  "AccessKeyId": "ASIA4EXAMPLE23KEY",\n  "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",\n  "Token": "AQoXnyc4lcK4w...",\n  "Expiration": "2024-12-31T23:59:59Z"\n}`,
      xpEarned: 120,
      visualization: {
        exploitedNodes: ['webapp', 'db'],
        steps: [
          { from: 'attacker', to: 'webapp', label: 'Submit AWS metadata URL', type: 'exploit', delay: 0 },
          { from: 'webapp', to: 'db', label: 'Server fetches 169.254.169.254', type: 'request', delay: 600 },
          { from: 'db', to: 'webapp', label: 'IAM credentials returned', type: 'data', delay: 1200 },
          { from: 'webapp', to: 'attacker', label: 'Credentials exposed', type: 'response', delay: 1800 },
        ],
      },
    };
  }

  return {
    success: true,
    severity: 'high',
    title: '🏠 Internal Service Accessed!',
    description: isInternalNetwork
      ? 'Pivoted into the internal network. Internal service at 192.168.x.x accessed through server as proxy.'
      : 'Accessed the internal admin panel at localhost. Sensitive admin interface exposed!',
    serverResponse: isLocalhost
      ? `HTTP/1.1 200 OK\n\n<html><title>Admin Panel</title><body><h1>Internal Admin Dashboard</h1><p>Users: 1,247 | DB Size: 4.2GB</p></body></html>`
      : `HTTP/1.1 200 OK\n\n{"service":"internal-api","version":"1.0","endpoints":["/admin","/users","/secrets"]}`,
    xpEarned: 80,
    visualization: {
      exploitedNodes: ['webapp'],
      steps: [
        { from: 'attacker', to: 'webapp', label: 'Submit internal URL', type: 'exploit', delay: 0 },
        { from: 'webapp', to: 'db', label: 'Fetch internal resource', type: 'request', delay: 600 },
        { from: 'db', to: 'attacker', label: 'Internal content leaked', type: 'response', delay: 1200 },
      ],
    },
  };
}

// ─── Command Injection Engine ─────────────────────────────────
export function simulateCommandInjection(payload: string): AttackOutcome {
  const hasSemicolon = /;\s*\w+/i.test(payload);
  const hasPipe = /\|\s*\w+/i.test(payload);
  const hasAnd = /&&\s*\w+/i.test(payload);
  const hasBacktick = /`[^`]+`/.test(payload);
  const hasRevShell = /bash\s+-i|\/dev\/tcp|nc\s+-e|python.*socket/i.test(payload);
  const hasCatPasswd = /cat\s+\/etc\/passwd/i.test(payload);
  const hasWhoami = /whoami|id\b/i.test(payload);

  if (!hasSemicolon && !hasPipe && !hasAnd && !hasBacktick) {
    return {
      success: false,
      severity: 'none',
      title: 'Command Contained',
      description: 'Input was sanitized. No command injection vectors detected.',
      serverResponse: `PING 127.0.0.1 (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.050 ms`,
      xpEarned: 0,
      visualization: { steps: [], exploitedNodes: [] },
    };
  }

  if (hasRevShell) {
    return {
      success: true,
      severity: 'critical',
      title: '🐚 Reverse Shell Established!',
      description: 'Attacker now has interactive shell access to the server. Full system compromised.',
      serverResponse: `PING 127.0.0.1\n[+] Connecting to attacker.com:4444...\n[+] Bash reverse shell spawned\nroot@server:~# `,
      xpEarned: 150,
      visualization: {
        exploitedNodes: ['webapp', 'db'],
        steps: [
          { from: 'attacker', to: 'webapp', label: 'Inject reverse shell cmd', type: 'exploit', delay: 0 },
          { from: 'webapp', to: 'webapp', label: 'Shell spawns on server', type: 'exploit', delay: 600 },
          { from: 'webapp', to: 'attacker', label: 'Interactive shell connection', type: 'response', delay: 1200 },
        ],
      },
    };
  }

  if (hasCatPasswd) {
    return {
      success: true,
      severity: 'critical',
      title: '📂 /etc/passwd Dumped!',
      description: 'System password file read via command injection. User accounts and home directories exposed.',
      serverResponse: `PING output:\nroot:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nadmin:x:1000:1000:,,,:/home/admin:/bin/bash`,
      xpEarned: 80,
      visualization: {
        exploitedNodes: ['webapp'],
        steps: [
          { from: 'attacker', to: 'webapp', label: 'Inject | cat /etc/passwd', type: 'exploit', delay: 0 },
          { from: 'webapp', to: 'webapp', label: 'Shell executes piped cmd', type: 'exploit', delay: 500 },
          { from: 'webapp', to: 'attacker', label: 'File contents returned', type: 'response', delay: 1000 },
        ],
      },
    };
  }

  return {
    success: true,
    severity: 'high',
    title: '⚡ Command Injection Confirmed!',
    description: hasWhoami
      ? 'Command injection successful. Server is running as www-data. Can now enumerate system and escalate.'
      : 'OS command injected and executed successfully on the server.',
    serverResponse: hasWhoami
      ? `PING output:\nwww-data`
      : `PING output:\n${payload.split(/[;|&]/)[0].trim()}\n[INJECTED OUTPUT]: Command executed successfully`,
    xpEarned: 60,
    visualization: {
      exploitedNodes: ['webapp'],
      steps: [
        { from: 'attacker', to: 'webapp', label: 'Inject OS command', type: 'exploit', delay: 0 },
        { from: 'webapp', to: 'webapp', label: 'Shell executes injection', type: 'exploit', delay: 500 },
        { from: 'webapp', to: 'attacker', label: 'Command output returned', type: 'response', delay: 1000 },
      ],
    },
  };
}

// ─── IDOR Engine ──────────────────────────────────────────────
export function simulateIDOR(endpoint: string, currentUserId: number = 5): AttackOutcome {
  const idMatch = endpoint.match(/\/(\d+)/);
  const targetId = idMatch ? parseInt(idMatch[1]) : null;
  const isFile = /file|doc|report|pdf/i.test(endpoint);
  const isOrder = /order/i.test(endpoint);

  if (!targetId || targetId === currentUserId) {
    return {
      success: false,
      severity: 'none',
      title: 'No IDOR Vulnerability',
      description: 'Accessing your own data — no unauthorized access.',
      serverResponse: `HTTP/1.1 200 OK\n\n{"user_id":5,"name":"Current User","email":"user@example.com"}`,
      xpEarned: 0,
      visualization: { steps: [], exploitedNodes: [] },
    };
  }

  const isAdminAccess = targetId === 1;

  if (isFile) {
    return {
      success: true,
      severity: 'high',
      title: '📄 Unauthorized File Access!',
      description: 'Accessed a private file belonging to another user. No authorization check was performed on the object reference.',
      serverResponse: `HTTP/1.1 200 OK\nContent-Type: application/pdf\n\n[CONFIDENTIAL DOCUMENT]\nAdmin Security Report Q4 2024\nVulnerabilities: 47 critical\nAPI Keys: sk-prod-XXXXX\nDB Password: Pr0d-DB-S3cr3t!`,
      xpEarned: 80,
      visualization: {
        exploitedNodes: ['webapp', 'db'],
        steps: [
          { from: 'attacker', to: 'webapp', label: `Access ${endpoint}`, type: 'exploit', delay: 0 },
          { from: 'webapp', to: 'db', label: 'Fetch file by ID (no auth check)', type: 'data', delay: 500 },
          { from: 'db', to: 'attacker', label: 'Private file returned', type: 'response', delay: 1000 },
        ],
      },
    };
  }

  return {
    success: true,
    severity: isAdminAccess ? 'critical' : 'high',
    title: isAdminAccess ? '👑 Admin Data Accessed!' : '👤 Unauthorized User Access!',
    description: `Direct object reference to user ID ${targetId} succeeded without authorization. ${isAdminAccess ? 'Full admin profile exposed!' : "Another user's private data exposed."}`,
    serverResponse: isAdminAccess
      ? `HTTP/1.1 200 OK\n\n{"user_id":1,"username":"admin","email":"admin@company.com","role":"superadmin","api_key":"sk-admin-X9mK2p","password_hash":"$2b$10$...","2fa_backup":"823-491-027"}`
      : `HTTP/1.1 200 OK\n\n{"user_id":${targetId},"username":"user${targetId}","email":"user${targetId}@example.com","private_notes":"Bank account: 1234-5678","address":"123 Private St"}`,
    xpEarned: isAdminAccess ? 80 : 60,
    visualization: {
      exploitedNodes: ['webapp', 'db'],
      steps: [
        { from: 'attacker', to: 'webapp', label: `Modify ID to ${targetId}`, type: 'exploit', delay: 0 },
        { from: 'webapp', to: 'db', label: 'Query user by unvalidated ID', type: 'data', delay: 500 },
        { from: 'db', to: 'attacker', label: 'Private profile returned', type: 'response', delay: 1000 },
      ],
    },
  };
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
