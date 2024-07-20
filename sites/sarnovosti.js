const axios = require('axios');
const cheerio = require('cheerio');
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
    $('.main-column > div .news-block__title').each( (_i , el ) => {
      const postTitle = $(el).attr('href')
      if (all_posts.filter(el => el.url == "https://sarnovosti.ru" + postTitle).length < 1) {
        postTitles.push(postTitle?postTitle:"")
      }
    });
    await postTitles.reduce(async (memo, sitepost) => {
      await memo
      try {
        const { data } = await axios.get("https://sarnovosti.ru" + sitepost);
        const $ = cheerio.load(data);
        const title = $(".main-column > article > h1").text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ').trim();

        let text = "";
        $(".main-column > article > [itemprop = 'articleBody']").each(function (i, elem) {
          text += $(this).text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n") + '\n\n';
        });
        text = text.replace(/\s{2,}/gm,"\n\n") 
        
        let img = [];
        $(".main-column > article > img").each(function (i, elem) {
          img.push("https://sarnovosti.ru" + $(this).attr("src"));
        });
        $(".gallery-wrapper > .gallery-top > .swiper-wrapper > .swiper-slide > img").each(function (i, elem) {
          img.push("https://sarnovosti.ru" + $(this).attr("src"));
        });
        

        let video = [];
        $(".main-column > article > [itemprop = 'articleBody'] > .iframe > iframe").each(function (i, elem) {
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
          url: "https://sarnovosti.ru" + sitepost,
          istochnik:`Источник: регион64`,
          siteid: site.id,
          old: false,
        });

      } catch(e) {
        await delay(1000)
        await bot.telegram.sendMessage(process.env.DEVELOPER_ID, `sarnovosti: https://sarnovosti.ru${sitepost} ${String(e)}`, {disable_web_page_preview: true})
      }
      await delay(1 * 1000)
    }, Promise.resolve())
    return res
  } catch(e) {
    await delay(1000)
    await bot.telegram.sendMessage(process.env.DEVELOPER_ID, `sarnovosti: ${site} ${String(e)}`, {disable_web_page_preview: true})
  }  
}
