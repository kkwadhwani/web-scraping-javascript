const puppeteer = require('puppeteer');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const data = require('./data.js');


function run(pagesToScrap){
    return new Promise(async (resolve, reject) => {
        try{
            const browser = await puppeteer.launch({ headless: false });
            const page = await browser.newPage();
            await page.goto('https://www.apnapanipat.com/bed-sheet-manufacturers/');
            let currentPage = 1
            let allDetails = []
       let newList = []
          
       async function tags(list){
        await  list.forEach((item)=>{
             newList.push(item.innerText)
         })
         return newList
 }
            while(currentPage <= pagesToScrap){
    
                let names = await page.evaluate(()=>{
                    let result = [];
                    let titles = document.querySelectorAll('.post');
                    let z=[]
         
                     titles.forEach(async (item)=>{
                      
                      result.push({
                            title:  await item.querySelector("h3 > a").innerHTML,
                            address:await item.querySelector(".address").innerText,
                            phone:await item.querySelector(".phone").innerText,
                            tags: await  item.getElementsByTagName("p")[2].textContent
                            
                        });
                        console.log(result)
                    });
                   
                    return result
                });
               allDetails = allDetails.concat(names)
                if (currentPage < pagesToScrap) {
                    await Promise.all([
                        await page.click('.nextpostslink'),
                        await page.waitForSelector('.post')
                    ])
                }
                currentPage++
               
            }
            await browser.close();
            return resolve(allDetails);
        }
        catch(e){
return reject(e)
        }
    })
}


  

run(30).then((res)=>{
console.log(res)


const csvWriter = createCsvWriter({
    path: './file.csv',
    header: [
        {id: 'title', title: 'Name of the Company'},
        {id: 'address', title: 'Address'},
        {id: 'phone', title: 'Phone'},
        {id: 'tags', title: 'Business Types'}
    ]
});


csvWriter.writeRecords(res)       // returns a promise
    .then(() => {
        console.log('...Done');
    });


})

