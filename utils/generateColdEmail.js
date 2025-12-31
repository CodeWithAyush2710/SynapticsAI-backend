// const { GoogleGenerativeAI } = require('@google/generative-ai');
// require('dotenv').config();

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

// async function generateColdEmail(scrapedData, resumeText) {
//   const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

//   const prompt = `
// Write a cold email applying for a job using the following details.

// Job Portal Information:
// ${scrapedData}

// Resume Summary:
// ${resumeText}

// Be concise, professional, and highlight skills relevant to the job.
//   `;

//   const result = await model.generateContent(prompt);
//   const response = await result.response;
//   return response.text();
// }

// module.exports = generateColdEmail;

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

async function generateColdEmail(scrapedData, resumeText) {
  try {
    // Try one of the latest recommended models
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); 

    // Ensure scrapedData is an object, default to empty if not
    const safeScrapedData = scrapedData && typeof scrapedData === 'object' ? scrapedData : {};

    // Prepare prompt with fallbacks for missing data more explicitly
    const jobTitle = safeScrapedData?.title || 'Not Available';
    const companyName = safeScrapedData?.companyName || 'Not Available';
    const jobDescription = safeScrapedData?.description || 'Not Available';
    const jobRequirements = safeScrapedData?.jobRequirements || 'Not Available';
    const applicantSummary = resumeText || 'No resume summary provided.';

    const prompt = `
Write a professional cold email applying for the following job:
Job Title: ${jobTitle}
Company: ${companyName}
Description: ${jobDescription}
Requirements: ${jobRequirements}

Use the following applicant resume summary:
${applicantSummary}

Generate a concise and professional email highlighting relevant skills. Address the hiring manager generally.
    `;

    console.log("Sending simplified prompt to AI:", prompt); // Log the exact prompt being sent

    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Check for safety ratings or blocks which might indicate refusal
    if (response.promptFeedback?.blockReason) {
        console.warn(`AI generation blocked. Reason: ${response.promptFeedback.blockReason}`);
        return `AI generation was blocked due to: ${response.promptFeedback.blockReason}. Please adjust inputs.`;
    }

    const text = response.text();

    if (!text || text.trim() === '') {
      console.warn("AI generated an empty response. Prompt feedback:", response.promptFeedback);
      return "AI returned empty content. This might be due to safety filters or the nature of the input. Please try again with different details.";
    }

    return text;
  } catch (error) {
    console.error("Error in generateColdEmail function:", error); // Log the specific error
    // Provide more specific error feedback if possible
    if (error.message && error.message.includes('API key not valid')) {
        return "AI API key is invalid. Please check the server configuration.";
    }
    return "An error occurred during AI email generation. Please check server logs.";
  }
}

module.exports = generateColdEmail;
