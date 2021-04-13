import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BaseModule } from './base';

@Module({
  imports: [BaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
