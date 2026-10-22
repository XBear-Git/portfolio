/* =========================================================
   熊珅 · 个人网站 共用脚本
   - 导航滚动状态 / 滚动高亮
   - Hero 背景淡入淡出
   - 项目卡片图片轮播
   - 性能图表生长动画
   - 作品页双 Tab 切换
   - PDF 弹窗
   ========================================================= */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 1. 导航滚动状态 ---------- */
    var nav = document.getElementById('siteNav');
    function syncNav() {
        if (!nav) return;
        nav.classList.toggle('is-solid', window.scrollY > 40);
    }
    syncNav();
    window.addEventListener('scroll', syncNav, { passive: true });

    /* ---------- 2. 首页滚动高亮 ---------- */
    var navLinks = Array.prototype.slice.call(
        document.querySelectorAll('.nav-links a[href^="#"]')
    );
    var linkPairs = [];
    navLinks.forEach(function (link) {
        var id = link.getAttribute('href');
        var el = id && id.length > 1 ? document.querySelector(id) : null;
        if (el) linkPairs.push({ link: link, el: el });
    });

    function clearActive() {
        navLinks.forEach(function (l) { l.classList.remove('is-active'); });
    }
    function setActive(link) {
        clearActive();
        if (link) link.classList.add('is-active');
    }

    if (linkPairs.length && 'IntersectionObserver' in window) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                for (var i = 0; i < linkPairs.length; i++) {
                    if (linkPairs[i].el === entry.target) {
                        setActive(linkPairs[i].link);
                        break;
                    }
                }
            });
        }, { rootMargin: '-38% 0px -52% 0px', threshold: 0 });

        linkPairs.forEach(function (pair) { spy.observe(pair.el); });

        window.addEventListener('scroll', function () {
            if (window.scrollY < window.innerHeight * 0.55) clearActive();
        }, { passive: true });
    }

    /* ---------- 3. Hero 背景轮播（5s 淡入淡出） ---------- */
    var heroSlides = document.querySelectorAll('[data-hero-slide]');
    if (heroSlides.length > 1 && !reduceMotion) {
        var heroIndex = 0;
        setInterval(function () {
            heroSlides[heroIndex].classList.remove('is-active');
            heroIndex = (heroIndex + 1) % heroSlides.length;
            heroSlides[heroIndex].classList.add('is-active');
        }, 5000);
    }

    /* ---------- 4. 项目卡片图片轮播（3s） ---------- */
    Array.prototype.forEach.call(document.querySelectorAll('[data-carousel]'), function (carousel) {
        var track = carousel.querySelector('.carousel-track');
        var slides = carousel.querySelectorAll('.carousel-slide');
        var dots = carousel.querySelectorAll('.carousel-dot');
        if (!track || slides.length < 2) return;

        var index = 0;
        var timer = null;

        function go(next) {
            index = (next + slides.length) % slides.length;
            track.style.transform = 'translateX(-' + (index * 100) + '%)';
            Array.prototype.forEach.call(dots, function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function stop() { if (timer) { clearInterval(timer); timer = null; } }
        function start() {
            if (reduceMotion) return;
            stop();
            timer = setInterval(function () { go(index + 1); }, 3000);
        }

        Array.prototype.forEach.call(dots, function (dot, i) {
            dot.addEventListener('click', function () { go(i); start(); });
        });
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);

        go(0);
        start();
    });

    /* ---------- 5. 性能图表生长动画 ---------- */
    function growChart(chart, stagger) {
        if (!chart || chart.getAttribute('data-grown') === '1') return;
        chart.setAttribute('data-grown', '1');
        var bars = chart.querySelectorAll('.chart-bar');
        Array.prototype.forEach.call(bars, function (bar, i) {
            bar.style.transitionDelay = (stagger && !reduceMotion ? i * 70 : 0) + 'ms';
            bar.classList.add('grow');
        });
    }

    var charts = document.querySelectorAll('.perf-chart');
    if (charts.length) {
        if (reduceMotion || !('IntersectionObserver' in window)) {
            Array.prototype.forEach.call(charts, function (c) { growChart(c, false); });
        } else {
            var chartObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        growChart(entry.target, true);
                        chartObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.25 });
            Array.prototype.forEach.call(charts, function (c) { chartObserver.observe(c); });
        }
    }

    /* ---------- 6. 作品页双 Tab 切换 ---------- */
    var tabButtons = document.querySelectorAll('[data-tab]');
    var panels = document.querySelectorAll('[data-panel]');
    var panelTitles = document.querySelectorAll('[data-panel-title]');
    var panelDescs = document.querySelectorAll('[data-panel-desc]');

    var PANEL_META = {
        game: {
            title: '客户端项目作品',
            desc: 'UE / 客户端方向：网络同步、资源热更、渲染性能优化与 Gameplay。',
            doc: '项目作品 · 客户端 · 熊珅'
        },
        ui: {
            title: 'UI 项目作品',
            desc: 'UI 专项：数据驱动界面、Common UI 框架、UI 适配与性能排查。',
            doc: '项目作品 · UI · 熊珅'
        }
    };

    function activatePanel(name, updateHash, scrollTop) {
        if (!PANEL_META[name]) name = 'game';

        Array.prototype.forEach.call(panels, function (panel) {
            panel.classList.toggle('is-active', panel.getAttribute('data-panel') === name);
        });
        Array.prototype.forEach.call(tabButtons, function (btn) {
            var on = btn.getAttribute('data-tab') === name;
            btn.classList.toggle('is-active', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        Array.prototype.forEach.call(panelTitles, function (el) {
            el.textContent = PANEL_META[name].title;
        });
        Array.prototype.forEach.call(panelDescs, function (el) {
            el.textContent = PANEL_META[name].desc;
        });
        document.title = PANEL_META[name].doc;

        if (updateHash && window.history && history.replaceState) {
            history.replaceState(null, '', '#' + name);
        }

        if (scrollTop) {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
    }

    if (tabButtons.length && panels.length) {
        Array.prototype.forEach.call(tabButtons, function (btn) {
            btn.addEventListener('click', function () {
                activatePanel(btn.getAttribute('data-tab'), true, true);
            });
        });

        var initial = (location.hash || '').replace('#', '');
        activatePanel(PANEL_META[initial] ? initial : 'game', false, false);

        window.addEventListener('hashchange', function () {
            var name = (location.hash || '').replace('#', '');
            activatePanel(PANEL_META[name] ? name : 'game', false, false);
        });
    }

    /* ---------- 7. PDF 弹窗 ---------- */
    var pdfModal = document.getElementById('pdfModal');
    if (pdfModal) {
        var pdfFrame = document.getElementById('pdfModalFrame');
        var pdfTitle = document.getElementById('pdfModalTitle');
        var pdfExternal = document.getElementById('pdfModalExternal');
        var pdfLastFocus = null;

        function openPdf(url, title) {
            pdfLastFocus = document.activeElement;
            pdfTitle.textContent = title || 'PDF 预览';
            pdfExternal.setAttribute('href', url);
            pdfFrame.setAttribute('src', url);
            pdfModal.hidden = false;
            document.body.classList.add('modal-open');
            var btn = pdfModal.querySelector('.pdf-modal-close');
            if (btn) btn.focus();
        }
        function closePdf() {
            pdfModal.hidden = true;
            document.body.classList.remove('modal-open');
            pdfFrame.setAttribute('src', 'about:blank');
            if (pdfLastFocus && pdfLastFocus.focus) pdfLastFocus.focus();
        }

        Array.prototype.forEach.call(document.querySelectorAll('a.js-pdf'), function (link) {
            link.addEventListener('click', function (e) {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                openPdf(link.getAttribute('href'), link.getAttribute('data-pdf-title'));
            });
        });

        Array.prototype.forEach.call(pdfModal.querySelectorAll('[data-pdf-close]'), function (el) {
            el.addEventListener('click', closePdf);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !pdfModal.hidden) closePdf();
        });
    }
})();
