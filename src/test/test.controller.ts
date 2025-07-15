import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import pool from '../database/db';

@Controller('test')
export class TestController {
  
  @Get('db-connection')
  async testDbConnection() {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as current_time');
      client.release();
      
      return {
        success: true,
        message: 'PostgreSQL 연결 성공!',
        data: {
          currentTime: result.rows[0].current_time,
          connectionStatus: 'connected'
        }
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'PostgreSQL 연결 실패',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('users')
  async getUsers() {
    try {
      const client = await pool.connect();
      
      // users 테이블이 없으면 생성
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // 테스트 데이터 삽입 (중복 방지)
      await client.query(`
        INSERT INTO users (name, email) 
        VALUES ('테스트 사용자', 'test@example.com')
        ON CONFLICT (email) DO NOTHING
      `);
      
      // 모든 사용자 조회
      const result = await client.query('SELECT * FROM users ORDER BY created_at DESC');
      client.release();
      
      return {
        success: true,
        message: '사용자 목록 조회 성공',
        data: {
          users: result.rows,
          count: result.rowCount
        }
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '사용자 목록 조회 실패',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('users')
  async createUser(@Body() userData: { name: string; email: string }) {
    try {
      const client = await pool.connect();
      
      const result = await client.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [userData.name, userData.email]
      );
      
      client.release();
      
      return {
        success: true,
        message: '사용자 생성 성공',
        data: {
          user: result.rows[0]
        }
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '사용자 생성 실패',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 