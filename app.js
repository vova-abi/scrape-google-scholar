const cheerio = require("cheerio");
const unirest = require("unirest");
const getAuthorProfileData = async () => {
    try {
        const urlArr = [
            'https://scholar.google.com.br/scholar?q=10.3390%2Fijms23169330',
            'https://scholar.google.com.br/scholar?q=10.1590%2F0074-02760220025',
            'https://scholar.google.com.br/scholar?q=10.3389%2Ffcvm.2022.886689',
            //...
        ];
        const data = [];
        let i = 0;
        urlArr.forEach(async (url) => {
            i++;
            await unirest
                .get(url + '&lookup=0&hl=ru')
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
                    data.push({
                        search: url.substring(40),
                        data: articles,
                    });
                    if (i === urlArr.length) {
                        const fs = require('fs');
                        fs.writeFile('test.txt', JSON.stringify(data), err => {
                            if (err) {
                              console.error(err);
                            }
                            // file written successfully
                          });
                    }
                });
        });
    } catch (e) {
        console.log(e);
    }
};
getAuthorProfileData();