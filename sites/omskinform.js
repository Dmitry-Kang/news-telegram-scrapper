const axios = require('axios');
const cheerio = require('cheerio');


module.exports = async function getPosts(site, $) {
    const postTitles = []
    let res = []
    $('.n_news > a').each( (_i , el ) => {
      const postTitle = $(el).attr('href')
      postTitles.push(postTitle?postTitle:"") 
    });
    await Promise.all(postTitles.map(async (sitepost) => {
      try {
        const { data } = await axios.get(sitepost);
        const $ = cheerio.load(data);
        const title = $('.n_cap_lnk_one').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ').trim();
        let text = $('.n_text_lnk > p').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n").trim();
        
        let img = [];
        $('.nt_img_handler img').each(function (i, elem) {
          const el = $(this).attr('src')
          if (!!el) {
            img.push(el)
          }
        })
        let video = [];
        $('.n_text_lnk > div > iframe').each(function (i, elem) {
          const el = $(this).attr('src')
          if (!!el) {
            video.push(el)
          }
        })
        $('.n_text_lnk > p > iframe').each(function (i, elem) {
          const el = $(this).attr('src')
          if (!!el) {
            video.push(el)
          }
        })
        res.push({title, text: JSON.stringify({text: text}), img: img, video: video, url: sitepost, istochnik:`Источник: omskinform.ru`, siteid: site.id, old: false})

      } catch {
        console.log("poebatb")
      }
    }))
    return res
      
}
