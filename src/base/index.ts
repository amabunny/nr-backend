import { Module } from '@nestjs/common';
import { PuppeteerModule } from 'nest-puppeteer';
import { DpsController } from './controllers';
import { DpsProvider } from './providers';

@Module({
  imports: [PuppeteerModule.forRoot()],
  controllers: [DpsController],
  providers: [DpsProvider],
})
export class BaseModule {}
