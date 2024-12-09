import { Controller, HttpCode, Injectable, Post, UseInterceptors } from '@nestjs/common';
import { AcceptUpdateService } from '../services/AcceptUpdateService.js';

@Controller()
@Injectable()
export class AcceptUpdateController {
  constructor(private readonly acceptUpdateService: AcceptUpdateService) {}

  @Post('/v1/editor/upload')
  @HttpCode(202)
  // Interceptors are used to handel the requests from the client?
  //@UseInterceptros()
  async acceptUpload(file: string) {
    await this.acceptUpdateService.invokeLambdaProcessor(file);
    return {
      message: 'processing',
    };
  }
}
