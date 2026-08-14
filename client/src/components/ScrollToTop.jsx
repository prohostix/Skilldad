import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
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
