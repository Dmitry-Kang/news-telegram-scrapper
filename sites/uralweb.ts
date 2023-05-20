import axios from 'axios';
import cheerio, { Cheerio } from 'cheerio';
import prisma from '../utils/prisma'
import { Prisma } from '@prisma/client';


export default async function getPosts(site: any, $: any):Promise<Prisma.PostCreateManyInput[]> {
    const postTitles: string[] = []
    let res: { title: string; text: string; img: string[];video: string[]; url: string; istochnik: string, siteid: any; old: boolean; }[] = []
    $('.news-box li .last-nn-box h3 > a').each( (_i:any , el:any ) => {
      const postTitle = $(el).attr('href')
      postTitles.push(postTitle?postTitle:"") 
    });
    await Promise.all(postTitles.map(async (sitepost:any) => {
      try {
        const { data } = await axios.get("https://www.uralweb.ru" + sitepost);
        const $ = cheerio.load(data);
        const title = $(".clearfix .ni-htext h1").text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ').trim();

        let text = ""; // тест до картинки
        $(".n-ict.clearfix > p").each(function (i, elem) {
          text += $(this).text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n") + '\n\n';
        });
        text = text.replace(/\s{2,}/gm,"\n\n") 
        // $("blockquote p").each(function (i, elem) { // хз
        //   text = text.replace($(this).text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n"), "");
        // });
        
        let img: string[] = [];
        $(".ni-bimg > img").each(function (i, elem) {
          img.push("https:" + $(this).attr("src"));
        });
        $(".noted-img > img").each(function (i, elem) { // не ебу почему не работает. возможно он подгружается при скроле
          console.log("pls")
          img.push("https:" + $(this).attr("src"));
        });
        

        let video: string[] = [];
        $('.youtube-player.video-player > iframe').each(function (i, elem) {
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
          url: "https://www.uralweb.ru" + sitepost,
          istochnik:`Источник: uralweb.ru`,
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
