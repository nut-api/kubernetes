import { browser } from 'k6/browser'

export const options = {
  scenarios: {
    ui: {
      executor: 'constant-vus',
      vus: 1,
      duration: '10s',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
}
const data = [
  'simple-robin-scc.dicast.site',
  'ace-locust-nyg.dicast.site',
  'robust-octopus-3py.dicast.site',
  'wondrous-ferret-qhs.dicast.site',
  'infinite-gelding-meb.dicast.site',
  'enjoyed-catfish-xqn.dicast.site',
  'bugcantstop.dicast.site'
];

export default async function () {
  const site = data[Math.floor(Math.random() * data.length)];
  const page = await browser.newPage()

  try {
    await page.goto('https://'+site)

  } finally {
    await page.close()
  }
}
