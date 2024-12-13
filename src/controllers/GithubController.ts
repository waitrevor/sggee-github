import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GithubService } from '../services/GithubService.js';
import { Roles } from '../auth/RolesDecorator.js';
import {UserGroupEnum} from "../models/UserCredentialTypes.js";

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('file')
  @Roles([UserGroupEnum.ADMIN, UserGroupEnum.MAINTENANCE])
  getFile(@Query('branch') branch: string, @Query('path') path: string) {
    return this.githubService.getFile(branch, path);
  }

  @Get('branches')
  @Roles([UserGroupEnum.ADMIN, UserGroupEnum.MAINTENANCE])
  getBranches() {
    return this.githubService.getBranches();
  }

  @Post('create')
  @Roles([UserGroupEnum.ADMIN, UserGroupEnum.MAINTENANCE])
  createBranch(@Body() data: { baseBranch: string; newBranch: string }) {
    return this.githubService.createBranch(data);
  }

  @Post('update')
  @Roles([UserGroupEnum.ADMIN, UserGroupEnum.MAINTENANCE])
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
  @Roles([UserGroupEnum.ADMIN, UserGroupEnum.MAINTENANCE])
  createPullRequest(@Body() data: { branch: string; message: string }) {
    return this.githubService.createPullRequest(data);
  }
}
