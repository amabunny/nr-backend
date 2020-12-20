import { Controller, Get } from '@nestjs/common';
import { DpsProvider } from '../providers';

@Controller()
export class DpsController {
  constructor(private dpsProvider: DpsProvider) {}

  @Get('dps/city')
  public async getCityInfo(): Promise<string> {
    return this.dpsProvider.getCityInfo({});
  }
}
