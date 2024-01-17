import * as puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
// const puppeteer = require("puppeteer-core");
// const chromium = require("@sparticuz/chromium");

export const handler = async (event) => {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    await page.goto(
      "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html",
      { waitUntil: "networkidle0" }
    );

    console.log("Chromium:", await browser.version());
    console.log("Page Title:", await page.title());

    await page.close();

    await browser.close();
  } catch (error) {
    throw new Error(error.message);
  }
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: {
          Chromium: await browser.version(),
          PageTitle: await page.title(),
        },
        input: event,
      },
      null,
      2
    ),
  };
};

