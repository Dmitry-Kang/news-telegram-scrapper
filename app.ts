import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import prisma from './utils/prisma'
import { Prisma } from '@prisma/client';
import axios from 'axios';
import cheerio, { Cheerio } from 'cheerio';
import { MediaGroup } from 'telegraf/typings/telegram-types';
import getPostsFromOmskInform from './sites/omskinform'
import getPostsFromUralWeb from './sites/uralweb'
import getPostsFromVzsar from './sites/vzsar'
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
    let res:Prisma.PostCreateManyInput[] = [];
    await Promise.all(sites.map(async site => {
      const { data } = await axios.get(
        site.url
      );
      const $ = cheerio.load(data);
      

      // омск1 omskinform
      if (site.name === "omskinform") {
        // res = await getPostsFromOmskInform(site, $)
      } else if (site.name === "uralweb") { // ural
        // res = await getPostsFromUralWeb(site, $)
      } else if (site.name === "vzsar") { // vzsar
        res = await getPostsFromVzsar(site, $)
      } else if (site.name === "rostovgazeta") { // rostovgazeta
        // $('.mx-auto > .mb-8 > a').each( (_i, el) => {
        //     const postTitle = $(el).attr('href')
        //     postTitles.push(postTitle?postTitle:"") 
        //   });
        //   await Promise.all(postTitles.map(async el => {
        //     // try {
        //       const { data } = await axios.get("https://rostovgazeta.ru" + el);
        //       const $ = cheerio.load(data);
        //       const title = $('.MatterTop_title__fNgrs').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ');
        //       let text = $('.Common_common__MfItd').text().trim().replace(/\[.*\]/g, '')  //.text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n");
        //       // $('.full .seealso_banner').each(function (i, elem) {
        //       //   text.replace($(this).text().trim(), '');
        //       // })
        //       // $('.full i').each(function (i, elem) {
        //       //   text.replace($(this).text().trim(), '');
        //       // })
        //       let img:string[] = []
        //       // img.push("https://www.vzsar.ru" + $('.newshead > img.img').attr('src'))
        //       $('.MatterTop_layer__c__zR').each(function (i, elem) {
        //         img.push("https://rostovgazeta.ru" + $(this).attr('src'))
        //         console.log('suka')
        //       })
        //       res.push({title, text: JSON.stringify({text: text}), img: img || '' , url: "https://rostovgazeta.ru", siteid: site.id, old: false})
        //     // } catch {console.log("poebatb")}
              
        //   }))
      } else if (site.name === "sarnovosti") { // sarnovosti
        // $('.main-column > div .news-block__title').each( (_i, el) => {
        //     const postTitle = $(el).attr('href')
        //     postTitles.push(postTitle?postTitle:"") 
        //   });
        //   await Promise.all(postTitles.map(async el => {
        //     // try {
        //       const { data } = await axios.get("https://sarnovosti.ru" + el);
        //       const $ = cheerio.load(data);
        //       const title = $('.main-column > article > h1').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ');
        //       let text = $(".main-column > article > [itemprop = 'articleBody']").text().trim().replace(/\[.*\]/g, '')  //.text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n");
        //       // $('.full .seealso_banner').each(function (i, elem) {
        //       //   text.replace($(this).text().trim(), '');
        //       // })
        //       // $('.full i').each(function (i, elem) {
        //       //   text.replace($(this).text().trim(), '');
        //       // })
        //       let img:string[] = []
        //       // img.push("https://www.vzsar.ru" + $('.newshead > img.img').attr('src'))
              // $('.main-column > article img').each(function (i, elem) {
              //   img.push("https://sarnovosti.ru" + $(this).attr('src'))
              //   console.log('suka')
              // })
        //       res.push({title, text: JSON.stringify({text: text}), img: img || '' , url: "https://sarnovosti.ru", siteid: site.id, old: false})
        //     // } catch {console.log("poebatb")}
              
        //   }))
      }
    }))
    // console.log(res)
    await prisma.post.createMany({
      data: res,
      skipDuplicates: true
    })
	} catch (error) {
    console.log('ree')
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
    let chatId;
    if (post.siteid === 1) { //омск 1 omskinform -1001911238782
      chatId = "-1001911238782"
    } else if (post.siteid === 2) { // урал екб 1 -1001924665554
      chatId = "-1001924665554"
    } else if (post.siteid === 3) { // саратов 1 -1001934213159
      chatId = "-1001934213159"
    } else if (post.siteid === 4) { // rostov -1001956243574
      chatId = "-1001956243574"
    } else if (post.siteid === 5) { // rostov 2 -1001946671569
      chatId = "-1001946671569"
    }
    await send_shit(post, chatId)
    await delay(5 * 1000)

  }, Promise.resolve())
  
}

async function send_shit(post:any, chatId:any) {
  await bot.telegram.sendMessage(chatId, `Пост ${post.id}`, {disable_web_page_preview: true}) // айди поста
  await delay(1000)

  if (post.img.length > 0) { // фото или видео
    // let res:MediaGroup = post.img.map((el:string) => { // высылать именно картинками
    //   return {type: 'photo', media: el}
    // })
    // await bot.telegram.sendMediaGroup(chatId, res)
    const images = post.img.join("\n")
    await bot.telegram.sendMessage(chatId, `Картинки:\n${images}`, {disable_web_page_preview: true})
  } 
  await delay(1000)
  if (post.video.length > 0) {
    const videos = post.video.join("\n")
    await bot.telegram.sendMessage(chatId, `Видео:\n${videos}`, {disable_web_page_preview: true})
  }
  await delay(1000)

  const jsontext = JSON.parse(post.text as string).text // заголовок, текст, ссылка и источник
  const text = (`${post.title}\n\n${jsontext}\n\n${post.url}\n\n${post.istochnik}`)
  if (text.length > 4096) {
    for (let i = 0; i < text.length; i += 4096) {
      await bot.telegram.sendMessage(chatId, text.slice(i, i + 4096), {disable_web_page_preview: true})
      await delay(1000)
    }
  } else {
    await bot.telegram.sendMessage(chatId, text, {disable_web_page_preview: true})
    await delay(1000)
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