const axios = require('axios');
const cheerio = require('cheerio');

function delay(ms) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

async function getPosts(site, all_posts, bot) { // todo module exports
  try {
    const { data } = await axios.get(
      site.url
    );
    const $ = cheerio.load(data);
    const postTitles = []
    let res = []
    $('.mb-8 > a').each( (_i , el ) => {
      const postTitle = $(el).attr('href')
      if (all_posts.filter(el => el.url == "https://inkazan.ru" + postTitle).length < 1) {
        postTitles.push(postTitle?postTitle:"")
      }
    });
    await postTitles.reduce(async (memo, sitepost) => {
      await memo
      try {
        let title, text = "", imgs = [], video = []
        const { data } = await axios.get("https://inkazan.ru" + sitepost);
        const $ = cheerio.load(data);
        // title
        title = $("[class*='MatterTopNoImage_title__'] > h1").text().trim()
        if (title.length < 1) {
          title = $("[class*='MatterTop_title__'] > h1").text().trim();
        }
        console.log("title", title)

        // text
        // подзаголовок 1
        text += $(".mb-4.leading-tight.font-bold").text().trim() + "\n";
        // подзаголовок 2
        text += $(".leading-relaxed.font-semibold.mb-8").text().trim() + "\n\n";
        // основной текст
        $(".relative.desktop-cols-3 > div:nth-child(2) > div:nth-last-child(3) > div").each(function (i, elem) {
          const textToAdd = $(this).text().trim();
          if (!textToAdd.includes("Узнать подробнее") && !textToAdd.includes("Видео: ") && !textToAdd.includes("Фото: ")) {
            text += textToAdd + '\n'
          }
        });
        console.log("text", text)

        // imgs
        // одиночные фотки 
        $("[class*='rounded-'].overflow-hidden:not(.relative)").each(function (i, elem) {
          const src = $(this).find("div > img:nth-child(1)").attr("src");
          imgs.push("https://inkazan.ru" + src)
        });
        // галереи
        $(".Gallery_gallery__mIMu7 > div:nth-child(1) > div > div").each(function (i, elem) {
          const src = $(this).find("div > img:nth-child(1)").attr("src");
          imgs.push("https://inkazan.ru" + src)
        });
        console.log("imgs", imgs)

        res.push({
          title,
          text: JSON.stringify({ text: text }),
          img: imgs, 
          video: video,
          url: "https://inkazan.ru" + sitepost,
          istochnik:`Источник: inkazan.ru`,
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

(async() => {
    await getPosts({url: "https://inkazan.ru"}, [])
})()
