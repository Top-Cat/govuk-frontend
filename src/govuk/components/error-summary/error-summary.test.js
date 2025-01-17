/**
 * @jest-environment puppeteer
 */
const { renderAndInitialise, getExamples } = require('../../../../lib/jest-helpers')

const examples = getExamples('error-summary')

const configPaths = require('../../../../config/paths.js')
const PORT = configPaths.ports.test

const baseUrl = 'http://localhost:' + PORT

describe('Error Summary', () => {
  it('adds the tabindex attribute on page load', async () => {
    await page.goto(baseUrl + '/components/error-summary/preview', { waitUntil: 'load' })

    const tabindex = await page.$eval('.govuk-error-summary', el => el.getAttribute('tabindex'))
    expect(tabindex).toEqual('-1')
  })

  it('is automatically focused when the page loads', async () => {
    await page.goto(`${baseUrl}/components/error-summary/preview`, { waitUntil: 'load' })

    const moduleName = await page.evaluate(() => document.activeElement.dataset.module)
    expect(moduleName).toBe('govuk-error-summary')
  })

  it('removes the tabindex attribute on blur', async () => {
    await page.goto(baseUrl + '/components/error-summary/preview', { waitUntil: 'load' })

    await page.$eval('.govuk-error-summary', el => el.blur())

    const tabindex = await page.$eval('.govuk-error-summary', el => el.getAttribute('tabindex'))
    expect(tabindex).toBeNull()
  })

  describe('when auto-focus is disabled', () => {
    describe('using data-attributes', () => {
      beforeAll(async () => {
        await page.goto(
          `${baseUrl}/components/error-summary/autofocus-disabled/preview`,
          { waitUntil: 'load' }
        )
      })

      it('does not have a tabindex attribute', async () => {
        const tabindex = await page.$eval('.govuk-error-summary', (el) =>
          el.getAttribute('tabindex')
        )

        expect(tabindex).toBeNull()
      })

      it('does not focus on page load', async () => {
        const activeElement = await page.evaluate(
          () => document.activeElement.dataset.module
        )

        expect(activeElement).not.toBe('govuk-error-summary')
      })
    })

    describe('using JavaScript configuration', () => {
      beforeAll(async () => {
        await renderAndInitialise('error-summary', {
          baseUrl,
          nunjucksParams: examples.default,
          javascriptConfig: {
            disableAutoFocus: true
          }
        })
      })

      it('does not have a tabindex attribute', async () => {
        const tabindex = await page.$eval('.govuk-error-summary', (el) =>
          el.getAttribute('tabindex')
        )

        expect(tabindex).toBeNull()
      })

      it('does not focus on page load', async () => {
        const activeElement = await page.evaluate(
          () => document.activeElement.dataset.module
        )

        expect(activeElement).not.toBe('govuk-error-summary')
      })
    })

    describe('using JavaScript configuration, with no elements on the page', () => {
      it('does not prevent further JavaScript from running', async () => {
        const result = await page.evaluate(() => {
          // `undefined` simulates the element being missing,
          // from an unchecked `document.querySelector` for example
          new window.GOVUKFrontend.ErrorSummary(undefined).init()

          // If our component initialisation breaks, this won't run
          return true
        })

        expect(result).toBe(true)
      })
    })

    describe('using JavaScript configuration, but enabled via data-attributes', () => {
      beforeAll(async () => {
        await renderAndInitialise('error-summary', {
          baseUrl,
          nunjucksParams: examples['autofocus explicitly enabled']
        })
      })

      it('adds the tabindex attribute on page load', async () => {
        const tabindex = await page.$eval('.govuk-error-summary', (el) =>
          el.getAttribute('tabindex')
        )
        expect(tabindex).toEqual('-1')
      })

      it('is automatically focused when the page loads', async () => {
        const moduleName = await page.evaluate(
          () => document.activeElement.dataset.module
        )
        expect(moduleName).toBe('govuk-error-summary')
      })
    })

    describe('using `initAll`', () => {
      beforeAll(async () => {
        await renderAndInitialise('error-summary', {
          baseUrl,
          nunjucksParams: examples.default,
          initialiser () {
            window.GOVUKFrontend.initAll({
              errorSummary: {
                disableAutoFocus: true
              }
            })
          }
        })
      })

      it('does not have a tabindex attribute', async () => {
        const tabindex = await page.$eval('.govuk-error-summary', (el) =>
          el.getAttribute('tabindex')
        )

        expect(tabindex).toBeNull()
      })

      it('does not focus on page load', async () => {
        const activeElement = await page.evaluate(
          () => document.activeElement.dataset.module
        )

        expect(activeElement).not.toBe('govuk-error-summary')
      })
    })
  })

  const inputTypes = [
    // [description, input id, selector for label or legend]
    ['an input', 'input', 'label[for="input"]'],
    ['a textarea', 'textarea', 'label[for="textarea"]'],
    ['a select', 'select', 'label[for="select"]'],
    ['a date input', 'dateinput-day', '.test-date-input-legend'],
    ['a specific field in a date input', 'dateinput2-year', '.test-date-input2-legend'],
    ['a file upload', 'file', 'label[for="file"]'],
    ['a group of radio buttons', 'radios', '#test-radios legend'],
    ['a group of checkboxes', 'checkboxes', '#test-checkboxes legend'],
    ['a single checkbox', 'single-checkbox', 'label[for="single-checkbox"]'],
    ['a conditionally revealed input', 'yes-input', '#test-conditional-reveal legend'],
    ['a group of radio buttons after a particularly long heading', 'radios-big-heading', '.test-radios-big-heading-legend'],
    // Rather than scrolling to the fieldset, we expect to scroll to the label
    // because of the distance between the input and the fieldset
    ['an input within a large fieldset', 'address-postcode', 'label[for="address-postcode"]']
  ]

  describe.each(inputTypes)('when linking to %s', (_, inputId, legendOrLabelSelector) => {
    beforeAll(async () => {
      await page.goto(`${baseUrl}/examples/error-summary`, { waitUntil: 'load' })
      await page.click(`.govuk-error-summary a[href="#${inputId}"]`)
    })

    it('focuses the target input', async () => {
      const activeElement = await page.evaluate(() => document.activeElement.id)
      expect(activeElement).toBe(inputId)
    })

    it('scrolls the label or legend to the top of the screen', async () => {
      const legendOrLabelOffsetFromTop = await page.$eval(
        legendOrLabelSelector,
        $ => $.getBoundingClientRect().top
      )

      // Allow for high DPI displays (device pixel ratio)
      expect(legendOrLabelOffsetFromTop).toBeGreaterThanOrEqual(0)
      expect(legendOrLabelOffsetFromTop).toBeLessThan(1)
    })

    it('does not include a hash in the URL', async () => {
      const hash = await page.evaluate(() => window.location.hash)
      expect(hash).toBe('')
    })
  })
})
