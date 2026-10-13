// Pages built by scripts/postbuild.mjs ship real HTML inside #root (marked data-prerendered).
// We keep showing that HTML as the Suspense fallback until the page's JS chunk is ready,
// so visitors never see it replaced by a spinner.
const root = typeof document !== 'undefined' ? document.getElementById('root') : null
export const wasPrerendered = !!root?.hasAttribute('data-prerendered')
let bootHtml = wasPrerendered ? root.innerHTML : null

export const takeBootHtml = () => bootHtml
export const clearBootHtml = () => { bootHtml = null }
