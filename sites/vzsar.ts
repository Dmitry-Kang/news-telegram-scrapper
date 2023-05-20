import axios from 'axios';
import cheerio, { Cheerio } from 'cheerio';
import prisma from '../utils/prisma'
import { Prisma } from '@prisma/client';
import iconv from 'iconv-lite';


export default async function getPosts(site: any, $: any):Promise<Prisma.PostCreateManyInput[]> {
    const postTitles: string[] = []
    let res: { title: string; text: string; img: string[];video: string[]; url: string; istochnik: string, siteid: any; old: boolean; }[] = []
    $('.newslist > a').each( (_i:any , el:any ) => {
      const postTitle = $(el).attr('href')
      postTitles.push(postTitle?postTitle:"") 
    });
    await Promise.all(postTitles.map(async (sitepost:any) => {
      try {
        const response = await axios.get('https://www.vzsar.ru' + sitepost, { responseType: 'arraybuffer' });
        const data = iconv.decode(response.data, 'win1251'); // блядская адская поебота
        const $ = cheerio.load(data);

        const title = $('.newshead h1').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ');

        let text = ""
        $('.full > p').each(function (i, elem) {
          const toAdd = $(this).text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, '\n\n') + '\n\n';
          if (!toAdd.includes('Материал подготовил') && !toAdd.includes('Подпишитесь на телеграм-канал')) {
            text += $(this).text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, '\n\n') + '\n\n';
          }
        })
        text = text.replace(/\s{2,}/gm,"\n\n") 
        // $('.full .seealso_banner').each(function (i, elem) {
        //   text.replace($(this).text().trim(), '');
        // })
        // $('.full i').each(function (i, elem) {
        //   text.replace($(this).text().trim(), '');
        // })

        let img: string[] = []
        $('.newshead > img.img').each(function (i, elem) {
          img.push("https://www.vzsar.ru" + $(this).attr('src'))
        })
        $('.gallery > .mainImg > a').each(function (i, elem) {
          img.push("https://www.vzsar.ru" + $(this).attr('href'))
        })
        $('.gallery > .scrollImg > .thumb > .over > a').each(function (i, elem) {
          img.push("https://www.vzsar.ru" + $(this).attr('href'))
        })
        res.push({
          title,
          text: JSON.stringify({ text: text }),
          img: img, 
          video: [], // todo не нашел новостей с видео
          url: "https://vzsar.ru" + sitepost,
          istochnik:`Источник: vzsar.ru`,
          siteid: site.id,
          old: false,
        });

      } catch {
        console.log("poebatb")
      }
    }))
    // console.log(res)
    return res
      
}
