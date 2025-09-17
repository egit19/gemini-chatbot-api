import { GoogleGenAI } from "@google/genai";

import 'dotenv/config';
import express from 'express';
import multer from "multer";
import fs from 'fs/promises';
import cors from 'cors';

const app = express();
const upload = multer();


const ai = new GoogleGenAI({});

// inisialisasi model ai
const geminiModels = {
    text: "gemini-2.5-flash-lite",
    image: "gemini-2.5-flash",
    audio: "gemini-2.5-flash",
    document: "gemini-2.5-flash-lite",
}


// inisialisasi aplikasi backend
app.use(cors());

app.use(express.json());

// inisialisasi route
app.post('/generate-text',async (req, res) => {
    const {body} = req;

    const { message } = req.body || {};

    if(!message || typeof message !== 'string') {
        res.status(400).json({message: "pesan tidak ada atau format tidak sesuai"});
        return;
    }

    const response = await ai.models.generateContent({
        model: geminiModels.text,
        contents: message,
    });

    res.status(200).json({reply: response.text});
});


// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: "Tahun berapa gemini ai di rilis?",
//   });
//   console.log(response.text);
// }

// await main();

const port = 3000;

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

export default app;