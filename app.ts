import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import prisma from './utils/prisma'
import { Prisma } from '@prisma/client';
import axios from 'axios';
import cheerio, { Cheerio } from 'cheerio';
import { MediaGroup } from 'telegraf/typings/telegram-types';
// const axios = require('axios');
// const cheerio = require('cheerio');
dotenv.config();

let options:any = {
  channelMode: true    // Handle `channel_post` updates as messages (optional)
}

const bot = new Telegraf(process.env.TELEGRAM_TOKEN || '', options);

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

async function getPostTitles() {
	try {
    const sites = await prisma.site.findMany();
    const res:Prisma.PostCreateManyInput[]= []
    await Promise.all(sites.map(async site => {
      const { data } = await axios.get(
        site.url
      );
      const $ = cheerio.load(data);
      const postTitles: string[] = []

      // омск1 omskinform
      if (site.name === "omskinform") {
        // $('.n_news > a').each( (_i, el) => {
        //     const postTitle = $(el).attr('href')
        //     postTitles.push(postTitle?postTitle:"") 
        //   });
        //   await Promise.all(postTitles.map(async el => {
        //     try {
        //       const { data } = await axios.get(el);
        //       const $ = cheerio.load(data);
        //       const title = $('.n_cap_lnk_one').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ');
        //       let text = $('.n_text_lnk').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n");
        //       $('.nt_img_handler').each(function (i, elem) {
        //         text = text.replace($(this).text().trim(), '')
        //       })
              
        //       const img = $('.nt_img_handler img').attr('src')
        //       res.push({title, text: JSON.stringify({text: text}), img: img || '' , url: site.url, siteid: site.id, old: false})
        //     } catch {console.log("poebatb")}
              
        //   }))
      } else if (site.name === "uralweb") { // ural
        $('.news-box li .last-nn-box h3 > a').each( (_i, el) => {
            const postTitle = $(el).attr('href')
            postTitles.push(postTitle?postTitle:"") 
          });
          await Promise.all(postTitles.map(async el => {
            // try {
              const { data } = await axios.get("https://www.uralweb.ru" + el);
              const $ = cheerio.load(data);
              const title = $('.clearfix h1').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ');
              let text1 = ''  //.text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n");
              $('.n-ict.clearfix').each(function (i, elem) {
                text1 += $(this).text().trim().replace(/\[.*\]/g, '') + "\n";
              })
              let text = ''  //
              $('.news-detail-body p').each(function (i, elem) {
                text += $(this).text().trim().replace(/\[.*\]/g, '').replace(/\n{1}/gm,"") + "\n";
              })
              $('blockquote p').each(function (i, elem) {
                text = text.replace($(this).text().trim(), '')
              })
              let img = []
              img.push("https:" + $('.ni-bimg > img').attr('src'))
              $('.noted-img > img').each(function (i, elem) {
                img.push("https:" + $(this).attr('src'))
                console.log('suka')
              })
              res.push({title, text: JSON.stringify({text: text1 + text}), img: img || '' , url: "Источник: uralweb", siteid: site.id, old: false})
            // } catch {console.log("poebatb")}
              
          }))
      } else if (site.name === "vzsar") { // vzsar
        $('.newslist > a').each( (_i, el) => {
            const postTitle = $(el).attr('href')
            postTitles.push(postTitle?postTitle:"") 
          });
          await Promise.all(postTitles.map(async el => {
            // try {
              const { data } = await axios.get("https://www.vzsar.ru" + el);
              const $ = cheerio.load(data);
              const title = $('.newshead h1').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ');
              let text = $('.full').text().trim().replace(/\[.*\]/g, '')  //.text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n");
              $('.full .seealso_banner').each(function (i, elem) {
                text.replace($(this).text().trim(), '');
              })
              $('.full i').each(function (i, elem) {
                text.replace($(this).text().trim(), '');
              })
              let img = []
              img.push("https://www.vzsar.ru" + $('.newshead > img.img').attr('src'))
              $('.fancybox-slider > .fancybox-slide img').each(function (i, elem) {
                img.push("https://www.vzsar.ru" + $(this).attr('src'))
                console.log('suka')
              })
              res.push({title, text: JSON.stringify({text: text}), img: img || '' , url: "https://www.vzsar.ru", siteid: site.id, old: false})
            // } catch {console.log("poebatb")}
              
          }))
      } else if (site.name === "rostovgazeta") { // rostovgazeta
        $('.mx-auto > .mb-8 > a').each( (_i, el) => {
            const postTitle = $(el).attr('href')
            postTitles.push(postTitle?postTitle:"") 
          });
          await Promise.all(postTitles.map(async el => {
            // try {
              const { data } = await axios.get("https://rostovgazeta.ru" + el);
              const $ = cheerio.load(data);
              const title = $('.MatterTop_title__fNgrs').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ');
              let text = $('.Common_common__MfItd').text().trim().replace(/\[.*\]/g, '')  //.text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n");
              // $('.full .seealso_banner').each(function (i, elem) {
              //   text.replace($(this).text().trim(), '');
              // })
              // $('.full i').each(function (i, elem) {
              //   text.replace($(this).text().trim(), '');
              // })
              let img:string[] = []
              // img.push("https://www.vzsar.ru" + $('.newshead > img.img').attr('src'))
              $('.MatterTop_layer__c__zR').each(function (i, elem) {
                img.push("https://rostovgazeta.ru" + $(this).attr('src'))
                console.log('suka')
              })
              res.push({title, text: JSON.stringify({text: text}), img: img || '' , url: "https://rostovgazeta.ru", siteid: site.id, old: false})
            // } catch {console.log("poebatb")}
              
          }))
      } else if (site.name === "sarnovosti") { // sarnovosti
        $('.main-column > div .news-block__title').each( (_i, el) => {
            const postTitle = $(el).attr('href')
            postTitles.push(postTitle?postTitle:"") 
          });
          await Promise.all(postTitles.map(async el => {
            // try {
              const { data } = await axios.get("https://sarnovosti.ru" + el);
              const $ = cheerio.load(data);
              const title = $('.main-column > article > h1').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ');
              let text = $(".main-column > article > [itemprop = 'articleBody']").text().trim().replace(/\[.*\]/g, '')  //.text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n");
              // $('.full .seealso_banner').each(function (i, elem) {
              //   text.replace($(this).text().trim(), '');
              // })
              // $('.full i').each(function (i, elem) {
              //   text.replace($(this).text().trim(), '');
              // })
              let img:string[] = []
              // img.push("https://www.vzsar.ru" + $('.newshead > img.img').attr('src'))
              $('.main-column > article img').each(function (i, elem) {
                img.push("https://sarnovosti.ru" + $(this).attr('src'))
                console.log('suka')
              })
              res.push({title, text: JSON.stringify({text: text}), img: img || '' , url: "https://sarnovosti.ru", siteid: site.id, old: false})
            // } catch {console.log("poebatb")}
              
          }))
      }
    }))
    await prisma.post.createMany({
      data: res ,
      skipDuplicates: true
    })
	} catch (error) {
		throw error;
	}
};

