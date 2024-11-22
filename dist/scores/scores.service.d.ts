import { ConfigService } from '@nestjs/config';
export declare class ScoresService {
    private configService;
    private readonly ddbClient;
    private readonly ddbDocClient;
    private readonly tableName;
    constructor(configService: ConfigService);
    saveScore(user_id: number, user_nickname: string, user_score: number, comment: string): Promise<{
        message: string;
    }>;
    getScores(page: number, limit: number): Promise<{
        scores: Record<string, any>[];
        total: number;
    }>;
    getTop10Scores(): Promise<Record<string, any>[]>;
}
