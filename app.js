const cheerio = require("cheerio");
const unirest = require("unirest");

const getAuthorProfileData = async () => {
    const fs = require('fs');
    const dataArr = [];
    let urlArr = [];
    let i = 0;

    try {
        fs.readFile('links.json', 'utf8', function(err, data){
            urlArr = JSON.parse(data)['links'];

            urlArr.forEach(async (url) => {
                i++;
                await unirest
                    .get(`https://scholar.google.com.br/scholar?q=${url}&lookup=0&hl=ru`)
                    .headers({
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
                    })
                    .then((response) => {
                        let $ = cheerio.load(response.body);
                        let elements = $('#gs_res_ccl_mid >.gs_r');
                        let articles = [];
                        elements.each((i, el) => {
                            let cit = $(el).find('.gs_ri .gs_fl a').eq(2).text();
                            articles.push({
                                title: $(el).find("h3.gs_rt a").text(),
                                cited: cit.startsWith('Цитируется:') ? cit.substring(12) : 0,
                            })
                        });
                        dataArr.push({
                            search: url.substring(40),
                            data: articles,
                        });
                        if (i === urlArr.length) {
                            fs.writeFile('test.txt', JSON.stringify(dataArr), err => {
                                if (err) {
                                  console.error(err);
                                }
                                // file written successfully
                              });
                        }
                    });
            });
        });

    } catch (e) {
        console.log(e);
    }
};
getAuthorProfileData();