export const CLE_THEME = "quotient:theme";

/**
 * Script exécuté avant l'affichage (dans le <head> du layout) : applique le thème mémorisé,
 * sinon celui du système, pour éviter un flash de la mauvaise couleur.
 */
export const SCRIPT_THEME = `try{var t=localStorage.getItem("${CLE_THEME}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;
