import asyncio

from crawlee.crawlers import PlaywrightCrawler, PlaywrightCrawlingContext, PlaywrightPreNavCrawlingContext

async def main():
  crawler = PlaywrightCrawler(headless=False)

  @crawler.router.default_handler
  async def request_handler(context: PlaywrightCrawlingContext):
    context.log.info(f"Processing {context.request.url}")

    title = await context.page.locator('//*[@id="page-header"]/yt-page-header-renderer/yt-page-header-view-model/div/div[1]/div/yt-dynamic-text-view-model/h1/span').text_content()
    context.log.info(title)

    await context.page.wait_for_timeout(10000)

  await crawler.run(["https://www.youtube.com/@bling1761"])

if __name__ == "__main__":
  asyncio.run(main())
