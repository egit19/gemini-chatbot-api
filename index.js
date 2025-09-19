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
    chat: "gemini-2.5-pro",
    image: "gemini-2.5-flash",
    audio: "gemini-2.5-flash",
    document: "gemini-2.5-flash-lite",
}


// inisialisasi aplikasi backend
app.use(cors());

app.use(express.json());

app.use(express.static('static'));

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

app.post('/chat',async (req, res) => {
    const { conversation } = req.body;

    if(!conversation || !Array.isArray(conversation)) {
        res.status(400).json({
            success: false,
            data: null,
            message: "Perakapan tidak valid"
        });
    }

    let dataIsInvalid = false;

    [].forEach(item => {
        if(!item) {
            dataIsInvalid = true;
            return;
        } else if(typeof item !== 'object') {
            dataIsInvalid = true;
            return;
        } else if(!item.role || !item.message) {
            dataIsInvalid = true;
            return;
        }
    });

    if(dataIsInvalid){
        return res.status(400).json({
            success: false,
            data: null,
            message: "Ada data yang invalid pada percakapan yang di kirim."
        });
    }

    // maping
    const contents = conversation.map(item => {
        return {
            role: item.role,
            parts: [
                {text: item.message}
            ]
        };
    });

    try {
        const aiResponse = await ai.models.generateContent({
            model: geminiModels.chat,
            contents,
        });

        return res.status(200).json({
            success: true,
            data: aiResponse.text,
            message: null
        });
    } catch (e) {
        console.log(e.code);
        return res.status(500).json({
            success: false,
            data: null,
            message: e.message || "Terjadi kesalahan pada server"
        })
    }

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