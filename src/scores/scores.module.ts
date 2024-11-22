import { Module } from '@nestjs/common';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';

@Module({
  controllers: [ScoresController],  // 점수 처리 요청을 담당하는 컨트롤러
  providers: [ScoresService],       // 점수를 저장하고 관리하는 비즈니스 로직
})
export class ScoresModule {}
