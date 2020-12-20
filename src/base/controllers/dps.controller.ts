import { Controller, Get, Param, Query } from '@nestjs/common';
import { DpsProvider } from '../providers';

@Controller()
export class DpsController {
  constructor(private dpsProvider: DpsProvider) {}

  @Get('dps/city')
  public async getCityInfo(
    @Query() params: { offset: string },
  ): Promise<string> {
    return this.dpsProvider.getCityInfo({
      scrollFeedCount: Number(params.offset || 1),
    });
  }
}
