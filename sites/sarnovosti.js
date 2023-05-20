const axios = require('axios');
const cheerio = require('cheerio');


module.exports = async function getPosts(site, $) {
    const postTitles = []
    let res = []
    $('.main-column > div .news-block__title').each( (_i , el ) => {
      const postTitle = $(el).attr('href')
      postTitles.push(postTitle?postTitle:"") 
    });
    await Promise.all(postTitles.map(async (sitepost) => {
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
          istochnik:`Источник: sarnovosti.ru`,
          siteid: site.id,
          old: false,
        });

      } catch {
        console.log("poebatb")
      }
    }))
    return res
      
}
