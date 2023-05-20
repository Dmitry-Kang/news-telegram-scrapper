import axios from 'axios';
import cheerio, { Cheerio } from 'cheerio';
import prisma from '../utils/prisma'
import { Prisma } from '@prisma/client';


export default async function getPosts(site: any, $: any):Promise<Prisma.PostCreateManyInput[]> {
    const postTitles: string[] = []
    let res: { title: string; text: string; img: string[];video: string[]; url: string; istochnik: string, siteid: any; old: boolean; }[] = []
    $('.mx-auto > .mb-8 > a').each( (_i:any , el:any ) => {
      const postTitle = $(el).attr('href')
      postTitles.push(postTitle?postTitle:"") 
    });
    await Promise.all(postTitles.map(async (sitepost:any) => {
      try {
        const { data } = await axios.get("https://rostovgazeta.ru" + sitepost);
        const $ = cheerio.load(data);
        const title = $(".MatterTop_title__fNgrs").text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ').trim();

        let text = ""; // тест до картинки
        $(".Common_common__MfItd > p").each(function (i, elem) {
          text += $(this).text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n") + '\n\n';
        });
        text = text.replace(/\s{2,}/gm,"\n\n") 
        // $("blockquote p").each(function (i, elem) { // хз
        //   text = text.replace($(this).text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n"), "");
        // });
        
        let img: string[] = ["https://rostovgazeta.ru" + $(".MatterTop_layer__c__zR").first().attr("src")]; // todo только первый потомушто картинка это бекграунд и больше нету
        // $(".MatterTop_layer__c__zR").each(function (i, elem) {
        //   img.push("https://rostovgazeta.ru" + $(this).attr("src"));
        // });

        res.push({
          title,
          text: JSON.stringify({ text: text }),
          img: img, 
          video: [],
          url: "https://rostovgazeta.ru" + sitepost,
          istochnik:`Источник: rostovgazeta.ru`,
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
