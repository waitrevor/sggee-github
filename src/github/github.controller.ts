import { Controller, Get, Post } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}
  // Figure out getFile and content
  // @Get()
  // getFile() {
  //   return [];
  // }

  @Get('branches')
  getBranches() {
    return this.githubService.getBranches();
  }

  @Post('update')
  updateFileInRepo() {
    return this.githubService.updateFileInrepo(
      '<p>Hello World!</p>',
      'public/main.html',
    );
  }

  @Post('pulls')
  createPullRequest() {
    return this.githubService.createPullRequest();
  }
}
