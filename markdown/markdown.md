# Template

This is a template markdown file for the markdown viewer. Copy it, delete what you don't need, and keep the pieces you like. Each example shows the syntax first, then how it renders.

## Headings

The sidebar is built from your headings: `##` is numbered (01, 02), `###` is lettered (a, b, c), and `####` is roman (i, ii, iii). Use one `#` for the page title.

```
# Page title
## Section
### Subsection
#### SubSubsection
```

### A subsection

This is a `###` heading. It restarts at a under every `##` section.

#### A subsubsection

This is a `####` heading. It restarts at i under every `###` section.

## Text

```
**bold**, *italic*, ~~strikethrough~~, `inline code`
[a link](https://umich.edu)
```

**Bold**, *italic*, ~~strikethrough~~, and `inline code`. Here is [a link](https://umich.edu) that opens in a new tab, and [one to my home page](/index.html) that doesn't.

## Footnotes

Highlight any text and attach a note to it. On wide screens, hovering the highlight previews the note in the bottom-right corner, clicking it keeps the note open until you scroll, and clicking the number jumps to the note at the bottom of the page. On small screens, tapping the highlight opens the note inline, and tapping again closes it.

```
We visited Salem in the ==peak of October==[^peak] and took the ==T==[^t] there.
A bare number works too, with nothing highlighted.[^bare]

[^peak]: Peak here meaning both for **Salem** and midterms.
[^t]: Short for the *MBTA*, Boston's [subway system](https://www.mbta.com).
[^bare]: Notes can use `code`, **bold**, *italic*, and links.
```

We visited Salem in the ==peak of October==[^peak] and took the ==T==[^t] there. A bare number works too, with nothing highlighted.[^bare]

[^peak]: Peak here meaning both for **Salem** and midterms.
[^t]: Short for the *MBTA*, Boston's [subway system](https://www.mbta.com).
[^bare]: Notes can use `code`, **bold**, *italic*, and links.

## Lists

### Bulleted

```
- First thing
- Second thing
  - A nested thing
```

- First thing
- Second thing
  - A nested thing

### Numbered

```
1. Preheat the oven
2. Mix everything
3. Bake
```

1. Preheat the oven
2. Mix everything
3. Bake

### Checklist

Items can be ticked off on the page, but they reset when you reload.

```
- [ ] Not done yet
- [x] Already done
```

- [ ] Not done yet
- [x] Already done

## Quotes and code

```
> A quote, set apart from the text.
```

> A quote, set apart from the text.

Wrap code in three backticks for a block:

````
```
print("Hello, world")
```
````

```
print("Hello, world")
```

## Tables

```
| Ingredient | Amount |
| ---------- | ------ |
| Flour      | 250g   |
| Butter     | 125g   |
```

| Ingredient | Amount |
| ---------- | ------ |
| Flour      | 250g   |
| Butter     | 125g   |

## Images and dividers

Put images in your site's `assets` folder and link them with a path starting with `/`. A line of three dashes draws a divider.

```
![A description of the image](/assets/images/example.jpg)

---
```
![A description of the image](https://placecats.com/500/500)

---

![A description of the image](https://placecats.com/500/500 "A description of the image")

---

### Carousels

Put one image per line in a code block labeled carousel.

```carousel
![A cat](https://placecats.com/300/200 "Hannah patches up a giant hole, whoops")
![Another cat](https://placecats.com/400/300)
![One more cat](https://placecats.com/500/350 "The last one")
```

## Embedded Content

You can paste in iframes from other websites to embed html content

### Youtube Videos

<iframe width="560" height="315" src="https://www.youtube.com/embed/ajkErzMjR0k?si=EmLm1RowMYeoIfKm" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### Spotify and Bandcamp Playlists

<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/playlist/1Eilkouva8zPsNEVSvAiKf?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>

<iframe style="border: 0; width: 800px; height: 241px;" src="https://bandcamp.com/EmbeddedPlayer/album=269655907/size=large/bgcol=ffffff/linkcol=63b2cc/artwork=small/transparent=true/" seamless><a href="https://unicornmasquerade.bandcamp.com/album/a-unicorn-masquerade">A Unicorn Masquerade by A Unicorn Masquerade</a></iframe>

### Codepen

<iframe height="300" style="width: 100%;" scrolling="no" title="offsetpath whimsical fun - sparkle hover" src="https://codepen.io/editor/kevinpowell/embed/019edbf1-79cb-739e-a285-9780858eb92e?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true">
  See the Pen <a href="https://codepen.io/editor/kevinpowell/pen/019edbf1-79cb-739e-a285-9780858eb92e">
  offsetpath whimsical fun - sparkle hover</a> by Kevin (<a href="https://codepen.io/kevinpowell">@kevinpowell</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

That's everything the viewer styles.
