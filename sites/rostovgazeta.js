const axios = require('axios');
const cheerio = require('cheerio');


module.exports = async function getPosts(site, $) {
    const postTitles = []
    let res = []
    $('.mx-auto > .mb-8 > a').each( (_i , el ) => {
      const postTitle = $(el).attr('href')
      postTitles.push(postTitle?postTitle:"") 
    });
    await Promise.all(postTitles.map(async (sitepost) => {
      try {
        const { data } = await axios.get("https://rostovgazeta.ru" + sitepost);
        const $ = cheerio.load(data);
        const title = $(".MatterTop_title__fNgrs").text().trim().replace(/\[.*\]/g, '').replace(/\s{2,}/g, ' ').trim();

        let text = "";
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
          istochnik:`Источник: rostovgazeta.ru`,
          siteid: site.id,
          old: false,
        });

      } catch {
        console.log("poebatb")
      }
    }))
    return res
      
}
