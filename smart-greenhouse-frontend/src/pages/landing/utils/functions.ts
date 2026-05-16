import { SECTIONS } from "./constants";


export const scrollToSection = (section: SECTIONS) => {

    if (section === SECTIONS.HOME) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        const el = document.getElementById(section);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
};