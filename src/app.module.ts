// src/app.module.ts
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

//DB
import { ScoresModule } from './scores/scores.module';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // public 폴더에서 정적 파일을 제공
    }),
    ScoresModule,
    ConfigModule.forRoot({
      isGlobal: true, // 전역에서 사용할 수 있도록 설정
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
