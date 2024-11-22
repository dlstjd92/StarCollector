import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class BlockPostGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // POST 요청인지 확인
    if (request.method === 'POST') {
      // 게임 오버가 아니면 false로 POST 요청을 차단
      if (!request.headers['x-game-over']) { // 게임 오버 상황인지 판단하는 조건
        return false;
      }
    }

    return true;
  }
}
