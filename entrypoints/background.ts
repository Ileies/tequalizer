export default defineBackground(() => {
  console.log('Rewrite background started', { id: browser.runtime.id });
});
