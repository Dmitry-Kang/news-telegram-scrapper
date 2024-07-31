const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const checkShit = require('../utils/utils')

function delay(ms) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

module.exports = async function getPosts(site, all_posts, bot) {
  try {
  const { data } = await axios.get(
    site.url
  );
  const $ = cheerio.load(data);
    const postTitles = []
    let res = []
    $('.newslist > a').each( (_i , el ) => {
      const postTitle = $(el).attr('href')
      if (all_posts.filter(el => el.url == 'https://www.vzsar.ru' + postTitle).length < 1) {
        postTitles.push(postTitle?postTitle:"")
      }
    });
    await postTitles.reduce(async (memo, sitepost) => {
      await memo
      try {
        const response = await axios.get('https://www.vzsar.ru' + sitepost, { responseType: 'arraybuffer' });
        const data = iconv.decode(response.data, 'win1251'); // блядская адская поебота
        const $ = cheerio.load(data);

        const title = $('.newshead h1').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ');

        let text = ""
        $('.full > p').each(function (i, elem) {
          const toAdd = $(this).text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, '\n\n') + '\n\n';
          if (!toAdd.includes('Материал подготовил') && !toAdd.includes('Подпишитесь на телеграм-канал')) {
            text += $(this).text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, '\n\n') + '\n\n';
          }
        })
        text = text.replace(/\s{2,}/gm,"\n\n") 

        let img = []
        $('.newshead > img.img').each(function (i, elem) {
          img.push("https://www.vzsar.ru" + $(this).attr('src'))
        })
        $('.gallery > .mainImg > a').each(function (i, elem) {
          img.push("https://www.vzsar.ru" + $(this).attr('href'))
        })
        $('.gallery > .scrollImg > .thumb > .over > a').each(function (i, elem) {
          img.push("https://www.vzsar.ru" + $(this).attr('href'))
        })
        res.push({
          title,
          text: JSON.stringify({ text: text }),
          img: img, 
          video: [], // todo не нашел новостей с видео
          url: "https://vzsar.ru" + sitepost,
          istochnik:`Источник: взгляд инфо\nФото: взгляд инфо\n\nНовости без цензуры (18+) в нашем телеграм-канале 👉 https://t.me/+0zrzqRdwUNcxODcy`,
          siteid: site.id,
          old: false,
        });

      } catch(e) {
        await delay(1000)
        await bot.telegram.sendMessage(process.env.DEVELOPER_ID, `vzsar: https://www.vzsar.ru${sitepost} ${String(e)}`, {disable_web_page_preview: true})
      }
      await delay(1 * 1000)
    }, Promise.resolve())
    return res
  } catch(e) {
    await delay(1000)
    await bot.telegram.sendMessage(process.env.DEVELOPER_ID, `vzsar: ${site} ${String(e)}`, {disable_web_page_preview: true})
  } 
}
