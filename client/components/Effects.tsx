'use client';

import { useEffect, useRef } from 'react';

/** Scroll reveals, line-art draw-in, custom cursor and magnetic buttons. */
export default function Effects() {
  const cur = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: (() => void)[] = [];

    /* line-art draw-in setup */
    document.querySelectorAll<SVGGeometryElement>('.ill .ln').forEach((p, i) => {
      p.setAttribute('pathLength', '1');
      p.style.transitionDelay = `${(i % 8) * 0.12}s`;
    });

    /* reveal on scroll: only elements below the fold start hidden */
    if (!reduce) {
      const pending: Element[] = [];
      document.querySelectorAll('.rv, .how-ill').forEach((el) => {
        if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
          el.classList.add('pre');
          pending.push(el);
        }
      });
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.remove('pre');
                io.unobserve(e.target);
              }
            });
          },
          { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
        );
        pending.forEach((el) => io.observe(el));
        cleanups.push(() => io.disconnect());
      } else {
        pending.forEach((el) => el.classList.remove('pre'));
      }
    }

    /* cursor + magnetic buttons (fine pointers only) */
    if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches && cur.current) {
      const ring = cur.current;
      let cx = 0, cy = 0, tx = 0, ty = 0, started = false, raf = 0;
      const onMove = (e: MouseEvent) => {
        tx = e.clientX;
        ty = e.clientY;
        if (!started) {
          started = true;
          cx = tx;
          cy = ty;
          ring.classList.add('on');
        }
        const t = e.target as Element | null;
        ring.classList.toggle('big', !!t?.closest?.('a,button,summary'));
      };
      const loop = () => {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        ring.style.transform = `translate(${cx}px,${cy}px)`;
        raf = requestAnimationFrame(loop);
      };
      window.addEventListener('mousemove', onMove);
      raf = requestAnimationFrame(loop);
      cleanups.push(() => {
        window.removeEventListener('mousemove', onMove);
        cancelAnimationFrame(raf);
      });

      document.querySelectorAll<HTMLElement>('.mag').forEach((el) => {
        const move = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
        };
        const leave = () => {
          el.style.transform = '';
        };
        el.addEventListener('mousemove', move);
        el.addEventListener('mouseleave', leave);
        cleanups.push(() => {
          el.removeEventListener('mousemove', move);
          el.removeEventListener('mouseleave', leave);
        });
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return <div className="cur" ref={cur} aria-hidden="true" />;
}
