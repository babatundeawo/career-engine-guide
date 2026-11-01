# Security policy

This is a static website with no accounts, forms or server-side code. Checklist progress is stored only in the visitor's browser.

## Reporting a vulnerability

Please report privately through [GitHub's private vulnerability reporting](https://github.com/babatundeawo/career-engine-guide/security/advisories/new) rather than a public issue. You can expect an acknowledgement within a few days.

## Hardening in place

- A Content Security Policy and referrer policy are set with `<meta>` tags on every page: scripts, styles, fonts and images load only from the site itself.
- GitHub Pages cannot send custom HTTP response headers, so headers such as `X-Frame-Options`, `Strict-Transport-Security` and `frame-ancestors` cannot be set on this host.
- External links use `rel="noopener noreferrer"`. No secrets, keys or tracking scripts are used.
- Dependabot keeps GitHub Actions current and CodeQL scans the JavaScript weekly.
