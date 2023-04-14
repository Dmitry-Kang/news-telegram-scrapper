import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import prisma from './utils/prisma'
import { Prisma } from '@prisma/client';
const axios = require('axios');
const cheerio = require('cheerio');
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
    // console.log(sites)
    const res:Prisma.PostCreateManyInput[]= []
    await Promise.all(sites.map(async site => {
      const { data } = await axios.get(
        site.url
      );
      const $ = cheerio.load(data);
      const postTitles: string[] = []

      // омск1 omskinform
      if (site.name === "omskinform") {
        $('.n_news > a').each(async (_idx: any, el: any) => {
            const postTitle = $(el).attr('href')
            postTitles.push(postTitle) 
          });
      
          await Promise.all(postTitles.map(async el => {
              const { data } = await axios.get(el);
              const $ = cheerio.load(data);
              const title = $('.n_cap_lnk_one').text().replace(/(\r\n|\n|\r|\t)/gm," ").trim().replace(/\s{2,}/g, ' ');
              const text = $('.n_text_lnk').text().replace(/(\r\n|\n|\r|\t)/gm," ").trim().replace(/\s{2,}/g, ' ');
              const img = $('.nt_img_handler img').attr('src')
              res.push({title, text, img: img || '' , url: el, siteid: site.id, old: false})
          }))
      }
    }))
    const asd = await prisma.post.createMany({
      data: res ,
      skipDuplicates: true
    })
    // console.log(asd)
		

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
      if (post.img.length > 0) {
        await bot.telegram.sendPhoto(chatId, post.img)
      }
      await delay(500)
      const text = (`${post.title}\n${post.text}`)
      if (text.length > 2048) {
        for (let i = 0; i < text.length; i += 2048) {
          await bot.telegram.sendMessage(chatId, text.slice(i, i + 2048), {disable_web_page_preview: true})
          await delay(500)
        }
      } else {
        await bot.telegram.sendMessage(chatId, `${post.title}\n${post.text}`, {disable_web_page_preview: true})
        await delay(500)
      }
      await bot.telegram.sendMessage(chatId, `${post.url}`, {disable_web_page_preview: true})
      await delay(500)
    }
    
    await delay(5 * 1000)

  }, Promise.resolve())
  
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
  while(true) {
    await getPostTitles()
    await send_news_groups()
    await delete_old_news()
    console.log('lul')

    await delay(60 * 1000)
  }
}

sheduler()

console.log("started bot")
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));