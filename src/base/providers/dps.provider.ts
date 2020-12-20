import { Injectable } from '@nestjs/common';
import { InjectBrowser } from 'nest-puppeteer';
import { Browser } from 'puppeteer';
import { IPostInfo } from '../types/dps.types';

interface IGetCityInfoParams {
  scrollFeedCount: number;
}

@Injectable()
export class DpsProvider {
  private static STERLITAMAK_DPS_VK_URL = 'https://vk.com/dpsstr';
  private static POST_SELECTOR = '._post_content';

  constructor(@InjectBrowser() private readonly browser: Browser) {}

  public async getCityInfo({ scrollFeedCount }: IGetCityInfoParams) {
    const page = await this.browser?.newPage();
    await page?.goto(DpsProvider.STERLITAMAK_DPS_VK_URL);

    for (let i = 0; i < scrollFeedCount; i++) {
      const newsletterResponse = page?.waitForResponse((r) =>
        r?.url().includes('al_wall'),
      );

      page?.$eval('body', (element) => {
        element.scrollIntoView({ block: 'end' });
      });

      await newsletterResponse;

      if (i === 0) {
        await page?.waitForSelector('.JoinForm__notNow');

        await page?.$eval('.JoinForm__notNow', (element) => {
          (element as any).click();
        });
      }

      await page?.waitForTimeout(1000);
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