async function send_news_groups() {
  const posts = await prisma.post.findMany({
    where: {
      old: false
    },
    include: {
      site: true
    }
  })
  await prisma.post.updateMany({
    where: {
      old: false
    },
    data: {
      old: true
    }
  })
  posts.reduce(async (memo, post) => {
    await memo;

    if (post.siteid === 1) { //омск 1 omskinform -1001911238782
      const chatId = "-1001911238782"
      await send_shit(post, chatId)
    } else if (post.siteid === 2) { // урал екб 1 -1001924665554
      const chatId = "-1001924665554"
      await send_shit(post, chatId)
    } else if (post.siteid === 3) { // саратов 1 -1001934213159
      const chatId = "-1001934213159"
      await send_shit(post, chatId)
    } else if (post.siteid === 4) { // rostov -1001956243574
      const chatId = "-1001956243574"
      await send_shit(post, chatId) 
    } else if (post.siteid === 5) { // rostov 2 -1001946671569
      const chatId = "-1001946671569"
      await send_shit(post, chatId) 
    }
    
    await delay(5 * 1000)

  }, Promise.resolve())
  
}

async function send_shit(post:any, chatId:any) {
  if (post.img.length > 0) {
    let res:MediaGroup = post.img.map((el:string) => {
      return {type: 'photo', media: el}
    })
    post.img.forEach((element:string) => {
      // res.push({type:'photo', media: element})
      
    });
    await bot.telegram.sendMediaGroup(chatId, res)
  } else {
    await bot.telegram.sendPhoto(chatId, post.img)
  }
  await delay(500)
  const jsontext = JSON.parse(post.text as string).text
  const text = (`${post.title}\n\n${jsontext}\n\n${post.url}`)
  if (text.length > 4096) {
    for (let i = 0; i < text.length; i += 4096) {
      await bot.telegram.sendMessage(chatId, text.slice(i, i + 4096), {disable_web_page_preview: true})
      await delay(500)
    }
  } else {
    await bot.telegram.sendMessage(chatId, text, {disable_web_page_preview: true})
    await delay(500)
  }
}

async function delete_old_news() {
  await prisma.post.deleteMany({
    where: {
      date: {
        lte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
      }
    }
  })
}

async function sheduler() {
  let isBusy = false
    setInterval(async () => {
      console.log('lul')
      if (!isBusy) {
        isBusy = true
        await getPostTitles()
        await send_news_groups()
        await delete_old_news()
        isBusy = false
      }
    }, 10 * 1000)
}

sheduler()

console.log("started bot")
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));