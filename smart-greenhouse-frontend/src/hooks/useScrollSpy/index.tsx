import { useEffect, useState } from 'react';

export const useScrollSpy = (sectionIds: string[], offset = 0) => {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      let current: string = sectionIds[0];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top - offset <= 0) {
            current = id;
          } else {
            break;
          }
        }
      }

      setActiveId(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionIds, offset]);

  return activeId;
};
