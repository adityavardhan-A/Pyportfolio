# Adityavardhan | Advanced Python Programming

## Open it
Double-click `index.html`. It works without a server and without internet (the fonts are included).

## Edit it
Almost everything lives in **`data/content.js`**:

| What | Where in content.js |
|---|---|
| Your name, course, year | top: `name`, `course`, `year` |
| Hero text, buttons, featured project | `hero` |
| About text and boarding pass | `pass` |
| Projects ("stops") | `stops` |
| Library heading and button | `library` |
| Sharmila Banu Ma'am's 10 stars | `tribute.stars` |
| Email, GitHub, LinkedIn | `contact.links` |

### Projects (`stops`)
- `"route": "main"` puts it on the timeline. `"side"` puts it in Out of the box.
- `"sortDate": "2026-10-31"` sets the timeline order.
- `"image": "assets/img/your-picture.jpg"`: drop your own pictures into `assets/img/`.
- `"links": [{"label": "Live site", "url": "https://..."}]` adds buttons in the pop-up.
- `"files"` fills the Library. Put the file in `assets/library/<project-id>/` and add
  `{"label": "My report", "src": "assets/library/<project-id>/report.pdf", "kind": "pdf"}`.
  Kinds: image, video, audio, pdf, slides, text, doc, code (code = a file name from data/source.js, opens in the code reader).
- `"badge"` shows a small tick label on Out of the box cards.
- Delete a whole `{ ... },` block to remove a project, or copy one to add a new one.

**Example pictures still to replace:** LeetCode picks, Storyboard, Tree Coverage and the Medium article use drawn example pictures (marked "Example"). Put your real files in `assets/library/<project-id>/` and point `image` and `files` at them.

### Other things you can edit in content.js
- `hero.repl`: the lines the little Python console types on the cover.
- `hero.dedication`: the gold badge on the cover that links to Ma'am's stars.
- `quotes.bandA` / `quotes.bandB`: the two scrolling bands of Python quotes.
- `tribute.stars`: Ma'am's stars (the finale spells THANK YOU MA'AM once all are lit).
- `experience`: the Looking Back section at the end.

### LifeAdmin source code
`data/source.js` holds the LifeAdmin code shown in the site's code reader. To refresh it after you change the repo, re-run the snippet in the comment at the top of that file, or ask Claude to regenerate it.

### The stars
Each star has a `title` and a `text`. The final message (shown after all stars are lit) is `finalHeading`, `finalText` and `signature`.

## Put it online (Firebase, like your friend's)
```
npm install -g firebase-tools
firebase login
firebase init hosting   (public directory: .)
firebase deploy
```
