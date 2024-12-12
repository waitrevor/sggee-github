import { Body, Controller, Get, Post, Query, HttpCode } from '@nestjs/common';
import { GithubService } from '../services/GithubService.js';
import { Roles } from '../auth/RolesDecorator.js';
import {UserGroupEnum} from "../models/UserCredentialTypes.js";

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  // Figure out getFile and content
  @Get('file')
  getFile(@Query('branch') branch: string, @Query('path') path: string) {
    return this.githubService.getFile(branch, path);
  }

  @Get('branches')
  @HttpCode(202)
  @Roles([UserGroupEnum.ADMIN, UserGroupEnum.MAINTENANCE])
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
