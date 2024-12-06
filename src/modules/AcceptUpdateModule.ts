import { Module } from '@nestjs/common';
import { AcceptUpdateController } from '../controllers/AcceptUpdateController';

@Module({
  imports: [],
  providers: [],
  controllers: [AcceptUpdateController],
})
export class AcceptFileModule {}
