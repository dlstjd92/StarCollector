import { ScoresService } from './scores.service';
import { Response } from 'express';
export declare class ScoresController {
    private readonly scoresService;
    constructor(scoresService: ScoresService);
    addScore(body: {
        user_id: number;
        user_nickname: string;
        user_score: number;
        comment: string;
    }): Promise<{
        message: string;
    }>;
    getAllScores(page?: number, limit?: number): Promise<{
        scores: Record<string, any>[];
        total: number;
    }>;
    getTop10Scores(res: Response): Promise<Response<any, Record<string, any>>>;
}
