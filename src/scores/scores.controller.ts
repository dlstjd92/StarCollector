import { Controller, Get, Post, Body, Query, Res , UseGuards } from '@nestjs/common'; // Query 데코레이터 추가
import { ScoresService } from './scores.service';
import { Response } from 'express';
import { join } from 'path';
import { BlockPostGuard } from '../guards/block-post.guard'; // 가드 추가

@Controller('scores')
@UseGuards(BlockPostGuard)  // 모든 POST 요청에 대해 가드 적용
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Post()
  async addScore(
    @Body() body: { user_id: number; user_nickname: string; user_score: number; comment: string },
  ) {
    const { user_id, user_nickname, user_score, comment } = body;
    return this.scoresService.saveScore(user_id, user_nickname, user_score, comment);
  }

  @Get()
  async getAllScores(
    @Query('page') page: number = 1, // Query 데코레이터로 페이지 쿼리값 받기
    @Query('limit') limit: number = 10 // 페이지당 제한값 받기
  ) {
    return this.scoresService.getScores(page, limit);
  }

  @Get('/top10')
  async getTop10Scores(@Res() res: Response) {
    const scores = await this.scoresService.getTop10Scores();
    return res.json(scores);  // JSON 형식으로 명시적 반환
  }

  // /rankings 경로에 접근하면 rankings.html 파일 제공
  // @Get('/rankings')
  // getRankingPage(@Res() res: Response) {
  //   // public 폴더에 있는 rankings.html 파일을 제공
  //   res.sendFile(join(__dirname, '..', '..', 'public', 'ranking.html'));
  // }
}
