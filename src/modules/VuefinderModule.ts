import { Module } from '@nestjs/common';
import { VuefinderService } from '../services/VuefinderService.js';
import { VuefinderController } from '../controllers/VuefinderController.js';

@Module({
  controllers: [VuefinderController],
  providers: [VuefinderService],
})

export class VueFinderModule {}