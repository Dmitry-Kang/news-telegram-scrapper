import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import prisma from './utils/prisma'
const axios = require('axios');
const cheerio = require('cheerio');
dotenv.config();


const bot = new Telegraf(process.env.TELEGRAM_TOKEN || '');

bot.command('start', async (ctx) => {
  const telegram_id = ctx.from.id
  console.log(ctx.from)
  let name = ctx.from.username
  if(name === undefined) {
    name = (ctx.from.first_name + " " + ctx.from.last_name).trim()
  }
  await prisma.user.upsert({
    where: { 
      telegramId: telegram_id 
    },
    update: { 
      telegramName: name 
    },
    create: {
      telegramId: telegram_id,
      telegramName: name,
      subscribed: false,
      role: "user"
    },
  });
  
    ctx.reply('Welcome!');
});

bot.command('addsite', async (ctx) => {
  const telegram_id = ctx.from.id

  const user = await prisma.user.findFirst({
    where: {
      telegramId: telegram_id
    }
  })

  if(user === undefined || user?.role != "admin") {
    return
  }

  const args = ctx.message.text.split(' ')

  const name = args[1]

  const url = args[2]

  await prisma.site.create({
    data: {
      name: name,
      url: url,
      lastPost: "0"
    }
  });
  
    ctx.reply(`Added site ${name}!`);
});

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

interface ISite {
  title: string,
  text: string,
  img: string,
  url: string,
  siteid: number,
  old: number[]
}

async function getPostTitles() {
	try {
    const sites = await prisma.site.findMany();
    // console.log(sites)
    const res: ISite[] = []
    await Promise.all(sites.map(async site => {
      const { data } = await axios.get(
        site.url
      );
      const $ = cheerio.load(data);
      const postTitles: string[] = []
      $('.n_news > a').each(async (_idx: any, el: any) => {
        const postTitle = $(el).attr('href')
        postTitles.push(postTitle) 
      });
  
      await Promise.all(postTitles.map(async el => {
          const { data } = await axios.get(el);
          const $ = cheerio.load(data);
          const title = $('.n_cap_lnk_one').text()
          const text = $('.n_text_lnk').text().replace('\\n', '').replace('\\t', '')
          const img = $('.nt_img_handler img').attr('src')
          res.push({title, text, img: img || '' , url: el, siteid: site.id, old: []})
      }))
    }))
    const asd = await prisma.post.createMany({
      data: res,
      skipDuplicates: true
    })
    // console.log(asd)
		

	} catch (error) {
		throw error;
	}
};

async function f2() {
  const users = await prisma.user.findMany({
    include: {
      sites: true
    }
  })

  users.map(async user => {
    const posts = await prisma.post.findMany({
      where: {
        NOT: {
          old: {
            hasEvery: [user.id]
          }
        }
      },
      include: {
        site: true
      }
    })
    // console.log(posts)
    const userSiteIds = user.sites.map(site => site.siteid)
    const postsToSend = posts.filter(post => userSiteIds.includes(post.siteid))
    postsToSend.reduce(async (memo, post) => {
      await memo;
      await bot.telegram.sendMessage(user.telegramId, `Новость ${post.url}`, {disable_web_page_preview: true})
      await delay(100)
      if (post.img.length > 0) {
        await bot.telegram.sendPhoto(user.telegramId, post.img)
      }
      await delay(100)
      const text = (`${post.title}\n${post.text}`)
      if (text.length > 1024) {
        for (let i = 0; i < text.length; i += 1024) {
          await bot.telegram.sendMessage(user.telegramId, text.slice(i, i + 1024), {disable_web_page_preview: true})
          await delay(100)
        }
      } else {
        await bot.telegram.sendMessage(user.telegramId, `${post.title}\n${post.text}`, {disable_web_page_preview: true})
        await delay(100)
      }
      await delay(5 * 1000)
      await prisma.post.update({
        where: {
          id: post.id
        },
        data: {
          old: {
            push: user.id
          }
        }
      })

    }, Promise.resolve())
  })
}

async function f3() {
  await prisma.post.deleteMany({
    where: {
      date: {
        lte: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000)
      }
    }
  })
}

async function f() {
  while(true) {
    await getPostTitles()
    console.log('lul')

    await f2()
    await f3()
    await delay(60 * 1000)
  }
}

f()
console.log("started bot")
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));