# Template

This is a template markdown file for the markdown viewer. Copy it, delete what you don't need, and keep the pieces you like. Each example shows the syntax first, then how it renders.

## Headings

The sidebar is built from your headings: `#` is numbered (01, 02), `##` is lettered (a, b, c), and `###` is roman (i, ii, iii). Use one `#` for the page title.

```
# Page title
## Section
### Subsection
```

### A subsection

This is a `###` heading. It restarts at i under every `##` section.

## Text

```
**bold**, *italic*, ~~strikethrough~~, `inline code`
[a link](https://umich.edu)
```

**Bold**, *italic*, ~~strikethrough~~, and `inline code`. Here is [a link](https://umich.edu) that opens in a new tab, and [one to my home page](/index.html) that doesn't.

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

---

That's everything the viewer styles.
