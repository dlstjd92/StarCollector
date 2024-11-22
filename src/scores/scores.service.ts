import { Injectable } from '@nestjs/common'; // Injectable 데코레이터 임포트
import { ConfigService } from '@nestjs/config'; // ConfigService 임포트
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'; // DynamoDB 클라이언트 임포트
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'; // DynamoDBDocumentClient 및 명령어 임포트

@Injectable() // NestJS의 Injectable 데코레이터로 서비스 정의
export class ScoresService {
  private readonly ddbClient: DynamoDBClient;
  private readonly ddbDocClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(private configService: ConfigService) {
    // DynamoDB 클라이언트 생성
    this.ddbClient = new DynamoDBClient({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });

    // DynamoDBDocumentClient 생성
    this.ddbDocClient = DynamoDBDocumentClient.from(this.ddbClient);
    this.tableName = this.configService.get<string>('DYNAMODB_TABLE_NAME');
  }

  // 점수 저장 함수
  async saveScore(user_id: number, user_nickname: string, user_score: number, comment: string) {
    const params = {
      TableName: this.tableName,
      Item: {
        user_id,
        user_nickname,
        user_score,
        comment,
      },
    };

    try {
      await this.ddbDocClient.send(new PutCommand(params));
      return { message: 'Score saved successfully' };
    } catch (err) {
      console.error('Error saving score:', err);
      throw new Error('Could not save score');
    }
  }

  // 점수 목록 가져오는 함수
  async getScores(page: number, limit: number) {
    const params = {
      TableName: this.tableName,
    };
  
    try {
      const data = await this.ddbDocClient.send(new ScanCommand(params));
      const sortedScores = data.Items?.sort((a, b) => b.user_score - a.user_score) || [];
  
      const startIndex = (page - 1) * 10;
      const endIndex = startIndex + 10;
      return {
        scores: sortedScores.slice(startIndex, endIndex), // 해당 페이지에 맞는 데이터만 반환
        total: sortedScores.length, // 전체 데이터 개수를 반환하여 클라이언트에서 페이지 수 계산 가능
      };
    } catch (err) {
      console.error('Error fetching scores:', err);
      throw new Error('Could not fetch scores');
    }
  }
  

  async getTop10Scores() {
    const params = {
      TableName: this.tableName,
    };

    try {
      const data = await this.ddbDocClient.send(new ScanCommand(params));
      const sortedScores = data.Items?.sort((a, b) => b.user_score - a.user_score) || [];

      if (sortedScores.length === 0) {
        throw new Error('No scores found.');
      }

      return sortedScores.slice(0, 10); // 상위 10개만 반환
    } catch (err) {
      console.error('Error fetching top 10 scores:', err);
      throw new Error('Could not fetch top 10 scores');
    }
  }

}


