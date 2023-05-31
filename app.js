const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');
const prisma = require('./utils/prisma');
const axios = require('axios');
const cheerio = require('cheerio');
const getPostsFromOmskInform = require('./sites/omskinform');
const getPostsFromUralWeb = require('./sites/uralweb');
const getPostsFromVzsar = require('./sites/vzsar');
const getPostsFromRostovGazeta = require('./sites/rostovgazeta');
const getPostsFromSarnovosti = require('./sites/sarnovosti');
dotenv.config();

let options = {
  channelMode: true    // Handle `channel_post` updates as messages (optional)
}

const bot = new Telegraf(process.env.TELEGRAM_TOKEN || '', options);

function delay(ms) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

async function getPostTitles() {
	try {
    const sites = await prisma.site.findMany();
    const all_posts = await prisma.post.findMany();
    let res = [];
    await Promise.all(sites.map(async site => {
      console.log('1:',site)
      if (site.name === "omskinform") { // омск1 omskinform
        res = await getPostsFromOmskInform(site, all_posts)
      } else if (site.name === "uralweb") { // ural
        res = await getPostsFromUralWeb(site, all_posts)
      } else if (site.name === "vzsar") { // vzsar
        res = await getPostsFromVzsar(site, all_posts)
      } else if (site.name === "rostovgazeta") { // rostovgazeta
        res = await getPostsFromRostovGazeta(site, all_posts)
      } else if (site.name === "sarnovosti") { // sarnovosti
        res = await getPostsFromSarnovosti(site, all_posts)
      }
      console.log('1:',site, "finish")
    }))
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
  await posts.reduce(async (memo, post) => {
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

async function send_shit(post, chatId) {
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

  const jsontext = JSON.parse(post.text).text // заголовок, текст, ссылка и источник
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
        lte: new Date(new Date().getTime() - 21 * 24 * 60 * 60 * 1000)
      }
    }
  })
}

function sheduler() {
  let isBusy = false

  setInterval(async () => {
    if (!isBusy) {
      console.log('lul')
      isBusy = true
      console.log('1')
      await getPostTitles()
      console.log('2')
      await send_news_groups()
      console.log('3')
      await delete_old_news()
      console.log('4')
      isBusy = false
    } else {
      console.log('not lul')
    }
  }, 60 * 1000)
}

sheduler()

console.log("started bot")
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));