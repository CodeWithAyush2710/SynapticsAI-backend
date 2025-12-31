// const axios = require('axios');
// const cheerio = require('cheerio');

// async function scrapePortal(url) {
//   try {
//     const { data } = await axios.get(url);
//     const $ = cheerio.load(data);

//     const title = $("title").text();
//     const description = $("meta[name='description']").attr("content") || $("p").first().text();

//     return `Title: ${title}\nDescription: ${description}`;
//   } catch (error) {
//     return "Could not extract portal data.";
//   }
// }

// module.exports = scrapePortal;

const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

async function scrapePortal(url) {
  try {
    // Validate URL
    new URL(url);  // This will throw an error if the URL is invalid
    
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const title = $("title").text();
    const description = $("meta[name='description']").attr("content") || $("p").first().text();

    // Optional: You can add more scraping here based on the structure of the page
    const companyName = $("meta[name='company']").attr("content") || $("h1").first().text();
    const jobRequirements = $("meta[name='job-requirements']").attr("content") || $("ul").first().text();

    return {
      title,
      description,
      companyName,
      jobRequirements
    };
  } catch (error) {
    console.error("Error scraping portal:", error.message); // Log the error message
    return null; // Return null on error
  }
}

module.exports = scrapePortal;
