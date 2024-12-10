import { Module } from '@nestjs/common';
import { GithubModule } from './modules/github.module';
import { ConfigModule } from '@nestjs/config';
import {JwtService} from "./services/JwtService.js";
import {APP_GUARD} from "@nestjs/core";
import {JwtAuthGuard} from "./auth/JwtAuthGuard.js";

@Module({
  imports: [GithubModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [
    JwtService,
    {
        provide: APP_GUARD,
        useClass: JwtAuthGuard
    }],
})
export class AppModule {}
