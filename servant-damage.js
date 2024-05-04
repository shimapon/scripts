// @wikiからスクレイピングして宝具ダメージを取得する
const axios = require("axios");
const cheerio = require("cheerio");

// スクレイピング対象のURL
const url = "https://w.atwiki.jp/f_go/pages/2342.html";

// axiosを使用してHTMLを取得する
axios
  .get(url)
  .then((response) => {
    // HTMLデータをCheerioでロードする
    const $ = cheerio.load(response.data);

    // テーブルの行を選択し、各行からデータを抽出する
    const dataArray = [];
    $("table tr").each((index, element) => {
      // 最初の行は見出しであるため、スキップする
      if (index === 0) return;

      // 行から各セルのテキストを取得し、配列に追加する
      const rowArray = [];
      $(element)
        .find("td")
        .each((i, el) => {
          rowArray.push($(el).text().trim());
        });

      if (
        rowArray[0].length === 3 &&
        Number(rowArray[0]) > 0 &&
        !rowArray[4].includes("特攻")
      ) {
        let isExistingID = false;
        dataArray.forEach((data) => {
          if (data.ID === rowArray[0]) {
            data.name = rowArray[4];
            data.damage = rowArray[15];
            isExistingID = true;
          }
        });

        // 既存のIDが見つからなかった場合、新しい要素として追加する
        if (!isExistingID) {
          dataArray.push({
            ID: rowArray[0],
            name: rowArray[4],
            damage: rowArray[15],
          });
        }
      }
    });
    // IDで昇順にソートする
    dataArray.sort((a, b) => {
      // aのIDがbのIDより小さい場合は負の値を返し、大きい場合は正の値を返す
      // aとbのIDが同じ場合は0を返す
      return a.ID - b.ID;
    });
    // スクレイピングされたデータの表示
    console.log(dataArray);
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
