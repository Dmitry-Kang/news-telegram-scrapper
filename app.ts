import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import dotenv from 'dotenv';
import prisma from './utils/prisma'
dotenv.config();


const bot = new Telegraf(process.env.TELEGRAM_TOKEN || '');

bot.command('start', async (ctx) => {
  const telegram_id = ctx.from.id
  const name = ctx.from.username || ''
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
      },
    });
  
    ctx.reply('Welcome!');
});

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

async function f() {
  while(true) {
    await delay(1000);
    console.log("lel")
  }
}

f()

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));