const express = require("express");
const cors = require("cors");
const ejs = require("ejs");

const { removeStopwords } = require("stopword");

const removePunc = require("remove-punctuation");

const natural = require("natural");

const lemmatizer = require("wink-lemmatizer");

var converter = require("number-to-words");

const fs = require("fs");
const path = require("path");

const stringSimilarity = require("string-similarity");

const { wordsToNumbers } = require("words-to-numbers");


const IDF = require("./idf");

const keywords = require("./keywords");

const length = require("./length");

let TF = require("./TF");

const titles = require("./titles");

const urls = require("./urls");

const N = 3023;
const W = 27602;
const avgdl = 138.27125372146875;

const app = express();
app.use(cors());

Object.defineProperty(String.prototype, "capitalize", {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false,
});

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "/public")));

const spellcheck = new natural.Spellcheck(keywords);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/search", (req, res) => {
  const query = req.query.query;
  const oldString = query.split(" ");
  const newString = removeStopwords(oldString);
  newString.sort();

  let queryKeywords = [];

  let getNum = query.match(/\d+/g);

  if (getNum) {
    getNum.forEach((num) => {
      queryKeywords.push(num);
      let numStr = converter.toWords(Number(num));
      let numKeys = numStr.split("-");
      queryKeywords.push(numStr); 

      numKeys.forEach((key) => {
        let spaceSplits = key.split(" ");
        if (numKeys.length > 1) queryKeywords.push(key);
        if (spaceSplits.length > 1)
          spaceSplits.forEach((key) => {
            queryKeywords.push(key);
          });
      });
    });
  }

  for (let j = 0; j < newString.length; j++) {
    newString[j] = newString[j].toLowerCase();
    newString[j] = removePunc(newString[j]);
    if (newString[j] !== "") queryKeywords.push(newString[j]);

    var letr = newString[j].match(/[a-zA-Z]+/g);
    if (letr) {
      letr.forEach((w) => {
        queryKeywords.push(removePunc(w.toLowerCase()));
      });
    }

    let x = wordsToNumbers(newString[j]).toString();
    if (x != newString[j]) queryKeywords.push(x);
  }

  let queryKeywordsNew = queryKeywords;
  queryKeywords.forEach((key) => {
    let key1 = key;
    let key2 = lemmatizer.verb(key1);
    queryKeywordsNew.push(key2);

    let spellkey1 = spellcheck.getCorrections(key1);
    let spellkey2 = spellcheck.getCorrections(key2);
    if (spellkey1.indexOf(key1) == -1) {
      spellkey1.forEach((k1) => {
        queryKeywordsNew.push(k1);
        queryKeywordsNew.push(lemmatizer.verb(k1));
      });
    }

    if (spellkey2.indexOf(key2) == -1) {
      spellkey2.forEach((k2) => {
        queryKeywordsNew.push(k2);
        queryKeywordsNew.push(lemmatizer.verb(k2));
      });
    }
  });

  queryKeywords = queryKeywordsNew;
  console.log(queryKeywords);

  let temp = [];
  for (let i = 0; i < queryKeywords.length; i++) {
    const id = keywords.indexOf(queryKeywords[i]);
    if (id !== -1) {
      temp.push(queryKeywords[i]);
    }
  }

  queryKeywords = temp;
  queryKeywords.sort();

  let temp1 = [];
  queryKeywords.forEach((key) => {
    if (temp1.indexOf(key) == -1) {
      temp1.push(key);
    }
  });

  queryKeywords = temp1;

  let qid = [];
  queryKeywords.forEach((key) => {
    qid.push(keywords.indexOf(key));
  });

  const arr = [];

  for (let i = 0; i < N; i++) {
    let s = 0;
    qid.forEach((key) => {
      const idfKey = IDF[key];
      let tf = 0;
      for (let k = 0; k < TF[i].length; k++) {
        if (TF[i][k].id == key) {
          tf = TF[i][k].val / length[i];

          break;
        }
      }
      const tfkey = tf;
      const x = tfkey * (1.2 + 1);
      const y = tfkey + 1.2 * (1 - 0.75 + 0.75 * (length[i] / avgdl));
      let BM25 = (x / y) * idfKey;

      if (i < 2214) BM25 *= 2;
      s += BM25;
    });

    const titSim = stringSimilarity.compareTwoStrings(
      titles[i],
      query.toLowerCase()
    );
    s *= titSim;

    arr.push({ id: i, sim: s });
  }

  arr.sort((a, b) => b.sim - a.sim);

  let response = [];
  let nonZero = 0;

  for (let i = 0; i < 10; i++) {
    if (arr[i].sim != 0) nonZero++;
    const str = path.join(__dirname, "Problems");
    const str1 = path.join(str, `problem_text_${arr[i].id + 1}.txt`);
    let question = fs.readFileSync(str1).toString().split("\n");
    let n = question.length;
    let problem = "";

    if (arr[i].id <= 1773) {
      problem = question[0].split("ListShare")[1] + " ";
      if (n > 1) problem += question[1];
    } else {
      problem = question[0] + " ";
      if (n > 1) problem += question[1];
    }
    response.push({
      id: arr[i].id,
      title: titles[arr[i].id],
      problem: problem,
    });
  }

  console.log(response);

  setTimeout(() => {
    if (nonZero) res.json(response);
    else res.json([]);
  }, 1000);
});


app.get("/question/:id", (req, res) => {
  const id = Number(req.params.id);
  const str = path.join(__dirname, "Problems");
  const str1 = path.join(str, `problem_text_${id + 1}.txt`);

  try {
    let text = fs.readFileSync(str1).toString();

    if (id <= 1773) {
      text = text.split("ListShare")[1] || text;
    }

    text = text.replace(/\n/g, "<br/>"); 
    let title = titles[id];
    title = title.split("-").join(" ").capitalize();

    let type = id < 1774 ? "Leetcode" : id < 2214 ? "Interview Bit" : "Techdelight";

    const questionObject = {
      title,
      link: urls[id],
      value: text,
      type,
    };

    res.render("question", { questionObject });

  } catch (err) {
    console.error(`Error reading file ${str1}:`, err);
    res.status(500).send("Problem not found");
  }
});

const port = process.env.PORT || 5500;

app.listen(port, () => {
  console.log("Server is runnning on port " + port);
});

