const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DBUSER,
  host: process.env.DBHOST,
  database: process.env.DBDATABASE,
  password: process.env.DBPASSWORD,
  port: process.env.DBPORT,
});

function withClient(callback) {
  return async (current, args, context) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = callback(current, args, {
        ...context,
        client,
      });
      const response = await Promise.resolve(result);
      await client.query('COMMIT');
      client.release();
      return response;
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      console.error(error);
      throw error;
    }
  };
}


module.exports = {
  pool,
  withClient,
};
