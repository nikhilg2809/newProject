const fs = require('fs');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://github.com/trending');
  
  const repoData = [];
  const repoContent = await page.content();
  const $repo = cheerio.load(repoContent);
  $repo('.Box-row').each((i, elem) => {
    const title = $repo(elem).find('h1').text().trim();
    const description = $repo(elem).find('p').text().trim();
    const url = 'https://github.com' + $repo(elem).find('h1 a').attr('href');
    const stars = $repo(elem).find('svg.octicon-star').parent().text().trim();
    const forks = $repo(elem).find('svg.octicon-repo-forked').parent().text().trim();
    const language = $repo(elem).find('span[itemprop="programmingLanguage"]').text().trim();
    repoData.push({
      title,
      description,
      url,
      stars,
      forks,
      language
    });
  });

  await page.click('a[href="/developers"]');
  await page.waitForSelector('.explore-pjax-container .filter-item:nth-child(7)');
  await page.click('.explore-pjax-container .filter-item:nth-child(7)');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  const devData = [];
  const devContent = await page.content();
  const $dev = cheerio.load(devContent);
  $dev('.explore-content .Box-row').each((i, elem) => {
    const name = $dev(elem).find('h2').text().trim();
    const username = $dev(elem).find('.f4.text-normal.mb-1 a').text().trim();
    const repoName = $dev(elem).find('.mt-n1 .h4').text().trim();
    const repoDesc = $dev(elem).find('.text-gray.mb-3').text().trim();
    devData.push({
      name,
      username,
      repoName,
      repoDesc
    });
  });

  const jsonData = {
    repositories: repoData,
    developers: devData
  };
  fs.writeFile('data.json', JSON.stringify(jsonData, null, 2), (err) => {
    if (err) throw err;
    console.log('Data written to file');
  });

  await browser.close();
})();
