// ============================================================
// terminalCommands.ts — Pre-computed terminal command outputs
// ============================================================

export interface CommandResult {
  output: string;
  type: 'success' | 'error' | 'info';
  delay?: number;
}

type CommandHandler = (args: string[]) => CommandResult;

const COMMANDS: Record<string, CommandHandler> = {
  help: () => ({
    type: 'info',
    output: `
[ZERODAY LAB TERMINAL v1.1]
─────────────────────────────────────────
Available commands:

  Recon & Enumeration:
    nmap <target>          Network scanner
    whois <domain>         WHOIS lookup
    dig <domain>           DNS lookup
    curl <url>             HTTP request

  Exploitation:
    sqlmap -u <url>        SQL injection scanner
    nikto -h <host>        Web vulnerability scanner
    hydra -l <user> <url>  Brute force tool
    msfconsole             Launch Metasploit

  System:
    whoami                 Current user
    id                     User/group IDs
    ls [-la] [path]        List files
    cat <file>             Read file
    pwd                    Current directory
    ps aux                 Running processes
    netstat -an            Network connections
    uname -a               System info
    env                    Environment variables

  Navigation:
    clear / cls            Clear terminal
    history                Command history
    help                   Show this help

Type a command to get started!
─────────────────────────────────────────`,
  }),

  about: () => ({
    type: 'info',
    output: `--- ZeroDay Lab ---
An enterprise-grade cybersecurity simulator designed for offensive and defensive training.
Version: 2.1.0 (Enterprise)
Status: Fully Sandboxed`,
  }),

  whoami: () => ({
    type: 'success',
    output: 'www-data',
  }),

  id: () => ({
    type: 'success',
    output: 'uid=33(www-data) gid=33(www-data) groups=33(www-data)',
  }),

  pwd: () => ({
    type: 'success',
    output: '/var/www/html',
  }),

  uname: (args) => ({
    type: 'success',
    output: args.includes('-a')
      ? 'Linux webserver 5.15.0-58-generic #64-Ubuntu SMP Thu Jan 5 11:43:13 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux'
      : 'Linux',
  }),

  ls: (args) => {
    const isLa = args.includes('-la') || args.includes('-l');
    if (isLa) {
      return {
        type: 'success',
        output: `total 72
drwxr-xr-x  8 www-data www-data 4096 Jan 15 09:23 .
drwxr-xr-x 14 root     root     4096 Jan 10 08:00 ..
-rw-r--r--  1 www-data www-data 8192 Jan 15 09:23 config.php
-rw-r--r--  1 www-data www-data 2048 Jan 12 14:30 db.php
drwxrwxrwx  2 www-data www-data 4096 Jan 15 10:01 uploads
drwxr-xr-x  3 www-data www-data 4096 Jan 10 08:00 includes
-rw-r--r--  1 www-data www-data 4096 Jan 15 08:00 index.php
-rw-r--r--  1 www-data www-data 1024 Jan 14 16:45 login.php
drwxr-xr-x  2 www-data www-data 4096 Jan 10 08:00 admin
-rw-------  1 root     root      512 Jan 01 00:00 .env
-rw-r--r--  1 www-data www-data 1337 Jan 15 10:15 README.txt`,
      };
    }
    return {
      type: 'success',
      output: 'config.php  db.php  uploads/  includes/  index.php  login.php  admin/  README.txt',
    };
  },

  cat: (args) => {
    const file = args[0] ?? '';
    const files: Record<string, string> = {
      'config.php': `<?php
// Database configuration - DO NOT COMMIT
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'Sup3rS3cr3tP@ss!');
define('DB_NAME', 'webapp_prod');
define('SECRET_KEY', 'f8a3c1b2e4d7a9c0b5e2f1d3a8c9b4e6');
define('ADMIN_EMAIL', 'admin@company.internal');
?>`,
      'db.php': `<?php
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
// VULNERABLE: No prepared statements!
$query = "SELECT * FROM users WHERE username='" . $_POST['user'] . "'";
$result = $conn->query($query);
?>`,
      '.env': `DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Sup3rS3cr3tP@ss!
SECRET_KEY=f8a3c1b2e4d7a9c0b5e2f1d3a8c9b4e6
AWS_ACCESS_KEY=AKIA4EXAMPLE23SECRET
AWS_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
STRIPE_SECRET=sk_live_XXXXXXXXXXXXX`,
      '/etc/passwd': `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
mysql:x:110:114:MySQL Server:/nonexistent:/bin/false
admin:x:1000:1000:System Administrator:/home/admin:/bin/bash
deploy:x:1001:1001:Deploy User:/home/deploy:/bin/bash`,
      'README.txt': `SYSTEM NOTICE: This server contains sensitive data.
Unauthorized access is prohibited and will be prosecuted.

Admin Credentials (temp): admin:TempP@ssw0rd!
DB Backup: /var/backups/db_dump_2024.sql.gz
Private Key: /home/admin/.ssh/id_rsa`,
    };
    const content = files[file];
    if (content) return { type: 'success', output: content };
    return { type: 'error', output: `cat: ${file}: No such file or directory` };
  },

  env: () => ({
    type: 'success',
    output: `PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
HOME=/var/www
USER=www-data
SHELL=/bin/sh
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Sup3rS3cr3tP@ss!
SECRET_KEY=f8a3c1b2e4d7a9c0b5e2f1d3a8c9b4e6
NODE_ENV=production
PORT=3000`,
  }),

  ps: (args) => ({
    type: 'success',
    output: args.includes('aux')
      ? `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1   2388   748 ?        Ss   Jan10   0:00 /bin/sh -c apache2
root       123  0.0  2.1 325168 21324 ?        Ss   Jan10   0:08 /usr/sbin/apache2 -k start
www-data   456  0.0  1.8 325168 18432 ?        S    Jan10   0:00 /usr/sbin/apache2 -k start
mysql      789  0.1  8.2 1837468 82896 ?       Ssl  Jan10   1:23 /usr/sbin/mysqld
root      1001  0.0  0.5  14652  5248 ?        Ss   Jan10   0:00 sshd: /usr/sbin/sshd
www-data  2048  0.0  0.4  21688  4096 ?        S    10:15   0:00 sh -c ping -c 3 127.0.0.1
www-data  2049  0.0  0.1   5972  1024 ?        S    10:15   0:00 ping -c 3 127.0.0.1`
      : 'Usage: ps [aux]',
  }),

  netstat: (args) => ({
    type: 'success',
    output: `Active Internet connections (servers and established)
Proto  Local Address      Foreign Address    State
tcp    0.0.0.0:22         0.0.0.0:*          LISTEN
tcp    0.0.0.0:80         0.0.0.0:*          LISTEN
tcp    0.0.0.0:443        0.0.0.0:*          LISTEN
tcp    127.0.0.1:3306     0.0.0.0:*          LISTEN   (MySQL)
tcp    127.0.0.1:6379     0.0.0.0:*          LISTEN   (Redis)
tcp    127.0.0.1:8080     0.0.0.0:*          LISTEN   (Admin Panel)
tcp    10.0.0.5:80        192.168.1.100:4321 ESTABLISHED`,
  }),

  nmap: (args) => {
    const target = args.find((a) => !a.startsWith('-')) ?? 'localhost';
    return {
      type: 'success',
      delay: 2000,
      output: `Starting Nmap 7.93 ( https://nmap.org ) at ${new Date().toLocaleString()}

Nmap scan report for ${target}
Host is up (0.00042s latency).

PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 8.9p1 Ubuntu
80/tcp   open  http        Apache httpd 2.4.52
443/tcp  open  https       Apache httpd 2.4.52
3306/tcp open  mysql       MySQL 8.0.31
6379/tcp open  redis       Redis key-value store
8080/tcp open  http        Node.js (Express) [INTERNAL ONLY]
8443/tcp open  https-alt   Nginx

Service detection performed. Please report any incorrect results at https://nmap.org/submit/
Nmap done: 1 IP address (1 host up) scanned in 12.34 seconds`,
    };
  },

  curl: (args) => {
    const url = args.find((a) => !a.startsWith('-')) ?? '';
    if (!url) return { type: 'error', output: 'curl: try --help for more information' };

    if (/127\.0\.0\.1|localhost/i.test(url) && /8080|admin/i.test(url)) {
      return {
        type: 'success',
        output: `HTTP/1.1 200 OK
Server: Express
Content-Type: application/json

{"admin_panel":true,"users":1247,"db_size":"4.2GB","secret_flag":"CTF{ssrf_master_2024}","endpoints":["/admin/users","/admin/logs","/admin/backup"]}`,
      };
    }
    if (/169\.254\.169\.254/i.test(url)) {
      return {
        type: 'success',
        output: `ami-id
ami-launch-index
block-device-mapping/
hostname
iam/
instance-action
instance-id=i-0abc123def456
instance-type=m5.large
local-ipv4=10.0.0.5
public-keys/
security-credentials/webserver-role
AccessKeyId: ASIA4EXAMPLE23KEY
SecretAccessKey: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`,
      };
    }
    return {
      type: 'success',
      output: `HTTP/1.1 200 OK\nContent-Type: text/html\n\n<!DOCTYPE html>\n<html>\n<body>Response from ${url}</body>\n</html>`,
    };
  },

  sqlmap: (args) => ({
    type: 'success',
    delay: 3000,
    output: `        ___
       __H__
 ___ ___[)]_____ ___ ___  {1.7.12#stable}
|_ -| . [.]     | .'| . |
|___|_  [)]_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[12:34:56] [INFO] testing connection to the target URL
[12:34:56] [INFO] testing if the target URL content is stable
[12:34:57] [INFO] target URL content is stable
[12:34:57] [INFO] testing if GET parameter 'id' is dynamic
[12:34:57] [INFO] GET parameter 'id' appears to be dynamic
[12:34:58] [WARNING] heuristic (basic) test shows that GET parameter 'id' might be injectable
[12:34:59] [INFO] testing for SQL injection on GET parameter 'id'
[12:35:01] [INFO] GET parameter 'id' appears to be 'MySQL >= 5.0.12 AND time-based blind' injectable
[12:35:04] [INFO] GET parameter 'id' is 'Generic UNION query (NULL) - 1 to 20 columns' injectable

sqlmap identified the following injection points:
Parameter: id (GET)
    Type: time-based blind
    Payload: id=1 AND SLEEP(5)--

    Type: UNION query
    Payload: id=1 UNION ALL SELECT NULL,NULL,NULL,NULL,NULL--

[12:35:10] [INFO] fetching database names
[12:35:11] [INFO] retrieved: 'information_schema'
[12:35:11] [INFO] retrieved: 'webapp_prod'
[12:35:11] [INFO] retrieved: 'webapp_logs'

available databases [3]:
[*] information_schema
[*] webapp_prod
[*] webapp_logs`,
  }),

  nikto: (args) => ({
    type: 'success',
    delay: 2500,
    output: `- Nikto v2.1.6
─────────────────────────────────────────
+ Target: ${args.find((a) => !a.startsWith('-')) ?? 'localhost'}
+ Start Time: ${new Date().toLocaleString()}
─────────────────────────────────────────
+ Server: Apache/2.4.52 (Ubuntu)
+ /config.php: PHP configuration file found
+ /uploads/: Directory indexing enabled
+ /admin/: Admin directory accessible (no auth required!)
+ OSVDB-3268: /backup/: Directory indexing found
+ Cookie session created without the httponly flag
+ OSVDB-3092: /phpmyadmin/: phpMyAdmin is for managing MySQL databases
+ OSVDB-2430: /cgi-bin/cgiwrap: cgiwrap is installed
+ X-Frame-Options header is not included (clickjacking risk)
+ X-XSS-Protection header not defined
+ X-Content-Type-Options header not set (MIME sniffing risk)
+ Apache mod_negotiation is enabled (info leak)
+ 8 vulnerabilities found in 23.4 seconds`,
  }),

  hydra: (args) => ({
    type: 'success',
    delay: 3500,
    output: `Hydra v9.4 (c) 2022 by van Hauser/THC & David Maciejak

[DATA] attacking http-post-form://localhost/login
[DATA] login: admin | password list: rockyou.txt
[ATTEMPT] target localhost - login "admin" - pass "123456"
[ATTEMPT] target localhost - login "admin" - pass "password"
[ATTEMPT] target localhost - login "admin" - pass "admin"
[ATTEMPT] target localhost - login "admin" - pass "letmein"
[ATTEMPT] target localhost - login "admin" - pass "password123"
[80][http-post-form] host: localhost   login: admin   password: password123

1 of 1 target successfully completed, 1 valid password found!

[FOUND] admin:password123`,
  }),

  whois: (args) => ({
    type: 'success',
    output: `Domain Name: ${args[0] ?? 'target.com'}
Registry Domain ID: 1234567890_DOMAIN_COM-VRSN
Registrar: GoDaddy.com, LLC
Creation Date: 2018-06-15T10:00:00Z
Updated Date: 2024-01-01T08:00:00Z
Expiry Date: 2025-06-15T10:00:00Z
Registrant Email: admin@target.com
Registrant Phone: +1.555.0100
Name Server: ns1.cloudflare.com
Name Server: ns2.cloudflare.com`,
  }),

  dig: (args) => ({
    type: 'success',
    output: `; <<>> DiG 9.18.1-1ubuntu1.2-Ubuntu <<>> ${args[0] ?? 'target.com'}
;; QUESTION SECTION:
;${args[0] ?? 'target.com'}.          IN  A

;; ANSWER SECTION:
${args[0] ?? 'target.com'}.  300  IN  A   104.21.45.67
${args[0] ?? 'target.com'}.  300  IN  A   172.67.189.34

;; SERVER: 8.8.8.8#53(8.8.8.8)
;; WHEN: ${new Date().toUTCString()}`,
  }),

  msfconsole: () => ({
    type: 'success',
    delay: 1500,
    output: `                                                  
     ,           ,
    /             \\
   ((__---,,,---__))
      (_) O O (_)_________
         \\ _ /            |\\
          o_o \\   M S F   | \\
               \\   - - -  |_/
                '---------'

       =[ metasploit v6.3.4-dev  ]
+ -- --=[ 2294 exploits - 1201 auxiliary - 409 post ]
+ -- --=[ 968 payloads - 45 encoders - 11 nops   ]
+ -- --=[ 9 evasion                               ]

msf6 > `,
  }),

  clear: () => ({ type: 'info', output: '\x1b[2J\x1b[H' }),
  cls: () => ({ type: 'info', output: '\x1b[2J\x1b[H' }),

  history: () => ({
    type: 'info',
    output: `    1  whoami\n    2  id\n    3  ls -la\n    4  cat config.php\n    5  nmap localhost\n    6  sqlmap -u "http://target/api?id=1"\n    7  curl http://127.0.0.1:8080/admin`,
  }),
};

export function executeCommand(input: string): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) return { type: 'info', output: '' };

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  const handler = COMMANDS[cmd];
  if (handler) return handler(args);

  // Unknown command
  return {
    type: 'error',
    output: `bash: ${cmd}: command not found\nType 'help' for available commands`,
  };
}
