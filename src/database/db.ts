import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

const pool = new Pool({
  user: 'myuser',
  host: 'localhost',
  database: 'mydb',
  password: 'mypassword',
  port: 5432,
  // 연결 풀 설정
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
  connectionTimeoutMillis: 2000, // 연결 타임아웃
});

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL DB 연결 성공');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL DB 연결 오류:', err);
});

export default pool; 