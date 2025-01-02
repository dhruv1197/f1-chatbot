import { DataAPIClient } from '@datastax/astra-db-ts';
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import OpenAI from "openai";
import { CollectionAlreadyExistsError } from '@datastax/astra-db-ts';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import "dotenv/config"
// import { load } from 'langchain/load';

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const { 
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY
    } = process.env

const openai = new OpenAI({ apiKey: OPENAI_API_KEY})

const f1Data = [
    'https://en.wikipedia.org/wiki/Formula_One',
    'https://en.wikipedia.org/wiki/2024_Formula_One_World_Championship',
    'https://en.wikipedia.org/wiki/2023_Formula_One_World_Championship',
    'https://en.wikipedia.org/wiki/2022_Formula_One_World_Championship',
    'https://en.wikipedia.org/wiki/List_of_Formula_One_driver_records',
    'https://en.wikipedia.org/wiki/2020_Formula_One_World_Championship',
    'https://www.formula1.com/en/latest/all',
    'https://www.skysports.com/f1/news',
    'https://www.skysports.com/f1/drivers-teams',
    'https://www.skysports.com/f1/schedule-results',
    'https://www.skysports.com/f1/standings',
    'https://www.skysports.com/f1/stats',
    'https://www.skysports.com/f1/stats/drivers/search',
    'https://www.skysports.com/f1/stats/teams/search',
    'https://www.skysports.com/f1/stats/races/gp-listing',
    'https://www.crash.net/f1/feature/1002554/1/f1-driver-salaries-how-much-money-does-every-driver-earn'
]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
})

// creating db collection
const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
    try {
        const res = await db.createCollection(ASTRA_DB_COLLECTION, {
            vector: {
                dimension: 1536,
                metric: similarityMetric
            }
        });
        console.log("Collection created:", res);
    } catch (error) {
        if (error instanceof CollectionAlreadyExistsError) {
            console.log("Collection already exists, skipping creation.");
        } else {
            throw error; // Re-throw other errors
        }
    }
};


// took url out of the f1data - scraped and split it into chunks - embedding chunk
const loadSampleData = async() => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await (const url of f1Data){
        try {
            const content = await scrapePage(url)
            const chunks = await splitter.splitText(content)
            for await ( const chunk of chunks){
                const embedding = await openai.embeddings.create({
                    model: "text-embedding-3-small",
                    input: chunk,
                    encoding_format: "float"
                });
                // console.log(embedding)
                const vector = embedding.data[0].embedding;
                const res = await collection.insertOne({
                    $vector: vector,
                    text: chunk,
                });
                console.log(res);
            }
        } catch (error) {
            if (error.status === 429) {
                console.error("Rate limit exceeded. Waiting before retrying...");
                await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait for 1 minute
            } else {
                throw error; // Re-throw other errors
            }
        }
    }
};


// scrape page function
const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true
        },
        gotoOptions: {
            waitUntil: "domcontentloaded"
        },
        evaluate: async (pages, browser) => {
            const result = await pages.evaluate(()=> document.body.innerHTML)
            await browser.close()
            return result
        }
    })
    return ( await loader.scrape())?.replace(/<[^>]*>?/gm, '')
}



createCollection().then(() => loadSampleData())