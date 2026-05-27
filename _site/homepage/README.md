# Homepage Development Guide

This folder backs up the scripts and local notes needed to develop and publish this Jekyll-based GitHub Pages homepage.

## Backed-Up Scripts

- `scripts/run_server.sh`  
  Original template script. It runs `bundle exec jekyll serve --livereload`.

- `scripts/run_server.bat`  
  Windows batch version of the original server script.

- `scripts/jekyll-local.yml`  
  Local-only Jekyll override used for debugging. It sets `url: "http://127.0.0.1:4000"` so local builds do not depend on GitHub Pages URL metadata.

- `scripts/visitor-map.js`  
  Visitor map frontend script. It is currently backed up only; the live homepage does not load or display the visitor map.

- `scripts/visitor-analytics-worker.js`  
  Optional Cloudflare Worker for country/region visitor statistics. It stores only aggregated country counts from Cloudflare's `CF-IPCountry` header.

## Local Environment

Tested environment on Windows:

- Git: `2.39.1.windows.1`
- RubyInstaller with DevKit: `Ruby 3.1.7 x64-mingw-ucrt`
- RubyGems: bundled with RubyInstaller
- Bundler: `2.3.24`
- Jekyll: `3.9.2`
- GitHub Pages gem: `227`
- MSYS2 / DevKit GCC and Make: installed by RubyInstaller with DevKit

Recommended install:

1. Install Git for Windows.
2. Install `Ruby 3.1 with MSYS2` / `RubyInstaller with DevKit`.
3. Make sure these paths are available in the terminal:

```powershell
C:\Ruby31-x64\bin
C:\Ruby31-x64\msys64\ucrt64\bin
C:\Ruby31-x64\msys64\usr\bin
```

For a one-off PowerShell session:

```powershell
$env:Path = "C:\Ruby31-x64\bin;C:\Ruby31-x64\msys64\ucrt64\bin;C:\Ruby31-x64\msys64\usr\bin;$env:Path"
```

## Install Dependencies

From the repository root:

```powershell
bundle install
```

If `wdm 0.1.1` fails to compile on Windows, install it with a compatibility flag and then rerun Bundler:

```powershell
gem install wdm -v 0.1.1 -- --with-cflags=-Wno-implicit-function-declaration
bundle install
```

## Local Debugging

The original script is:

```bash
bash run_server.sh
```

For this local Windows setup, the more reliable command is:

```powershell
$env:Path = "C:\Ruby31-x64\bin;C:\Ruby31-x64\msys64\ucrt64\bin;C:\Ruby31-x64\msys64\usr\bin;$env:Path"
bundle exec jekyll serve --livereload --config _config.yml,../jekyll-local.yml
```

Then open:

```text
http://127.0.0.1:4000
```

Jekyll will rebuild when source files change. If you edit `_config.yml`, restart the server because Jekyll does not reload configuration automatically.

To run a build without starting the server:

```powershell
bundle exec jekyll build --config _config.yml,../jekyll-local.yml
```

The generated site is written to `_site/`, which is ignored by Git.

## Files You Usually Edit

- `_config.yml`  
  Site title, description, author profile, GitHub username, email, ORCID, and other global settings.

- `_pages/about.md`  
  Main homepage content.

- `_data/navigation.yml`  
  Header navigation links.

- `_includes/author-profile.html`  
  Left sidebar profile rendering.

- `_layouts/default.html`  
  Main page layout.

## Publish to GitHub Pages

1. Create a GitHub repository, usually named:

```text
YOUR_GITHUB_USERNAME.github.io
```

2. Point `origin` to your own repository:

```powershell
git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME.github.io.git
```

3. Update `_config.yml`:

```yaml
repository: "YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME.github.io"
author:
  github: "YOUR_GITHUB_USERNAME"
```

4. Commit changes:

```powershell
git status
git add .
git commit -m "Update homepage"
```

5. Push to GitHub:

```powershell
git push -u origin master
```

If your GitHub Pages repository uses `main` instead of `master`:

```powershell
git branch -M main
git push -u origin main
```

6. In GitHub, open repository settings and enable GitHub Pages if it is not already enabled. For a `USERNAME.github.io` repository, GitHub usually serves it automatically from the default branch.

## Notes

- The current live homepage does not display the visitor map.
- The visitor map scripts are backed up in this folder for future use.
- During local builds, the `jekyll-github-metadata` plugin may print GitHub API warnings or rate-limit warnings. These warnings do not necessarily block local page generation.
