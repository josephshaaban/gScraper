import * as puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { getRandomInt } from "./utils.mjs";
// const puppeteer = require("puppeteer-core");
// const chromium = require("@sparticuz/chromium");

export const handler = async (event) => {
  var gData, pageTitle;
  try {
    const browser = await puppeteer.launch({
      args: [...chromium.args, "--no-sandbox"],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    const searchQuery = "Web3";
    const params = {
      rpcids: "HoAMBc",
      "source-path": "/search",
      "f.sid": -getRandomInt(0, 9e10),
      bl: "boq_visualfrontendserver_20220505.05_p0",
      hl: "en",
      authuser: 0,
      _reqid: -getRandomInt(0, 9e5),
    };
    params.q = searchQuery;
    const query = Object.entries(params)
      .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
      .join("&");
    const url = `https://www.google.com/search?${query}`;

    await page.goto(url, { waitUntil: "networkidle0" });
    pageTitle = await page.title();

    var gData = await page.evaluate(() => {
      var data = [];

      var titles = document.querySelectorAll("div.MjjYud");
      console.log(titles);

      titles.forEach((node) => {
        var link = node
          .querySelector('div>div[class="kb0PBd cvP2Ce jGGQ5e"]>div>div>span>a')
          ?.getAttribute("href");
        var sourceName = node.querySelector(
          'div>div[class="kb0PBd cvP2Ce jGGQ5e"]>div>div>span>a>div>div>span'
        )?.textContent;

        var title = node.querySelector(
          'div>div[class="kb0PBd cvP2Ce jGGQ5e"]>div>div>span>a>h3'
        )?.textContent;
        var description = node.querySelector(
          'div>div[class="kb0PBd cvP2Ce"]'
        )?.textContent;

        if (title && link && description && sourceName) {
          data.push({
            title,
            link,
            description,
            sourceName,
          });
        }
      });

      return data;
    });

    await page.close();

    await browser.close();
  } catch (error) {
    console.error(error);
  }
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        pageTitle,
        data: gData,
        // input: event,
      },
      null,
      2
    ),
  };
};
