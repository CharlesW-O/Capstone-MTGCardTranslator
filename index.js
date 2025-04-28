import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 5000;
const API_URL = "https://api.scryfall.com";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs", {translatedCard: "No card searched yet."});
});

app.post("/", async (req, res) => {
    const searchedCard = req.body.cardName;
    console.log(`User search: ${searchedCard}`);

    try {
        const baseCard = await axios.get(API_URL + "/cards/named?fuzzy=" + searchedCard, {
            headers: {
                "User-Agent": "capstone-mtgcardtranslator",
                "Accept": "*/*"
            },
        });

        const code = baseCard.data.set;
        const number = baseCard.data.collector_number;
        let lang = req.body.transLanguage;
        const transCard = await axios.get(`${API_URL}/cards/${code}/${number}/${lang}`, {
            headers: {
                "User-Agent": "capstone-mtgcardtranslator",
                "Accept": "*/*"
            },
        });

        let translatedName = transCard.data.printed_name;
        if (translatedName) {
            console.log("printed_name (translated name) exists for this card");
        } else {
            translatedName = transCard.data.name;
        }

        res.render("index.ejs", {
            searchedCard: searchedCard,
            cardImage: transCard.data.image_uris.normal,
            translatedCard: `Your card is: ${translatedName}`
            
        });
    } catch (error) {
        console.log(error.response.data);
        res.render("index.ejs", {
            translatedCard: error.response.data.details,
        });
        res.status(500);
    }
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
