import axios from 'axios';
import cheerio, { Cheerio } from 'cheerio';
import prisma from '../utils/prisma'
import { Prisma } from '@prisma/client';


export default async function getPosts(site: any, $: any):Promise<Prisma.PostCreateManyInput[]> {
    const postTitles: string[] = []
    let res: { title: string; text: string; img: string[];video: string[]; url: string; istochnik: string, siteid: any; old: boolean; }[] = []
    $('.n_news > a').each( (_i:any , el:any ) => {
      const postTitle = $(el).attr('href')
      postTitles.push(postTitle?postTitle:"") 
    });
    await Promise.all(postTitles.map(async (sitepost:any) => {
      try {
        const { data } = await axios.get(sitepost);
        const $ = cheerio.load(data);
        const title = $('.n_cap_lnk_one').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ').trim();
        let text = $('.n_text_lnk > p').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n").trim();
        // $('.nt_img_handler').each(function (i, elem) {
        //   text = text.replace($(this).text().trim(), '')
        // })
        
        let img: (string)[] = [];
        $('.nt_img_handler img').each(function (i, elem) {
          const el = $(this).attr('src')
          if (!!el) {
            img.push(el)
          }
        })
        let video: (string)[] = [];
        $('.n_text_lnk > div > iframe').each(function (i, elem) {
          const el = $(this).attr('src')
          if (!!el) {
            video.push(el)
          }
        })
        $('.n_text_lnk > p > iframe').each(function (i, elem) {
          const el = $(this).attr('src')
          if (!!el) {
            video.push(el)
          }
        })
        res.push({title, text: JSON.stringify({text: text}), img: img, video: video, url: sitepost, istochnik:`Источник: omskinform.ru`, siteid: site.id, old: false})

      } catch {
        console.log("poebatb")
      }
    }))
    // console.log(res)
    return res
      
}
