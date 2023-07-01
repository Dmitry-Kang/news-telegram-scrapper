const axios = require('axios');
const cheerio = require('cheerio');

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
    $('.n_news > a').each( (_i , el ) => {
      const postTitle = $(el).attr('href')
      if (all_posts.filter(el => el.url == postTitle).length < 1) {
        postTitles.push(postTitle?postTitle:"")
      }
       
    });
    await postTitles.reduce(async (memo, sitepost) => {
      await memo
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
        res.push({
          title, 
          text: JSON.stringify({text: text}), 
          img: img, 
          video: video, 
          url: sitepost, 
          istochnik:`\n\nИсточник: omskinform.ru`, 
          siteid: site.id, 
          old: false
        })

      } catch(e) {
        await delay(1000)
        await bot.telegram.sendMessage(process.env.DEVELOPER_ID, `Omskinform: ${sitepost} ${String(e)}`, {disable_web_page_preview: true})
      }
      await delay(1 * 1000)
    }, Promise.resolve())
    return res
  } catch(e) {
    await delay(1000)
    await bot.telegram.sendMessage(process.env.DEVELOPER_ID, `Omskinform: ${site} ${String(e)}`, {disable_web_page_preview: true})
  }   
}
