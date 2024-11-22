"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoresService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
let ScoresService = class ScoresService {
    constructor(configService) {
        this.configService = configService;
        this.ddbClient = new client_dynamodb_1.DynamoDBClient({
            region: this.configService.get('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
            },
        });
        this.ddbDocClient = lib_dynamodb_1.DynamoDBDocumentClient.from(this.ddbClient);
        this.tableName = this.configService.get('DYNAMODB_TABLE_NAME');
    }
    async saveScore(user_id, user_nickname, user_score, comment) {
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
            await this.ddbDocClient.send(new lib_dynamodb_1.PutCommand(params));
            return { message: 'Score saved successfully' };
        }
        catch (err) {
            console.error('Error saving score:', err);
            throw new Error('Could not save score');
        }
    }
    async getScores(page, limit) {
        const params = {
            TableName: this.tableName,
        };
        try {
            const data = await this.ddbDocClient.send(new lib_dynamodb_1.ScanCommand(params));
            const sortedScores = data.Items?.sort((a, b) => b.user_score - a.user_score) || [];
            const startIndex = (page - 1) * 10;
            const endIndex = startIndex + 10;
            return {
                scores: sortedScores.slice(startIndex, endIndex),
                total: sortedScores.length,
            };
        }
        catch (err) {
            console.error('Error fetching scores:', err);
            throw new Error('Could not fetch scores');
        }
    }
    async getTop10Scores() {
        const params = {
            TableName: this.tableName,
        };
        try {
            const data = await this.ddbDocClient.send(new lib_dynamodb_1.ScanCommand(params));
            const sortedScores = data.Items?.sort((a, b) => b.user_score - a.user_score) || [];
            if (sortedScores.length === 0) {
                throw new Error('No scores found.');
            }
            return sortedScores.slice(0, 10);
        }
        catch (err) {
            console.error('Error fetching top 10 scores:', err);
            throw new Error('Could not fetch top 10 scores');
        }
    }
};
exports.ScoresService = ScoresService;
exports.ScoresService = ScoresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ScoresService);
//# sourceMappingURL=scores.service.js.map