import { Module } from '@nestjs/common';
import { GithubController } from '../controllers/GithubController.js';
import { GithubService } from '../services/GithubService.js';

@Module({
  controllers: [GithubController],
  providers: [GithubService],
})
export class GithubModule {}
