import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // The two-arg form inherits the page's CSS `scroll-behavior` (set to
        // smooth globally in index.css), which makes every route change
        // visibly animate from wherever you were scrolled to on the old page
        // up to the top of the new one. `behavior: 'instant'` bypasses that
        // and jumps straight there, so a new page always opens at its top.
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname]);

    // useLocation only changes when the pathname actually changes, so clicking a
    // nav link back to the page you're already on (e.g. clicking "Courses" while
    // scrolled down on /courses) doesn't retrigger the effect above - handle that
    // case by watching for clicks on same-page links directly.
    useEffect(() => {
        const handleClick = (e) => {
            const anchor = e.target.closest('a');
            if (anchor && anchor.getAttribute('href') === window.location.pathname) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    return null;
};

export default ScrollToTop;
