// Every theme is a folder with a theme.css that scopes its tokens under
// [data-theme='<folder name>']. Adding a folder registers the theme; there is
// no list to update. See src/themes/README.md.
const modules = import.meta.glob('./*/theme.css', { eager: true })

export const themeNames = Object.keys(modules).map((path) => path.split('/')[1])
