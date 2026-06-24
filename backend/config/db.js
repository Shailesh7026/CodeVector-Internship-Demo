import { Pool } from "pg";
import dns from "node:dns";

const dbHost = "db.eaxfwcdslihpesncyhsa.supabase.co";
const poolerHost = "aws-0-ap-northeast-2.pooler.supabase.com";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  lookup: (hostname, options, callback) => {
    if (hostname === dbHost) {
      // Resolve to the shared pooler's IPv4 address to support IPv4-only networks like Render
      dns.lookup(poolerHost, { family: 4 }, (err, address) => {
        if (err) {
          callback(err);
        } else {
          callback(null, address, 4);
        }
      });
    } else {
      dns.lookup(hostname, options, callback);
    }
  }
});

export default pool;