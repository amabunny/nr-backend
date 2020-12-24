import { Injectable } from '@nestjs/common';
import { InjectBrowser } from 'nest-puppeteer';
import { Browser } from 'puppeteer';
import { IPostInfo } from '../types/dps.types';

interface IGetCityInfoParams {
  scrollFeedCount: number;
}

@Injectable()
export class DpsProvider {
  private static JS_FROM_PHP_TIME_MULTIPLIER = 1000;

  private pageItems = {
    STERLITAMAK_DPS_VK_URL: 'https://vk.com/dpsstr',
    NEWSLETTER_URL_PART: 'al_wall',
    POST_SELECTOR: '#group_wall ._post_content',
  };

  constructor(@InjectBrowser() private readonly browser: Browser) {}

  public async getCityInfo({ scrollFeedCount }: IGetCityInfoParams) {
    const {
      NEWSLETTER_URL_PART,
      POST_SELECTOR,
      STERLITAMAK_DPS_VK_URL,
    } = this.pageItems;

    const page = await this.browser?.newPage();
    await page?.goto(STERLITAMAK_DPS_VK_URL);

    for (let i = 0; i < scrollFeedCount; i++) {
      const newsletterResponse = page?.waitForResponse((r) =>
        r?.url().includes(NEWSLETTER_URL_PART),
      );

      page?.$eval('body', (element) => {
        element.scrollIntoView({ block: 'end' });
      });

      await newsletterResponse;

      await page?.waitForTimeout(500);
    }

    const texts = await page?.$$eval(POST_SELECTOR, (el): IPostInfo[] =>
      el
        .map((el) => {
          return {
            author: el?.querySelector('.author')?.textContent || '',
            text:
              (el?.querySelector('.wall_post_text') as HTMLDivElement)
                ?.innerText || '',
            time:
              el?.querySelector('.rel_date')?.getAttribute('time') ||
              el?.querySelector('.rel_date')?.textContent ||
              '',
            replies: Array.from(el.querySelectorAll('.reply_content'))
              .map((el) => ({
                author: el?.querySelector('.reply_author')?.textContent || '',
                text:
                  (el?.querySelector('.reply_text') as HTMLDivElement)
                    ?.innerText || '',
                time:
                  el?.querySelector('.rel_date')?.getAttribute('time') ||
                  el?.querySelector('.rel_date')?.textContent ||
                  '',
              }))
              .filter(({ text }) => Boolean(text)),
          };
        })
        .filter(
          ({ text, author }) => Boolean(text) && author !== 'Стерлитамак ДПС',
        ),
    );

    page?.close();

    return texts.map((post) => ({
      ...post,
      time: Number(post.time) * DpsProvider.JS_FROM_PHP_TIME_MULTIPLIER,
      text: post.text?.trim(),
      replies: post.replies?.map((reply) => ({
        ...reply,
        text: reply.text?.trim(),
        time: Number(post.time) * DpsProvider.JS_FROM_PHP_TIME_MULTIPLIER,
      })),
    }));
  }
}
