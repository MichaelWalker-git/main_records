describe('config - buildDatabaseUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.DATABASE_URL;
    delete process.env.DB_HOST;
    delete process.env.DB_PROXY_ENDPOINT;
    delete process.env.DB_PORT;
    delete process.env.DB_SECRET;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses DATABASE_URL if set', async () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@host:5432/db';
    const { config } = await import('../config');
    expect(config.databaseUrl).toBe('postgresql://user:pass@host:5432/db');
  });

  it('builds URL from DB_HOST + DB_SECRET JSON', async () => {
    process.env.DB_HOST = 'proxy.rds.amazonaws.com';
    process.env.DB_PORT = '5433';
    process.env.DB_SECRET = JSON.stringify({ username: 'admin', password: 's3cr3t' });
    const { config } = await import('../config');
    expect(config.databaseUrl).toBe(
      'postgresql://admin:s3cr3t@proxy.rds.amazonaws.com:5433/maine_rms?sslmode=require'
    );
  });

  it('builds URL from DB_PROXY_ENDPOINT (fallback name)', async () => {
    process.env.DB_PROXY_ENDPOINT = 'proxy.rds.amazonaws.com';
    process.env.DB_SECRET = JSON.stringify({ username: 'admin', password: 'pw' });
    const { config } = await import('../config');
    expect(config.databaseUrl).toContain('proxy.rds.amazonaws.com');
    expect(config.databaseUrl).toContain('admin:pw');
  });

  it('falls back to endpoint-only URL if DB_SECRET is not JSON', async () => {
    process.env.DB_HOST = 'proxy.rds.amazonaws.com';
    process.env.DB_SECRET = 'not-json';
    const { config } = await import('../config');
    expect(config.databaseUrl).toBe(
      'postgresql://proxy.rds.amazonaws.com:5433/maine_rms?sslmode=require'
    );
  });

  it('defaults to localhost when no env vars set', async () => {
    const { config } = await import('../config');
    expect(config.databaseUrl).toBe('postgresql://localhost:5432/maine_rms');
  });

  it('uses default port 5433 when DB_PORT not set', async () => {
    process.env.DB_HOST = 'proxy.rds.amazonaws.com';
    process.env.DB_SECRET = JSON.stringify({ username: 'u', password: 'p' });
    const { config } = await import('../config');
    expect(config.databaseUrl).toContain(':5433/');
  });
});