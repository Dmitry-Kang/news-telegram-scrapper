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
const getPostsFromInkazan = require('./sites/inkazan');
const getPostsFromNewsnn = require('./sites/newsnn');
const getPostsFromNnov = require('./sites/nnov');
const getPostsFromKuban = require('./sites/kuban');
const getPostsFromKazan = require('./sites/kazan');
dotenv.config();

const debug = Boolean(process.env.DEBUG)
console.log("Debug:", debug)

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
      if (site.name == "omskinform") { // омск1 omskinform
        Array.prototype.push.apply(res, await getPostsFromOmskInform(site, all_posts, bot))
      } else if (site.name == "uralweb") { // ural
        Array.prototype.push.apply(res, await getPostsFromUralWeb(site, all_posts, bot))
      } else if (site.name == "vzsar") { // vzsar
        Array.prototype.push.apply(res, await getPostsFromVzsar(site, all_posts, bot))
      } else if (site.name == "rostovgazeta") { // rostovgazeta
        Array.prototype.push.apply(res, await getPostsFromRostovGazeta(site, all_posts, bot))
      } else if (site.name == "sarnovosti") { // sarnovosti
        Array.prototype.push.apply(res, await getPostsFromSarnovosti(site, all_posts, bot))
      } else if (site.name == "inkazan") { // inkazan
        Array.prototype.push.apply(res, await getPostsFromInkazan(site, all_posts, bot))
      } else if (site.name == "newsnn") { // newsnn
        Array.prototype.push.apply(res, await getPostsFromNewsnn(site, all_posts, bot))
      } else if (site.name == "nnov") { // nnov
        Array.prototype.push.apply(res, await getPostsFromNnov(site, all_posts, bot))
      } else if (site.name == "kuban") { // kuban
        Array.prototype.push.apply(res, await getPostsFromKuban(site, all_posts, bot))
      } else if (site.name == "kazan") { // kazan
        Array.prototype.push.apply(res, await getPostsFromKazan(site, all_posts, bot))
      }
      console.log('1:',site, "finish")
    }))
    await prisma.post.createMany({
      data: res,
      skipDuplicates: true
    })
	} catch (e) {
    await delay(1000)
    await bot.telegram.sendMessage(process.env.DEVELOPER_ID, `getPostTitles: ${String(e)}`, {disable_web_page_preview: true})
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
    try {
      if (post.siteid === 1) { // омск omskinform -1001911238782
        chatId = "-1001911238782"
      } else if (post.siteid === 2) { // урал екб uralweb 1 -1001924665554
        chatId = "-1001924665554"
      } else if (post.siteid === 3) { // саратов vzsar -1001934213159
        chatId = "-1001934213159"
      } else if (post.siteid === 4) { // rostov rostovgazeta -1001956243574
        chatId = "-1001956243574"
      } else if (post.siteid === 5) { // saratov sarnovosti -1001946671569
        chatId = "-1001946671569"
      } else if (post.siteid === 6) {// inkazan -1002010869886
        chatId = "-1002010869886"
      } else if (post.siteid === 7) {// newsnn -1002025231170
        chatId = "-1002025231170"
      } else if (post.siteid === 8) { // kuban.kp -1001915461330
        chatId = "-1001915461330"
      } else if (post.siteid === 9) { // kazan.kp -1002120245961
        chatId = "-1002120245961"
      } else if (post.siteid === 10) { // nnov.kp -1002104369856
        chatId = "-1002104369856"
      } 
      await send_shit(post, chatId)
      await delay(5 * 1000)
    } catch(e) {
      await delay(1000)
      await bot.telegram.sendMessage(process.env.DEVELOPER_ID, `send_news_groups: ${String(e)}\n${String(e.message)}\n\nchatid: ${chatId}\n\npost: ${post}`, {disable_web_page_preview: true})
    }
  }, Promise.resolve())
  
}

async function send_shit(post, chatId) {
  await delay(30000)

  await bot.telegram.sendMessage(chatId, `⭐️Пост ${post.id}\n\n${post.url}`, {disable_web_page_preview: true}) // айди поста
  await delay(1000)

  // фото или видео
  if (post.img.length > 0) { 
    await delay(5000)
    const imgLeng = Math.min(post.img.length, 10) // высылать именно картинками
    let res = []
    for (let i = 0; i < imgLeng; i++) {
      res.push({type: 'photo', media: post.img[i]})
    }
    await bot.telegram.sendMediaGroup(chatId, res)
    // const images = post.img.join("\n")
    // const images_text = `Картинки:\n${images}`
    // await send_long_msg(chatId, images_text)
    await delay(10000)
  } 
  if (post.video.length > 0) {
    const videos = post.video.join("\n")
    const videos_text = `Видео:\n${videos}`
    await send_long_msg(chatId, videos_text)
  }
  await delay(1000)

  const jsontext = JSON.parse(post.text).text // заголовок, текст, ссылка и источник
  const text = (`${post.title}\n\n${jsontext}${post.istochnik}`)
  await send_long_msg(chatId, text)
}

async function send_long_msg(chatId, text) {
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

async function sheduler() {
  let isBusy = false
  if (debug) {
    try {
      console.log('lul')
      console.log('1')
      await getPostTitles()
      console.log('2')
      await send_news_groups()
      console.log('3')
      await delete_old_news()
      console.log('4')
    } catch(e) {
      await delay(1000)
      await bot.telegram.sendMessage(process.env.DEVELOPER_ID, `sheduler: ${String(e)}\n${String(e.message)}`, {disable_web_page_preview: true})
    }
  } else {
    setInterval(async () => {
      try {
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
      } catch(e) {
        isBusy = false
        await delay(1000)
        await bot.telegram.sendMessage(process.env.DEVELOPER_ID, `sheduler: ${String(e)}\n${String(e.message)}`, {disable_web_page_preview: true})
      }
      
    }, 60 * 1000)
  }
}

sheduler()

console.log("started bot")
bot.launch({
  retry: {
      limit: Infinity,
      interval: 1000,
      // Функция, которая определяет, следует ли повторять попытку
      condition: () => true
  }
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));