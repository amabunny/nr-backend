import { Module } from '@nestjs/common';
import { PuppeteerModule } from 'nest-puppeteer';
import { DpsController } from './controllers';
import { DpsProvider } from './providers';

@Module({
  imports: [
    PuppeteerModule.forRoot({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: ['--no-sandbox', '--lang=ru,ru-RU'],
    }),
  ],
  controllers: [DpsController],
  providers: [DpsProvider],
})
export class BaseModule {}
