import { Controller, Get, Res } from '@nestjs/common'; // Res 추가
import { AppService } from './app.service';
import { Response } from 'express'; // Response 객체 추가
import { join } from 'path'; // join 함수 추가


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("root")
  getHello(): string {
    return this.appService.getHello();
  }
  
  //rankings 경로에 접근하면 rankings.html 파일 제공
  @Get('/rankings')
  getRankingPage(@Res() res: Response) {
    // public 폴더에 있는 rankings.html 파일을 제공
    res.sendFile(join(__dirname, '..', 'public', 'ranking.html'));
  }
  
}


