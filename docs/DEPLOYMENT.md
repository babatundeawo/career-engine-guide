# Deploying and maintaining the site

No terminal is needed. Everything happens on github.com.

## One-time setup

1. Open the repository on GitHub and click **Settings**.
2. Click **Pages** in the left menu.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.

You should see a short message saying the site is built by GitHub Actions.

## How publishing works

Whenever a change reaches the `main` branch, a workflow called **Build and deploy** checks the site and publishes it. Nothing else is needed.

## Check that a deployment worked

1. Click the **Actions** tab.
2. Open the newest **Build and deploy** run.
3. A green tick means the site is live. A red cross means something failed and the old version is still online.

If it failed, open the red step and read the line starting with `-`. It names the file and the problem (for example `broken href -> tipz.html`). Fix that file and commit again.

The Lighthouse and external-link steps only report. A warning there never blocks publishing.

## Review a pull request before it goes live

1. Open the **Pull requests** tab and click the request.
2. Wait for the checks at the bottom to finish. Green means the pages, links and metadata are valid.
3. Open **Checks > Build and check** (or the **Summary** page of the run) and download the **site-preview** file under *Artifacts*. Unzip it and open `index.html` to look through the pages.
4. If you are happy, click **Merge pull request**, then **Confirm merge**. Nothing is public until you do this.
5. To discard the change instead, click **Close pull request**.

GitHub Pages cannot host a separate preview address, so the downloadable preview is the safe way to look first.

## Go back to an earlier version

1. Click the **Code** tab, then **commits** (the clock icon with a number).
2. Find the last good commit and open it.
3. Click the **...** menu and choose **Revert**, then open and merge the pull request it creates.

## Custom domain

1. **Settings > Pages > Custom domain**: enter your domain and save.
2. At your domain provider add the DNS records GitHub lists on that page.
3. Tick **Enforce HTTPS** once it becomes available.
4. Follow the "custom domain" note in [CUSTOMIZING.md](CUSTOMIZING.md).

## Turn on secret scanning (recommended)

1. **Settings > Code security** (or **Advanced Security**).
2. Switch on **Secret scanning** and **Push protection**. This warns you if a password or key is ever added by mistake. The site needs none.

CodeQL scanning and Dependabot update pull requests run automatically from the files in `.github/`.
