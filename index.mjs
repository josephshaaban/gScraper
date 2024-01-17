import * as puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
// const puppeteer = require("puppeteer-core");
// const chromium = require("@sparticuz/chromium");

export const handler = async (event) => {
  var version, title;
  try {
    const browser = await puppeteer.launch({
      args: [...chromium.args, "--no-sandbox"],
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
    version = await browser.version();
    title = await page.title();
    console.log("Chromium:", version);
    console.log("Page Title:", title);

    await page.close();

    await browser.close();
  } catch (error) {
    console.error(error);
  }
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: {
          Chromium: version,
          PageTitle: title,
        },
        input: event,
      },
      null,
      2
    ),
  };
};

