import { Controller, Get, Query, Render } from '@nestjs/common';
import { DpsProvider } from '../providers';

interface IGetCityInfoParams {
  offset: string;
}

@Controller()
export class DpsController {
  constructor(private dpsProvider: DpsProvider) {}

  @Get('dps/city')
  public async getCityInfo(@Query() params: IGetCityInfoParams) {
    const scrollFeedCount = Number(params.offset || 0);
    return this.dpsProvider.getCityInfo({ scrollFeedCount });
  }

  @Get('dps/city.html')
  @Render('dps/dps-html-view')
  public async getCityInfoHtml(@Query() params: IGetCityInfoParams) {
    const scrollFeedCount = Number(params.offset || 0);
    return { posts: await this.dpsProvider.getCityInfo({ scrollFeedCount }) };
  }
}
