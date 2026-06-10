// scripts/translate.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const sourceFile = process.argv[2]; // Get the source file from command line arguments

// Add input validation
if (!sourceFile) {
    console.log(process.env.OPENAI_API_KEY)
    console.error('Error: Please provide a source file as an argument.');
    console.error('Usage: node translate.js <source-file>');
    console.error('Example: node translate.js en.json');
    process.exit(1);
}

// Validate that the source file exists
const sourcePath = path.join(__dirname, '../messages', sourceFile);
if (!fs.existsSync(sourcePath)) {
    console.error(`Error: Source file '${sourceFile}' not found in messages directory.`);
    process.exit(1);
}

const sourceLang = path.basename(sourceFile, '.json'); // Extract language code from filename
const messagesDir = path.join(__dirname, '../messages'); // Path to messages directory

// Function to read JSON file
const readJsonFile = (filePath) => {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// Function to write JSON file
const writeJsonFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// Function to get supported languages
const getSupportedLanguages = () => {
    return fs.readdirSync(messagesDir)
        .filter(file => file.endsWith('.json') && file !== sourceFile)
        .map(file => path.basename(file, '.json'));
};

// Function to translate text using OpenAI API
const translateText = async (text, targetLang) => {
    // Convert object to string if necessary
    const textToTranslate = typeof text === 'object' ? JSON.stringify(text) : text;
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: `You are a professional translator. Translate the following text to ${targetLang}. Only respond with the translation, nothing else.`
            },
            {
                role: "user",
                content: textToTranslate
            }
        ],
        temperature: 0.3,
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        }
    });

    console.log(response.data.choices[0].message.content.trim())
    return response.data.choices[0].message.content.trim();
};

// Main function to perform translation
const main = async () => {
    const sourceData = readJsonFile(path.join(messagesDir, sourceFile));
    const supportedLanguages = getSupportedLanguages();
    const translations = {};
    for (const lang of supportedLanguages) {
        translations[lang] = {};
        for (const key in sourceData) {
            translations[lang][key] = await translateText(sourceData[key], lang);
        }
        writeJsonFile(path.join(messagesDir, `${lang}.json`), translations[lang]);
    }
};

main().catch(console.error);