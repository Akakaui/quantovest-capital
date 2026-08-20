const postgres = require('postgres');

async function test(label, url) {
  const sql = postgres(url, { 
    ssl: { rejectUnauthorized: false }, 
    connect_timeout: 15, 
    max: 1, 
    prepare: false 
  });
  try {
    const r = await sql.unsafe('SELECT current_database(), current_user');
    console.log(`SUCCESS [${label}]:`, JSON.stringify(r));
    await sql.end();
    return true;
  } catch (e) {
    console.log(`FAIL [${label}]: ${e.message.substring(0, 200)} (code: ${e.code})`);
    await sql.end();
    return false;
  }
}

(async () => {
  const pw = 'rgvcR72RVh8L1C2E';
  
  // Direct connection - IPv6 should work now
  await test('direct-ipv6', `postgresql://postgres:${pw}@db.cbttwftusrwisxblkdvs.supabase.co:5432/postgres`);
  
  // Try pooler on port 5432 (session mode)
  await test('pooler-session-mode', `postgresql://postgres.cbttwftusrwisxblkdvs:${pw}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`);
  
  process.exit(0);
})();
