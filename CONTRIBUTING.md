# Contributing

Thanks for helping improve Career Engine.

## Report a problem or suggest an idea

1. Go to the [Issues tab](https://github.com/babatundeawo/career-engine-guide/issues/new/choose).
2. Choose **Bug report** or **Suggestion** and fill in the short form.

## Propose a change on the GitHub website

1. Open the file you want to change and click the pencil icon (**Edit this file**).
2. Make your edit and choose **Commit changes**, then **Create a new branch** and **Propose changes**.
3. Open the pull request. Automatic checks run and report on the page.

Please keep changes focused, keep the existing writing style, and do not add tracking scripts or third-party embeds.

## Working locally (developers only)

The pages are plain HTML, so they can be opened from any static server for quick edits. To produce exactly what is published, run:

```
python3 .github/scripts/build.py _site
SITE_URL=https://babatundeawo.github.io/career-engine-guide/ python3 .github/scripts/check_site.py _site
```

The build script copies the site into `_site`, stamps the service worker and, if the font packages were downloaded into `.fontcache`, copies the fonts. Without them the site uses system fonts. The deploy workflow does all of this automatically.

Design tokens (colours, type, spacing, motion) live at the top of `css/base.css`.
