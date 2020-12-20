import { Injectable } from '@nestjs/common';
import { InjectBrowser } from 'nest-puppeteer';
import { Browser } from 'puppeteer';
import { IPostInfo } from '../types/dps.types';

interface IGetCityInfoParams {
  scrollFeedCount?: number;
}

@Injectable()
export class DpsProvider {
  private static STERLITAMAK_DPS_VK_URL = 'https://vk.com/dpsstr';
  private static POST_SELECTOR = '._post_content';

  constructor(@InjectBrowser() private readonly browser: Browser) {}

  public async getCityInfo({
    scrollFeedCount = 3,
  }: IGetCityInfoParams): Promise<string> {
    const page = await this.browser?.newPage();
    await page?.goto(DpsProvider.STERLITAMAK_DPS_VK_URL);

    for (let i = 0; i < scrollFeedCount; i++) {
      await page?.$eval('body', (element) => {
        element.scrollIntoView({ block: 'end' });
      });

      await page?.waitForRequest((r) => r.response()?.url().includes('al_wall') || true);
    }

    const texts = await page?.$$eval(
      DpsProvider.POST_SELECTOR,
      (el): IPostInfo[] =>
        el.map((el) => ({
          author: el?.querySelector('.author')?.textContent || '',
          text: el?.querySelector('.wall_post_text')?.textContent || '',
          time: el?.querySelector('.rel_date')?.textContent || '',
        })),
    );

    const normalized = texts.filter(({ text }) => Boolean(text));

    page?.close();

    return JSON.stringify(normalized);
  }
}
