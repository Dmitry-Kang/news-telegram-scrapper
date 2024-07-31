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
    $('.mx-auto > .mb-8 > a').each( (_i , el ) => {
      const postTitle = $(el).attr('href')
      if (all_posts.filter(el => el.url == "https://rostovgazeta.ru" + postTitle).length < 1) {
        postTitles.push(postTitle?postTitle:"")
      }
    });
    await postTitles.reduce(async (memo, sitepost) => {
      await memo
      try {
        const { data } = await axios.get("https://rostovgazeta.ru" + sitepost);
        const $ = cheerio.load(data);
        const title = $(".MatterTop_title__fNgrs").text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ').trim();

        let text = "";
        $(".leading-relaxed.font-semibold").each(function (i, elem) {
          text += $(this).text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n") + '\n\n';
        });
        $(".Common_common__MfItd > p").each(function (i, elem) {
          text += $(this).text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n") + '\n\n';
        });
        text = text.replace(/\s{2,}/gm,"\n\n") 
        
        let img = ["https://rostovgazeta.ru" + $(".MatterTop_layer__c__zR").first().attr("src")]; // todo только первый потомушто картинка это бекграунд и больше нету

        res.push({
          title,
          text: JSON.stringify({ text: text }),
          img: img, 
          video: [],
          url: "https://rostovgazeta.ru" + sitepost,
          istochnik:`Источник: Ростов Газета\nФото: Ростов Газета\n\nНовости без цензуры (18+) в нашем телеграм-канале 👉 https://t.me/+3qGy4IiXLpBhMDVi`,
          siteid: site.id,
          old: false,
        });

      } catch(e) {
        await delay(1000)
        await bot.telegram.sendMessage(process.env.DEVELOPER_ID, `rostovgazeta: https://rostovgazeta.ru${sitepost} ${String(e)}`, {disable_web_page_preview: true})
      }
      await delay(1 * 1000)
    }, Promise.resolve())
    return res
  } catch(e) {
    await delay(1000)
    await bot.telegram.sendMessage(process.env.DEVELOPER_ID, `rostovgazeta: ${site} ${String(e)}`, {disable_web_page_preview: true})
  }  
      
}
