function applyTheme(theme) {
    document.body.className = theme
    localStorage.setItem("theme", theme)
}

function loadTheme() {
    const savedTheme = localStorage.getItem("theme")
    const isPreferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme) {
        applyTheme(savedTheme)
    } else {
        applyTheme(isPreferredDark ? "dark" : "light")
    }
}

document.addEventListener("DOMContentLoaded", loadTheme)