/**
 * @author Yuichi<https://twitter.com/2qrbgxpsaWEziml?s=20>
 * @version 1.0.0
 */

const API_URL = "https://smarttranslateserver.herokuapp.com/translate";
//const API_URL = "http://localhost:8080";
let APICallCount = 0;
let sourceLang = "en";
let targetLang = "ja";

$(function () {
  checkTerms();
  $("#text").on("input", async function () {
    changeHeights($("#text"));
    const text = $("#text").val();
    // 2連続以上の空白は削除
    // 文末の改行以外は改行を削除
    const replaced = text
      .replace(/\s{2,}/g, " ")
      .replace(/([^\.])(\r\n|\n|\r)/g, '$1 ');
    $("#text").val(replaced);
    // 3500文字で文を分割
    const splitedTexts = splitText(replaced, 3500);
    console.log(splitedTexts);
    let translatedText = []
    for (let i = 0; i < splitedTexts.length; i++) {
      const splitedText = splitedTexts[i];
      const response = await callAPI(splitedText, sourceLang, targetLang);
      translatedText[i] = response;
    }
    const joined = translatedText.join("");
    if (joined) {
      $("#translated").val(translatedText.join(""));
      changeHeights($("#translated"));
    }
  });
  $("#source-lang").on("change", () => {
    sourceLang = $("#source-lang").val();
  });
  $("#target-lang").on("change", () => {
    targetLang = $("#target-lang").val();
  })
  $("#textReset").on("click", () => {
    $("#text").val("");
    $("#translated").val("");
    $("#text").css("height", "600px");
    $("#translated").css("height", "600px");
  })
});

// maxLength以下でなるべく長い文字列になるよう文の終わりで区切ったtextを返す
const splitText = (text, maxLength) => {
  if (text.length <= maxLength) {
    return [text];
  }
  let unSplitedText = text;
  let splitedText = [];
  while (unSplitedText.length > maxLength) {
    for (let i = 0; i <= maxLength; i++) {
      const index = maxLength - i;
      const char = unSplitedText[index];
      if (/\./.test(char)) {
        const t = unSplitedText.slice(0, index + 1);
        if (t.length === 0) {
          throw new Error("Max length is too short. Text can't be splited.");
        }
        splitedText.push(t);
        unSplitedText = unSplitedText.slice(index + 1);
        break;
      }
    }
  }
  if (unSplitedText.length > 0) {
    splitedText.push(unSplitedText);
  }
  return splitedText;
}

// 翻訳APIを呼び出して翻訳結果のtextを返す
const callAPI = async (text, sourceLang, targetLang) => {
  APICallCount++;
  await new Promise(resolve => setTimeout(resolve, 100)) // 1秒待つ
  if (APICallCount > 1) {
    APICallCount--;
    return "";
  }
  $("#loading").css("opacity", "1");
  lastAPIcalledTime = new Date().getTime();
  const body = JSON.stringify({
    text: text,
  });
  const param = {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: body
  };
  const response = await fetch(API_URL + "/translate", param);
  APICallCount--;
  $("#loading").css("opacity", "0");
  const resultText = await response.text();
  return resultText;
}

// 規約に同意しているか確認し，同意していなければモーダルを表示する
const checkTerms = () => {
  if (localStorage.getItem('agreement') != "done") {
    $('#modal').modal('show');
    $("#agreeButton").on("click", () => {
      localStorage.setItem('agreement', "done");
    })
  }
}

const changeHeights = (object) => {
  let scrollHeight = object.get(0).scrollHeight;
  let offsetHeight = object.get(0).offsetHeight;
  if (scrollHeight > offsetHeight) {
    object.css("height", scrollHeight + 2 + "px");
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}