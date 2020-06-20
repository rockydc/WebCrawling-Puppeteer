
const fs =require('fs')
const puppeteer = require('puppeteer');



async function runScrapper(){
  let browser = {};
  let page = {}
  const url = 'https://www.bankmega.com/promolainnya.php'
 
  async function navigate(){
    browser = await puppeteer.launch(
      {headless:true}
    )
    page = await browser.newPage()
    await page.goto(url);

  }

  async function getdata(){
    await page.waitFor(1000);
    var selecedImgURLs = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('#promolain > li> a'),
      ({ href }) => href,
    )
  );
    let listurls = [];
    for(let i = 0; i < selecedImgURLs.length; i++){

      try {
        const link= selecedImgURLs[i];
        await page.goto(link);
  
        const judul = await page.evaluate(element => element.textContent, await page.$("#contentpromolain2 > div.titleinside"));
  
        const area = await page.evaluate(element => element.textContent, await page.$("#contentpromolain2 > div.area"));
  
        const periode = await page.evaluate(element => element.textContent, await page.$("#contentpromolain2 > div.periode"));
        var halaman = 'https://www.bankmega.com'
        const imgUrl = await page.evaluate(element => element.getAttribute('src'), await page.$("#contentpromolain2 > div.keteranganinside >img"));
        listurls.push({
          judul:judul.trim(),
          area:area.trim(),
          periode:periode.replace(/[\t\n]*/g,""),
          keterangan :halaman.concat(imgUrl),
  
        });
      }catch(e){
         console.log('data anomali');
        const imgUrl = await page.evaluate(element => element.getAttribute('src'), await page.$("#konten > img"));
        listurls.push({
          keterangan:halaman.concat(imgUrl)
       
        })
      }
   
    }
    await page.goto(url)
      return listurls;
    }  

  async function getdatakartukredit(){
    promo = []
    for(let index=1; index <=10; index++){
      await page.goto('https://www.bankmega.com/promolainnya.php#')
      await page.waitFor(1000)
      await page.click('#kartukredit')
      await page.waitFor(1000)
      await page.evaluate(function(index){
        
        [...document.querySelectorAll('a')].find(element => element.textContent === `${index}`).click()
      },index);
      await page.waitFor(2000)
  
        promo.push({
          detail:await getdata()
        })
      
    }

    return promo;
    

  }
  async function getdataebanking(){
 
    promo = []

    for(let index=1; index <= 4; index++){
      await page.goto('https://www.bankmega.com/promolainnya.php#')
      await page.waitFor(1000)
      await page.click('#ebanking')
      await page.waitFor(1000)
      await page.evaluate(function(index){
      
        [...document.querySelectorAll('a')].find(element => element.textContent === `${index}`).click()
      },index);
    
    await page.waitFor(2000)
      promo.push({
        detail:await getdata()
      })
    }
    return promo;
  }
  async function getdatasimpanan(){

    promo = []
   
    var nextPage
    var selectedelement
    for(let index=1; index <=5; index++){
      await page.goto('https://www.bankmega.com/promolainnya.php#')
      await page.waitFor(1000)
      await page.click('#simpanan')
      await page.waitFor(1000)
      await page.evaluate(function(index){
      
        [...document.querySelectorAll('a')].find(element => element.textContent === `${index}`).click()
      },index);
    await page.waitFor(2000)
      promo.push({
      
        detail:await getdata()
      })
    }
    return promo;
  }

  async function getdatalainnya(){
    promo = []
      await page.goto('https://www.bankmega.com/promolainnya.php#')
      await page.waitFor(1000)
      await page.click('#others')
      
    await page.waitFor(1000);
    var selecedImgURLs = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('#promolain > li> a'),
      ({ href }) => href,
    )
  );
   
    for(let i = 0; i < selecedImgURLs.length; i++){

        const link= selecedImgURLs[i];
        await page.goto(link);
        var halaman = 'https://www.bankmega.com/'
        await page.waitFor(2000)
        const imgUrl = await page.evaluate(element => element.getAttribute('src'), await page.$("#konten > a:nth-child(2)>img"));

        const detail = await page.evaluate(element => element.getAttribute('src'), await page.$("        #konten > a:nth-child(4)>img"));

        promo.push({
          keterangan:halaman.concat(imgUrl),
          details:halaman.concat(detail)
        });
    
    }

    return promo;
  }
  await navigate()
  const kartukredit = await getdatakartukredit()
  const ebanking = await getdataebanking();
  const Simpanan = await getdatasimpanan();
  const other = await getdatalainnya()
  
  const kategoridata = [{
    "Kartu Kredit":kartukredit,
    "Ebanking":ebanking,
    "Simpanan":Simpanan,
    "Others":other,
  }]
  const filejson = JSON.stringify(kategoridata,null,4)
  fs.writeFile("solution.json", filejson, 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("The file was saved!");
}); 

  browser.close()
}
runScrapper().catch(console.error);
