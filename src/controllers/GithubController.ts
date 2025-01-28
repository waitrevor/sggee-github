import { Body, Controller, Get, Post, Query, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { GithubService } from '../services/GithubService.js';
import { Roles, Public } from '../auth/RolesDecorator.js';
import {UserGroupEnum} from "../models/UserCredentialTypes.js";
import {FileInterceptor} from "@nestjs/platform-express";

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('/v1/file')
  @Roles([UserGroupEnum.ADMIN, UserGroupEnum.MAINTENANCE])
  getFile(@Query('branch') branch: string, @Query('path') path: string) {
    return this.githubService.getFile(branch, path);
  }

  @Get('/v1/branches')
  @Roles([UserGroupEnum.ADMIN, UserGroupEnum.MAINTENANCE])
  getBranches() {
    return this.githubService.getBranches();
  }

  @Get('/v1/content')
  @Roles([UserGroupEnum.ADMIN, UserGroupEnum.MAINTENANCE])
  getContent(@Query('branch') branch: string) {
    return this.githubService.getContent(branch);
  }

  @Post('/v1/create_branch')
  @Roles([UserGroupEnum.ADMIN, UserGroupEnum.MAINTENANCE])
  createBranch(@Body() data: { baseBranch: string; newBranch: string }) {
    return this.githubService.createBranch(data);
  }
  
  @Post('/v1/update_or_create')
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

  @Post('/v1/pulls')
  @Roles([UserGroupEnum.ADMIN, UserGroupEnum.MAINTENANCE])
  createPullRequest(@Body() data: { branch: string; message: string }) {
    return this.githubService.createPullRequest(data);
  }

  @Post('/v1/upload')
  @Roles([UserGroupEnum.ADMIN, UserGroupEnum.MAINTENANCE])
  @UseInterceptors(FileInterceptor('file'))
  async acceptUpload(@UploadedFile() file: Express.Multer.File, @Body('path') path: string, @Body('branch') branch: string) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
      return await this.githubService.uploadFile(branch, path, file.buffer)
  }

}
