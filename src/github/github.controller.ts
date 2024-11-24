import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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
  updateFileInRepo(@Body() data: { path: string; editorData: string }) {
    return this.githubService.updateFileInrepo(data);
  }

  @Post('pulls')
  // Change to be body instead of Query
  createPullRequest(@Query('branch') branch: string) {
    return this.githubService.createPullRequest(branch);
  }
}
