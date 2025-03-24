# Evil Dawn
dark side rework of [Dawn][(#getting-started](https://github.com/Shopify/dawn)), Shopify's reference liquid theme

## features
- typescript
- vite
- copy paste of like 30 tailwind classes
- automatic size scaling (not just fonts)
- special DOM selector to make your web component usage type safe and chillaxed
- liquid functions for GWP offers
- art-direction.liquid is like if the `image_tag` filter just worked regardless of if the media is video/image and gave you control over desktop + mobile as well as hls support for bg video on chrome desktop
- i rewrote facets.liquid so it's like comprehensible
- this diverged from dawn around version 12 so it's missing some of the b2b stuff

## why
- this was my personal framework for building custom themes that i improved over 5 years (since slate was deprecated)
- if used correctly this framework can consistently hit 1.5s LCP on mobile. it's used by over a dozen shopify plus stores with over $250mil/year cumulative rev between them

## instructions
### dev
- `pnpm i`
- `pnpm dev`
- click the 'localhost' link in the terminal and click through the security warning in your browser
- change the store url in the shopify.theme.toml and optionally add a prod env
- in separate tab, `shopify theme dev -e dev`
- enjoy

### prod
- `pnpm build`
- `shopify theme push`

## notes
- critical css/js files are not part of the build. when you run `pnpm build` you will get a critical.css file in the `/assets` folder. you can uhh copy this into the `critical-css.liquid` file. "why dont you just use the `inline_asset_content` filter?" right. thanks for reminding me. :)
- refer to [volt](https://shopify-vite.barrelny.com/guide/) docs for vite specifics. tldr: put fonts and static assets in /public because they will get deleted by `pnpm build` if you just put them in assets
- please dont be one of those people who doesnt hand off the codebase because its your "proprietary system". lol. as long as a merchant has paid their bills, if they ask for the code just send it to them.

## support / updates
- two weeks from this commit i will be starting a full time engineering role at shopify. which means when you read this i will probably be have @shopify in my bio. so i think it's important to clarify, this repo is ***not officially supported by shopify whatsoever***
- i am looking for one or two collaborators to take up community support here
- any issues, submit an issue
