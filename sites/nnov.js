const axios = require('axios');
const cheerio = require('cheerio');
const checkShit = require('../utils/utils')

function delay(ms) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

module.exports = async function getPosts(site, all_posts, bot) { // todo module exports
  try {
    const { data } = await axios.get(
      site.url
    );
    const $ = cheerio.load(data);
    const postTitles = []
    let res = []
    $('.sc-1tputnk-13.ixDVFm > div > a.sc-1tputnk-2').each( (_i , el ) => {
      const postTitle = $(el).attr('href')
      if (postTitle && all_posts.filter(el => el.url == "https://www.nnov.kp.ru" + postTitle).length < 1) {
        postTitles.push(postTitle)
      }
    });
    await postTitles.reduce(async (memo, sitepost) => {
      await memo
      try {
        const { data } = await axios.get("https://www.nnov.kp.ru" + sitepost);
        const $ = cheerio.load(data);
        const title = $(".sc-j7em19-3.eyeguj").text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ').trim();
        let ignorePost = false
        let text = "";
        $(".sc-j7em19-4.nFVxV").each(function (i, elem) {
          const textForCheck = $(this).text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n")
          const checkedtext = checkShit(textForCheck)
          ignorePost = checkedtext.ignoreNext

          if (checkedtext.toPost && !ignorePost) {
            text += textForCheck + '\n\n';
          }
        });
        $("p.sc-1wayp1z-16.dqbiXu").each(function (i, elem) {
          const textForCheck = $(this).text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/gm,"\n\n")
          const checkedtext = checkShit(textForCheck)
          ignorePost = checkedtext.ignoreNext

          if (checkedtext.toPost && !ignorePost) {
            text += textForCheck + '\n\n';
          }
        });
        text = text.replace(/\s{2,}/gm,"\n\n") 
        
        let img = [$(".sc-1wayp1z-2.bqNMcR .sc-foxktb-1.cYprnQ").first().attr("src")]; // todo только первый потомушто картинка это бекграунд и больше нету

        res.push({
          title,
          text: JSON.stringify({ text: text }),
          img: img, 
          video: [],
          url: "https://www.nnov.kp.ru" + sitepost,
          istochnik:`Источник: Комсомольская Правда\nФото: Комсомольская Правда`,
          siteid: site.id,
          old: false,
        });

      } catch(e) {
        console.log(e)
        // await delay(1000)
        // await bot.telegram.sendMessage(process.env.DEVELOPER_ID, `uralweb: https://www.uralweb.ru${sitepost} ${String(e)}`, {disable_web_page_preview: true})
      }
      await delay(1 * 1000)
    }, Promise.resolve())
    return res
  } catch(e) {
    console.log(e)
    await delay(1000)
    // await bot.telegram.sendMessage(process.env.DEVELOPER_ID, `uralweb: ${site} ${String(e)}`, {disable_web_page_preview: true})
  }  
}

// (async() => {
//     await getPosts({url: "https://inkazan.ru"}, [])
// })()
