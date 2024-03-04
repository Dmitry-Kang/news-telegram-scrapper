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
    $('[itemtype="http://schema.org/NewsArticle"] a').each( (_i , el ) => {
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
        const title = $('main > div[class*=\'-desktop\'] [itemprop="headline"] > a').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ').trim();
        // const subTitle = $('main > div[class*=\'-desktop\'] [itemprop="headline"] > a').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ').trim();
        let text = $('main > div[class*=\'-desktop\'] [itemprop="articleBody"] > p, main > div[class*=\'-desktop\'] [itemprop="articleBody"] > blockquote > p, main > div[class*=\'-desktop\'] [itemprop="articleBody"] > div').text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n").trim();
        
        let img = [];
        $('main > div[class*=\'-desktop\'] [itemprop="articleBody"] img').each(function (i, elem) {
          const el = $(this).attr('src')
          if (!!el) {
            if (img.filter(elem => elem == el).length < 1) {
              img.push(el)
            }
          }
        })
        let video = [];
        $('main > div[class*=\'-desktop\'] [itemprop="articleBody"] iframe').each(function (i, elem) {
          const el = $(this).attr('src')
          if (!!el) {
            if (video.filter(elem => elem == el).length < 1) {
              video.push(el)
            }
          }
        })
        // $('.n_text_lnk > p > iframe').each(function (i, elem) {
        //   const el = $(this).attr('src')
        //   if (!!el) {
        //     video.push(el)
        //   }
        // })
        res.push({
          title, 
          text: JSON.stringify({text: text}), 
          img: img, 
          video: video, 
          url: sitepost, 
          istochnik:`\n\nНовости без цензуры (18+) в нашем телеграм-канале t.me/+AKYwBOwDQpY3ZGIy`, 
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

// (async() => {
//   const res = await getPosts()
// })