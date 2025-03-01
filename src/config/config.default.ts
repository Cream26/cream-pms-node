import { MidwayConfig } from '@midwayjs/core';
// import { User } from '../entity/user.entity';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1734164717194_8460',
  koa: {
    port: 7001,
    // 添加全局的路由前缀
    globalPrefix: '/pms',
  },
  // 数据库
  typeorm: {
    dataSource: {
      default: {
        type: 'mongodb',
        host: '127.0.0.1',
        database: 'test',
        port: 27017,
        entities: ['entity'],
        synchronize: true,  // 是否自动同步数据库
      },
    },
  },
  // jwt
  jwt: {
    secret: 'jsgdwdhjwsdheywgdehbdhsfhhedgf',
    accessToken: {
      secret: 'jgdhyeyukoejdyskldfyhjdh',
      expiresIn: '30m'
    },
    refreshToken: {
      secret: 'jgdhyeyukoejdydjfhdskldfyhjdh',
      expiresIn: '7d'
    },
    sign: {
      audience: '', // 目标受众
      issuer: 'pms', // 签发者
      algorithm: 'HS256', // 加密算法
    },
    verify: {
      ignoreExpiration: false, // 忽略过期时间
    },
    decode: {
      complete: true,  // 是否返回完整的解析后的数据
      
    }
  },
  // redis
  redis: {
    client: {
      port: 6379,
      host: '127.0.0.1',
      db: 0,
    },
  },
} as MidwayConfig;