import { Module } from '@nestjs/common';
import { GithubModule } from './modules/GithubModule.js';
import { ConfigModule } from '@nestjs/config';
import {JwtService} from "./services/JwtService.js";
import {APP_GUARD} from "@nestjs/core";
import {JwtAuthGuard} from "./auth/JwtAuthGuard.js";
import { VueFinderModule } from './modules/VuefinderModule.js';

@Module({
  imports: [GithubModule, VueFinderModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [
    JwtService,
    {
        provide: APP_GUARD,
        useClass: JwtAuthGuard
    }],
})
export class AppModule {}
