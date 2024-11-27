import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  // Figure out getFile and content
  @Get('file')
  getFile(@Query('branch') branch: string, @Query('path') path: string) {
    return this.githubService.getFile(branch, path);
  }

  @Get('branches')
  getBranches() {
    return this.githubService.getBranches();
  }

  @Post('update')
  updateFileInRepo(
    @Body()
    data: {
      branch: string;
      path: string;
      editorData: string;
    },
  ) {
    return this.githubService.updateFileInrepo(data);
  }

  @Post('pulls')
  createPullRequest(@Body() data: { branch: string; message: string }) {
    return this.githubService.createPullRequest(data);
  }
}
