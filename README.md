# Evil Dawn :smiling_imp:
dark side rework of [Dawn](https://github.com/Shopify/dawn), Shopify's reference liquid theme

## features
- typescript
- vite
- copy paste of like 30 tailwind classes
- automatic size scaling (not just fonts)
- special DOM selector to make your web component usage type safe and chillaxed
- liquid functions for GWP offers
- art-direction.liquid is like if the `image_tag` filter just worked regardless of if the media is video/image and gave you control over desktop + mobile as well as hls support for bg video on chrome desktop
- i rewrote facets.liquid so it's like comprehensible (coming soon, need to merge changes from another project)
- this diverged from dawn around version 12 so it's missing some of the b2b stuff

## why
- this was my personal framework for building custom themes that i improved over 5 years (since slate was deprecated)
- if used correctly this framework can consistently hit 1.5s LCP on mobile. it's used by over a dozen shopify plus stores with over $250mil/year cumulative rev between them

## quick start
this project uses [volt](https://shopify-vite.barrelny.com/guide/) plugin with vite.  
all css/js files are inside the `/src` directory.

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

## module system
### adding new CSS files
inside `/src/styles/modules` you will find the individual CSS module files for each resource route.  
to add a new scss file, simple add the scss file to the relevant folder inside `src/styles` and then import  
it in the respective module in `src/styles/modules`

take note of the split between `prio` and `defer` in these modules. I've deferred everything that I don't expect to be  
visible above the fold. defer everything you possible can, but be aware this will result in CLS issues if used on sections that  
appear above the fold. 

the final vite entry points are in `/src/entry`. these are set up so that there are dedicated  
bundles for different resource routes.

as long as your file size is fairly low (<80kb), a single css file loading is always better than a dedicated css file per component.  
this is how the framework is configured as a starting point. if you look inside `/src/entry/css-dir-product-defer` you'll see that  
it includes the `product-defer` css module, as you would except, but before that it includes the `base-defer` module.  
this is how all resource routes are structured. meaning, product, page, collection, blog, article

you are welcome to change this configuration, and in fact it may be advisable to do so based on your particular build.  
every file in `/src/entry` will compile an individual css or ts package, so you're welcome to re group these files in whichever  
way makes the site go brrr

for the most part, all CSS files are loaded in `theme.liquid` with a few exceptions. `featured-product.liquid` section loads  
in the product assets and the `main-collection.liquid` and `main-product.liquid` sections also load in their respective assets

### adding new typescript files
this framework, like Dawn, assumes web components will be used for interactivity

to create a new web component, first add the file to the respective folder in `src/scripts` then link it to a relevant entrypoint in  
`src/entrypoints`. unlike CSS there is no `modules` folder - just add to entrypoints directly

unlike CSS, javascript (typescript) components are not grouped into deferred modules. this is something I've gone back and forth on.  
in some builds, you may want to just group all javascript into prio vs deferred entrypoints.

### optimization
before handing this off to a merchant, I strongly suggest stripping out all unused code. not only will this help performance,  
it will reduce confusion for future devs who might inherit the project (or for you, 9 months from now)  

once you have done this, you may find that the existing vite build no longer makes sense. taking the extra time to move things  
around for the best possible balance between prioritizing and deferring files is an important step in the process  
if you're looking to achieve the high performance theme build that I am promising here (~1.5s LCP, no CLS)

## framework features

### viewport scaling
the whole theme is setup to automatically scale your ui based on the horizontal viewport width

this code assumes
- your desktop design is at 1440px
- your mobile design is at 375px

you can adjust those params but I'm not going to get into that rn. check functions.scss and variables.scss

so if you punch in `$ax24` for something that is 24px in the 1440px figma, that value will maintain its size relevant to the screen. this avoids the post-build "it doesnt look like the figma" conversation

there are built in css variables for 1-50 px. so you can use `$ax1`, `$ax2` etc up to 50. at that point you can use the `ax()` function - i.e. width: `ax(360)`

these are not just sass variables, they're css variables, so `var(--ax1)` is valid. can be useful if you're setting values in liquid. 

same goes for the `ax()` function. so instead of `ax(5)` you would just do `calc(var(--ax) * 5)`

### utility CSS
(docs TODO)

### art direction
(docs TODO)

## cart features
this framework ships with a GWP feature and the option to extend your own custom cart features
primarily this functionality runs in liquid and uses the bundled section rendering api on cart reload to determine if a cart update is required

### metaobject setup
the cart features are build for a specific metaobject definition structure. use the [graphiql app](https://shopify.dev/docs/api/usage/api-exploration/admin-graphiql-explorer) to add the definitions to your store
make sure you have read/write permissions selected for metaobject, metafield, customer, and product

#### initial query
from inside the graphql app, use this query for all 4 definitions  

```graphql
mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
  metaobjectDefinitionCreate(definition: $definition) {
    metaobjectDefinition {
      id
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

past the complete json from each of the three following definitions in the 'variables' area in the app then click the pink "play" icon  
*important*: keep note of the ID returned in the app from each definition. it will be something like "gid://shopify/MetaobjectDefinition/1790836821"

#### Offer Group (Product)
```json
{
  "definition": {
    "name": "Offer Group (Product)",
    "type": "offer_group_product",
    "description": "A group of products that are promoted for an offer. Attach this to an offer.",
    "fieldDefinitions": [
      {
        "key": "label",
        "name": "Label",
        "type": "single_line_text_field",
        "required": true,
        "validations": []
      },
      {
        "key": "products",
        "name": "Products",
        "type": "list.product_reference",
        "required": false,
        "validations": []
      }
    ],
    "capabilities": {
      "onlineStore": {
        "data": null,
        "enabled": false
      },
      "publishable": {
        "enabled": true
      },
      "renderable": {
        "enabled": false,
        "data": null
      },
      "translatable": {
        "enabled": true
      }
    }
  }
}
```    

#### Offer Condition (Customer)
```json
{
  "definition": {
    "name": "Offer Condition (Customer)",
    "type": "offer_condition_customer",
    "description": "Attach to an offer to enable or disable an offer for this group",
    "fieldDefinitions": [
      {
        "key": "label",
        "name": "Label",
        "type": "single_line_text_field",
        "required": true,
        "validations": []
      },
      {
        "key": "metafields_include",
        "name": "Include Customer Group",
        "type": "list.single_line_text_field",
        "required": false,
        "validations": [
          {
            "name": "choices",
            "value": "[\"evil\",\"vip\"]"
          }
        ]
      },
      {
        "key": "metafields_exclude",
        "name": "Exclude Customer Group",
        "type": "list.single_line_text_field",
        "required": false,
        "validations": [
          {
            "name": "choices",
            "value": "[\"evil\",\"vip\"]"
          }
        ]
      }
    ],
    "capabilities": {
      "onlineStore": {
        "data": null,
        "enabled": false
      },
      "publishable": {
        "enabled": true
      },
      "renderable": {
        "enabled": false,
        "data": null
      },
      "translatable": {
        "enabled": true
      }
    }
  }
}
```  

#### Offer Condition (Cart Threshold)
```json
{
  "definition": {
    "name": "Offer Condition (Cart Threshold)",
    "type": "offer_condition_cart_threshold",
    "description": "Attach to a condition to enable or disable an offer based on cart threshold",
    "fieldDefinitions": [
      {
        "key": "label",
        "name": "Label",
        "type": "single_line_text_field",
        "required": true,
        "validations": []
      },
      {
        "key": "minimum_cart_value",
        "name": "Minimum Cart Value",
        "type": "money",
        "required": true,
        "validations": []
      },
      {
        "key": "maximum_cart_value",
        "name": "Maximum Cart Value",
        "type": "money",
        "required": false,
        "validations": []
      }
    ],
    "capabilities": {
      "onlineStore": {
        "data": null,
        "enabled": false
      },
      "publishable": {
        "enabled": true
      },
      "renderable": {
        "enabled": false,
        "data": null
      },
      "translatable": {
        "enabled": true
      }
    }
  }
}
```

#### GWP Offer
For this definition, you will need the metaobject definition ids from the previous three. 
Replace "<offer_group_product_id_here>" with the gid returned for Offer Group (Product), same idea for the other 3

Example of json syntax for array definitions: `"value": "[\"gid://shopify/MetaobjectDefinition/1790771285\",\"gid://shopify/MetaobjectDefinition/1790738517\"]"`  
(replace the ids obviously)

```json
{
  "definition": {
    "name": "GWP Offer",
    "type": "gwp_offer",
    "description": "Top-level offer configuration. Add all your conditions and product offer group here.",
    "fieldDefinitions": [
      {
        "key": "label",
        "name": "Label",
        "type": "single_line_text_field",
        "required": true,
        "validations": []
      },
      {
        "key": "display_title",
        "name": "Success Message",
        "type": "single_line_text_field",
        "required": true,
        "validations": [
          {
            "name": "max",
            "value": "36"
          }
        ]
      },
      {
        "key": "display_cta",
        "name": "Display CTA",
        "type": "single_line_text_field",
        "required": true,
        "validations": [
          {
            "name": "max",
            "value": "18"
          }
        ]
      },
      {
        "key": "product_offer",
        "name": "Product Offer",
        "type": "metaobject_reference",
        "required": true,
        "validations": [
          {
            "name": "metaobject_definition_id",
            "value": "<offer_group_product_id_here>"
          }
        ]
      },
      {
        "key": "enable_condition_operator",
        "name": "Enable Condition operator",
        "type": "single_line_text_field",
        "required": false,
        "validations": [
          {
            "name": "choices",
            "value": "[\"OR\",\"AND\"]"
          }
        ]
      },
      {
        "key": "enable_conditions",
        "name": "Enable Conditions",
        "type": "list.mixed_reference",
        "required": false,
        "validations": [
          {
            "name": "metaobject_definition_ids",
            "value": "[\"<offer_condition_customer_id_here>\",\"<offer_condition_cart_threshold_id_here>\"]"
          }
        ]
      },
      {
        "key": "disable_condition_operator",
        "name": "Disable Condition Operator",
        "type": "single_line_text_field",
        "required": false,
        "validations": [
          {
            "name": "choices",
            "value": "[\"OR\",\"AND\"]"
          }
        ]
      },
      {
        "key": "disable_conditions",
        "name": "Disable Conditions",
        "type": "list.mixed_reference",
        "required": true,
        "validations": [
          {
            "name": "metaobject_definition_ids",
            "value": "[\"<offer_condition_customer_id_here>\",\"<offer_condition_cart_threshold_id_here>\"]"
          }
        ]
      },
      {
        "key": "json",
        "name": "JSON",
        "type": "json",
        "required": false,
        "validations": []
      }
    ],
    "capabilities": {
      "onlineStore": {
        "data": null,
        "enabled": false
      },
      "publishable": {
        "enabled": true
      },
      "renderable": {
        "enabled": false,
        "data": null
      },
      "translatable": {
        "enabled": true
      }
    }
  }
}
```


### cart validation function (plus only)



## notes
- critical css/js files are not part of the build. when you run `pnpm build` you will get a critical.css file in the `/assets` folder. you can uhh copy this into the `critical-css.liquid` file. "why dont you just use the `inline_asset_content` filter?" right. thanks for reminding me. :)
- refer to [volt](https://shopify-vite.barrelny.com/guide/) docs for vite specifics. tldr: put fonts and static assets in /public because they will get deleted by `pnpm build` if you just put them in assets
- please dont be one of those people who doesnt hand off the codebase because its your "proprietary system". lol. as long as a merchant has paid their bills, if they ask for the code just send it to them.

## support / updates
- two weeks from this commit i will be starting a full time engineering role at shopify. which means when you read this i will probably be have @shopify in my bio. so i think it's important to clarify, this repo is ***not officially supported by shopify whatsoever***
- i am looking for one or two collaborators to take up community support here
- any issues, submit an issue
