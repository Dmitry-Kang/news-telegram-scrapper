import axios from 'axios';
import cheerio, { Cheerio } from 'cheerio';
import prisma from '../utils/prisma'
import { Prisma } from '@prisma/client';


export default async function getPosts(site: any, $: any):Promise<Prisma.PostCreateManyInput[]> {
    const postTitles: string[] = []
    let res: { title: string; text: string; img: string[];video: string[]; url: string; istochnik: string, siteid: any; old: boolean; }[] = []
    $('.main-column > div .news-block__title').each( (_i:any , el:any ) => {
      const postTitle = $(el).attr('href')
      postTitles.push(postTitle?postTitle:"") 
    });
    await Promise.all(postTitles.map(async (sitepost:any) => {
      try {
        const { data } = await axios.get("https://sarnovosti.ru" + sitepost);
        const $ = cheerio.load(data);
        const title = $(".main-column > article > h1").text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ').trim();

        let text = "";
        $(".main-column > article > [itemprop = 'articleBody']").each(function (i, elem) {
          text += $(this).text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n") + '\n\n';
        });
        text = text.replace(/\s{2,}/gm,"\n\n") 
        
        let img: string[] = [];
        $(".main-column > article > img").each(function (i, elem) {
          img.push("https://sarnovosti.ru" + $(this).attr("src"));
        });
        $(".gallery-wrapper > .gallery-top > .swiper-wrapper > .swiper-slide > img").each(function (i, elem) {
          img.push("https://sarnovosti.ru" + $(this).attr("src"));
        });
        

        let video: string[] = [];
        $(".main-column > article > [itemprop = 'articleBody'] > .iframe > iframe").each(function (i, elem) {
          const el = $(this).attr('src')
          if (!!el) {
            video.push(el)
          }
        })
        res.push({
          title,
          text: JSON.stringify({ text: text }),
          img: img, 
          video: video,
          url: "https://sarnovosti.ru" + sitepost,
          istochnik:`Источник: sarnovosti.ru`,
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
