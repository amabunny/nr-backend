import { Injectable } from '@nestjs/common';
import { InjectBrowser } from 'nest-puppeteer';
import { AllHtmlEntities } from 'html-entities';
import { Browser } from 'puppeteer';
import { IPostInfo } from '../types/dps.types';

interface IGetCityInfoParams {
  scrollFeedCount: number;
}

@Injectable()
export class DpsProvider {
  private static getElementData(element: Element, useHtml: boolean) {
    return useHtml ? element.innerHTML : element.textContent || '';
  }

  private pageItems = {
    STERLITAMAK_DPS_VK_URL: 'https://vk.com/dpsstr',
    NEWSLETTER_URL_PART: 'al_wall',
    POST_SELECTOR: '#group_wall ._post_content',
  };

  private dateFormatter = new Intl.DateTimeFormat('ru', {
    hour: 'numeric',
    minute: 'numeric',
  });

  constructor(@InjectBrowser() private readonly browser: Browser) {}

  private formatStringDate(spanTime: string) {
    const number = Number(spanTime);
    if (isNaN(number)) return '';
    return this.dateFormatter.format(number * 1000);
  }

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
              (el?.querySelector('.wall_post_text') as any)?.innerText || '',
            time: el?.querySelector('.rel_date')?.textContent || '',
            replies: Array.from(el.querySelectorAll('.reply_content'))
              .map((el) => ({
                author: el?.querySelector('.reply_author')?.textContent || '',
                text:
                  (el?.querySelector('.reply_text') as any)?.innerText || '',
                time: el?.querySelector('.rel_date')?.textContent || '',
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
      time: post.time,
      text: post.text?.trim(),
      replies: post.replies?.map((reply) => ({
        ...reply,
        text: reply.text?.trim(),
      })),
    }));
  }
}
