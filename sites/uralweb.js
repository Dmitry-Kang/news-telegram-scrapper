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
    $('.news-box li .last-nn-box h3 > a').each( (_i , el ) => {
      const postTitle = $(el).attr('href')
      if (all_posts.filter(el => el.url == "https://www.uralweb.ru" + postTitle).length < 1) {
        postTitles.push(postTitle?postTitle:"")
      }
    });
    await postTitles.reduce(async (memo, sitepost) => {
      await memo
      try {
        const { data } = await axios.get("https://www.uralweb.ru" + sitepost);
        const $ = cheerio.load(data);
        const title = $(".clearfix .ni-htext h1").text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ').trim();

        let text = ""; // тест до картинки
        $(".n-ict.clearfix > p, .n-ict.clearfix > blockquote > p").each(function (i, elem) {
          text += $(this).text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n") + '\n\n';
        });
        text = text.replace(/\s{2,}/gm,"\n\n") 
        
        let img = [];
        $(".ni-bimg > img").each(function (i, elem) {
          img.push("https:" + $(this).attr("src"));
        });
        $(".noted-img > img").each(function (i, elem) { // todo не ебу почему не работает. возможно он подгружается при скроле
          console.log("pls")
          img.push("https:" + $(this).attr("src"));
        });

        let video = [];
        $('.youtube-player.video-player > iframe').each(function (i, elem) {
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
          url: "https://www.uralweb.ru" + sitepost,
          istochnik:`Источник: uralweb\nФото: uralweb\n\nНовости без цензуры (18+) в нашем телеграм-канале 👉 https://t.me/+4jjL37T7Q0IxODVi`,
          siteid: site.id,
          old: false,
        });

      } catch(e) {
        await delay(1000)
        await bot.telegram.sendMessage(process.env.DEVELOPER_ID, `uralweb: https://www.uralweb.ru${sitepost} ${String(e)}`, {disable_web_page_preview: true})
      }
      await delay(1 * 1000)
    }, Promise.resolve())
    return res
  } catch(e) {
    await delay(1000)
    await bot.telegram.sendMessage(process.env.DEVELOPER_ID, `uralweb: ${site} ${String(e)}`, {disable_web_page_preview: true})
  }  
}
