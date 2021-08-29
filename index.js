require("dotenv").config();
const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const Job = require("./model/Job");

async function connectDB(url) {
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
          });
    } catch (error) {
        console.error("Could'nt connect the database...")
    }
}

async function jobLists(page) {

    const url = "https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof"
    await page.goto(url);

    const resultInformation = await page.$$eval('.result-info', resultInformation => resultInformation.map(result => {
        const publishedDate = result.children[1].dateTime;
        const title = result.children[2].textContent.trim();
        const link = result.children[2].firstElementChild.href;
        const neighbourhood = result.children[3].firstElementChild.textContent.trim().replace("(","").replace(")","");
        const jobDetails = {publishedDate,title,link,neighbourhood};
        return jobDetails;
        } 
    ));

    return resultInformation;
}

async function scrapeJobDescription(listings,page) {

    for (let i=0 ; i<listings.length; i++){
        const url = listings[i].link;
        await page.goto(url);
        const jobDescription = await page.$eval('#postingbody', jobDescription => jobDescription.innerText.trim());
        const compensation = await page.$eval('.attrgroup', compensation => compensation.firstElementChild.children[0].innerText.trim());
        listings[i].jobDescription = `${jobDescription.slice(0,500)}...`;
        listings[i].compensation = compensation;
        const jobModel = new Job(listings[i]);
        await jobModel.save();
        await sleep(1000);
    }

}

async function sleep(ms) {
    return new Promise(resolve=>setTimeout(resolve,ms))
}

async function scrapper(){

    await connectDB(process.env.MONGO_URI)
    console.log("DB CONNECTED...")
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage()
    const listings = await jobLists(page);
    const listingsJobDescription = await scrapeJobDescription(listings,page)

    await browser.close();
}


scrapper();