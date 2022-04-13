document.addEventListener('DOMContentLoaded', function () {
    const switchDarkMode = () => {
        const nowMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
        if (nowMode === 'light') {
            activateDarkMode()
            saveToLocal.set('theme', 'dark', 2)
            GLOBAL_CONFIG.Snackbar !== undefined && jyUtils.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
        } else {
            activateLightMode()
            saveToLocal.set('theme', 'light', 2)
            GLOBAL_CONFIG.Snackbar !== undefined && jyUtils.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day)
        }
        typeof runMermaid === 'function' && window.runMermaid()
    }

    document.getElementById('moon-switch').addEventListener('click', switchDarkMode)

    let mobileMenuOpen = false
    const sidebarFn = {
        open: () => {
            document.body.style.overflow = 'hidden'
            jyUtils.animateIn(document.getElementById('mobile-header'), 'bottom-effect .5s')
            document.getElementById('mobile-header').classList.add('show-mobile-header')
            mobileMenuOpen = true
        },
        close: () => {
            const $body = document.body
            $body.style.overflow = ''
            jyUtils.animateOut(document.getElementById('mobile-header'), 'to_hide .5s')
            document.getElementById('mobile-header').classList.remove('show-mobile-header')
            mobileMenuOpen = false
        }
    }

    /**
     * menu
     * 导航栏点击展开、收缩
     */
    const clickFnOfSubMenu = () => {
        document.querySelectorAll('#mobile-header .name.group').forEach(function (item) {
            item.addEventListener('click', function () {
                this.classList.toggle('mobile-hide')
            })
        })
    }
    const rightSideFn = () => {
        const $goTopBtn = document.getElementById('go-top');
        if ($goTopBtn) {
            $goTopBtn.addEventListener('click', function () {
                jyUtils.scrollToDest(0, 350)
            })
        }
    }
    /**
     * table overflow
     */
    const addTableWrap = () => {
        const $table = document.querySelectorAll('.post-inner :not(.highlight) > table, .post-inner > table')
        if ($table.length) {
            $table.forEach(item => {
                jyUtils.wrap(item, 'div', {class: 'table-wrap'})
            })
        }
    }

    /**
     * tag-hide
     */
    const clickFnOfTagHide = function () {
        const $hideInline = document.querySelectorAll('.post-inner .hide-button')
        if ($hideInline.length) {
            $hideInline.forEach(function (item) {
                item.addEventListener('click', function (e) {
                    const $this = this
                    $this.classList.add('open')
                    const $fjGallery = $this.nextElementSibling.querySelectorAll('.fj-gallery')
                    $fjGallery.length && jyUtils.initJustifiedGallery($fjGallery)
                })
            })
        }
    }

    /**
     * justified-gallery
     */
    const runJustifiedGallery = function (ele) {
        ele.forEach(item => {
            const $imgList = item.querySelectorAll('img')

            $imgList.forEach(i => {
                const dataLazySrc = i.getAttribute('data-lazy-src')
                if (dataLazySrc) i.src = dataLazySrc
                jyUtils.wrap(i, 'div', {class: 'fj-gallery-item'})
            })
        })

        if (window.fjGallery) {
            setTimeout(() => {
                jyUtils.initJustifiedGallery(ele)
            }, 100)
            return
        }

        const newEle = document.createElement('link')
        newEle.rel = 'stylesheet'
        newEle.href = GLOBAL_CONFIG.source.justifiedGallery.css
        document.body.appendChild(newEle)
        getScript(`${GLOBAL_CONFIG.source.justifiedGallery.js}`).then(() => {
            jyUtils.initJustifiedGallery(ele)
        })
    }

    const tabsFn = {
        clickFnOfTabs: function () {
            document.querySelectorAll('.post-inner .tab > button').forEach(function (item) {
                item.addEventListener('click', function (e) {
                    const $this = this
                    const $tabItem = $this.parentNode

                    if (!$tabItem.classList.contains('active')) {
                        const $tabContent = $tabItem.parentNode.nextElementSibling
                        const $siblings = jyUtils.siblings($tabItem, '.active')[0]
                        $siblings && $siblings.classList.remove('active')
                        $tabItem.classList.add('active')
                        const tabId = $this.getAttribute('data-href').replace('#', '')
                        const childList = [...$tabContent.children]
                        childList.forEach(item => {
                            if (item.id === tabId) item.classList.add('active')
                            else item.classList.remove('active')
                        })
                        const $isTabJustifiedGallery = $tabContent.querySelectorAll(`#${tabId} .fj-gallery`)
                        if ($isTabJustifiedGallery.length > 0) {
                            jyUtils.initJustifiedGallery($isTabJustifiedGallery)
                        }
                    }
                })
            })
        },
        backToTop: () => {
            document.querySelectorAll('.post-inner .tabs .tab-to-top').forEach(function (item) {
                item.addEventListener('click', function () {
                    jyUtils.scrollToDest(jyUtils.getEleTop(jyUtils.getParents(this, '.tabs')), 300)
                })
            })
        },
        getEleTop: ele => {
            let actualTop = ele.offsetTop
            let current = ele.offsetParent

            while (current !== null) {
                actualTop += current.offsetTop
                current = current.offsetParent
            }

            return actualTop
        },
        getParents: (elem, selector) => {
            for (; elem && elem !== document; elem = elem.parentNode) {
                if (elem.matches(selector)) return elem
            }
            return null
        }
    }

    const addHighlightTool = function () {
        const highLight = GLOBAL_CONFIG.highlight
        if (!highLight) return

        const isHighlightCopy = highLight.highlightCopy
        const isHighlightLang = highLight.highlightLang
        const isHighlightShrink = GLOBAL_CONFIG.isHighlightShrink
        const highlightHeightLimit = highLight.highlightHeightLimit
        const isShowTool = isHighlightCopy || isHighlightLang || isHighlightShrink !== undefined
        const $figureHighlight = highLight.plugin === 'highlighjs' ? document.querySelectorAll('figure.highlight') : document.querySelectorAll('pre[class*="language-"]')

        if (!((isShowTool || highlightHeightLimit) && $figureHighlight.length)) return

        const isPrismjs = highLight.plugin === 'prismjs'

        let highlightShrinkEle = ''
        let highlightCopyEle = ''
        const highlightShrinkClass = isHighlightShrink === true ? 'closed' : ''

        if (isHighlightShrink !== undefined) {
            highlightShrinkEle = `<i class="fas fa-angle-down expand ${highlightShrinkClass}"></i>`
        }

        if (isHighlightCopy) {
            highlightCopyEle = '<div class="copy-notice"></div><i class="fas fa-paste copy-button"></i>'
        }

        const copy = (text, ctx) => {
            if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
                document.execCommand('copy')
                if (GLOBAL_CONFIG.Snackbar !== undefined) {
                    jyUtils.snackbarShow(GLOBAL_CONFIG.copy.success)
                } else {
                    const prevEle = ctx.previousElementSibling
                    prevEle.innerText = GLOBAL_CONFIG.copy.success
                    prevEle.style.opacity = 1
                    setTimeout(() => {
                        prevEle.style.opacity = 0
                    }, 700)
                }
            } else {
                if (GLOBAL_CONFIG.Snackbar !== undefined) {
                    jyUtils.snackbarShow(GLOBAL_CONFIG.copy.noSupport)
                } else {
                    ctx.previousElementSibling.innerText = GLOBAL_CONFIG.copy.noSupport
                }
            }
        }

        // click events
        const highlightCopyFn = (ele) => {
            const $buttonParent = ele.parentNode
            $buttonParent.classList.add('copy-true')
            const selection = window.getSelection()
            const range = document.createRange()
            if (isPrismjs) range.selectNodeContents($buttonParent.querySelectorAll('pre code')[0])
            else range.selectNodeContents($buttonParent.querySelectorAll('table .code pre')[0])
            selection.removeAllRanges()
            selection.addRange(range)
            const text = selection.toString()
            copy(text, ele.lastChild)
            selection.removeAllRanges()
            $buttonParent.classList.remove('copy-true')
        }

        const highlightShrinkFn = (ele) => {
            const $nextEle = [...ele.parentNode.children].slice(1)
            ele.firstChild.classList.toggle('closed')
            if (jyUtils.isHidden($nextEle[$nextEle.length - 1])) {
                $nextEle.forEach(e => {
                    e.style.display = 'block'
                })
            } else {
                $nextEle.forEach(e => {
                    e.style.display = 'none'
                })
            }
        }

        const highlightToolsFn = function (e) {
            const $target = e.target.classList
            if ($target.contains('expand')) highlightShrinkFn(this)
            else if ($target.contains('copy-button')) highlightCopyFn(this)
        }

        const expandCode = function () {
            this.classList.toggle('expand-done')
        }

        function createEle(lang, item, service) {
            const fragment = document.createDocumentFragment()

            if (isShowTool) {
                const hlTools = document.createElement('div')
                hlTools.className = `highlight-tools ${highlightShrinkClass}`
                hlTools.innerHTML = highlightShrinkEle + lang + highlightCopyEle
                hlTools.addEventListener('click', highlightToolsFn)
                fragment.appendChild(hlTools)
            }

            if (highlightHeightLimit && item.offsetHeight > highlightHeightLimit + 30) {
                const ele = document.createElement('div')
                ele.className = 'code-expand-btn'
                ele.innerHTML = '<i class="fas fa-angle-double-down"></i>'
                ele.addEventListener('click', expandCode)
                fragment.appendChild(ele)
            }

            if (service === 'hl') {
                item.insertBefore(fragment, item.firstChild)
            } else {
                item.parentNode.insertBefore(fragment, item)
            }
        }

        if (isHighlightLang) {
            if (isPrismjs) {
                $figureHighlight.forEach(function (item) {
                    const langName = item.getAttribute('data-language') ? item.getAttribute('data-language') : 'Code'
                    const highlightLangEle = `<div class="code-lang">${langName}</div>`
                    jyUtils.wrap(item, 'figure', {class: 'highlight'})
                    createEle(highlightLangEle, item)
                })
            } else {
                $figureHighlight.forEach(function (item) {
                    let langName = item.getAttribute('class').split(' ')[1]
                    if (langName === 'plain' || langName === undefined) langName = 'Code'
                    const highlightLangEle = `<div class="code-lang">${langName}</div>`
                    createEle(highlightLangEle, item, 'hl')
                })
            }
        } else {
            if (isPrismjs) {
                $figureHighlight.forEach(function (item) {
                    jyUtils.wrap(item, 'figure', {class: 'highlight'})
                    createEle('', item)
                })
            } else {
                $figureHighlight.forEach(function (item) {
                    createEle('', item, 'hl')
                })
            }
        }
    }
    /**
     * Lightbox
     */
    const runLightbox = () => {
        jyUtils.loadLightbox(document.querySelectorAll('.post-inner img:not(.no-lightbox)'))
    }

    /**
     * 滚动处理
     */
    const scrollFn = function () {

        function scrollJudge(currentTop) {
            const result = currentTop > initTop
            initTop = currentTop
            return result
        }

        let initTop = 0;
        const $header = document.getElementById('header');
        const $right_side = document.getElementById('right-side');
        window.scrollCollect = function () {
            let oldScrollTop = window.scrollY || document.documentElement.scrollTop;
            let menuTimeout;
            return function () {
                let newScrollTop = window.scrollY || document.documentElement.scrollTop;
                const isDown = scrollJudge(newScrollTop);
                if (newScrollTop > 50) {
                    if (isDown) {
                        if (menuTimeout) {
                            clearTimeout(menuTimeout);
                            menuTimeout = setTimeout(() => {
                                if ($header.classList.contains('header-visible')) $header.classList.remove('header-visible')
                                oldScrollTop = newScrollTop;
                            }, 100)
                        }
                    } else {
                        menuTimeout = setTimeout(() => {
                            if (!$header.classList.contains('header-visible')) $header.classList.add('header-visible')
                            oldScrollTop = newScrollTop;
                        }, 100)
                    }
                    $right_side.classList.add('show-right-side');
                    $header.classList.add('header-bg', 'bg-filter');
                } else {
                    if (newScrollTop === 0) {
                        $header.classList.remove('header-bg', 'bg-filter', 'header-visible');
                    }
                    $right_side.classList.remove('show-right-side');
                }
            }

        }
        window.onscroll = scrollCollect();
    }

    /**
     * toc,anchor
     */
    const scrollFnToDo = function () {
        const isToc = GLOBAL_CONFIG.isToc
        const $article = document.querySelector('.post-inner')
        const $cardTocLayout = document.querySelector('.side-widget-posttoc')

        if (!($article && (isToc || $cardTocLayout))) return

        let $tocLink, $cardToc, scrollPercent, autoScrollToc, isExpand

        if (isToc) {
            $cardToc = $cardTocLayout.getElementsByClassName('toc-content')[0]
            $tocLink = $cardToc.querySelectorAll('.toc-link')
            const $tocPercentage = $cardTocLayout.querySelector('.toc-percentage')
            isExpand = $cardToc.classList.contains('is-expand')

            scrollPercent = currentTop => {
                const docHeight = $article.clientHeight
                const winHeight = document.documentElement.clientHeight
                const headerHeight = $article.offsetTop
                const contentMath = (docHeight > winHeight) ? (docHeight - winHeight) : (document.documentElement.scrollHeight - winHeight)
                const scrollPercent = (currentTop - headerHeight) / (contentMath)
                const scrollPercentRounded = Math.round(scrollPercent * 100)
                $tocPercentage.textContent = (scrollPercentRounded > 100) ? 100 : (scrollPercentRounded <= 0) ? 0 : scrollPercentRounded
            }

            window.mobileToc = {
                open: () => {
                    $cardTocLayout.style.cssText = 'animation: toc-open .3s; opacity: 1; right: 55px'
                },

                close: () => {
                    $cardTocLayout.style.animation = 'toc-close .2s'
                    setTimeout(() => {
                        $cardTocLayout.style.cssText = "opacity:''; animation: ''; right: ''"
                    }, 100)
                }
            }

            // toc元素點擊
            $cardToc.addEventListener('click', e => {
                e.preventDefault()
                const target = e.target.classList
                if (target.contains('toc-content')) return
                const $target = target.contains('toc-link')
                    ? e.target
                    : e.target.parentElement
                jyUtils.scrollToDest(jyUtils.getEleTop(document.getElementById(decodeURI($target.getAttribute('href')).replace('#', ''))), 300)
                if (window.innerWidth < 900) {
                    window.mobileToc.close()
                }
            })

            autoScrollToc = item => {
                const activePosition = item.getBoundingClientRect().top
                const sidebarScrollTop = $cardToc.scrollTop
                if (activePosition > (document.documentElement.clientHeight - 100)) {
                    $cardToc.scrollTop = sidebarScrollTop + 150
                }
                if (activePosition < 100) {
                    $cardToc.scrollTop = sidebarScrollTop - 150
                }
            }
        }

        // find head position & add active class
        const list = $article.querySelectorAll('h1,h2,h3,h4,h5,h6')
        let detectItem = ''
        const findHeadPosition = function (top) {
            if (top === 0) {
                return false
            }

            let currentId = ''
            let currentIndex = ''

            list.forEach(function (ele, index) {
                if (top > jyUtils.getEleTop(ele) - 80) {
                    const id = ele.id
                    currentId = id ? '#' + encodeURI(id) : ''
                    currentIndex = index
                }
            })

            if (detectItem === currentIndex) return

            jyUtils.updateAnchor(currentId)

            detectItem = currentIndex

            if (isToc) {
                $cardToc.querySelectorAll('.current').forEach(i => { i.classList.remove('current') })

                if (currentId === '') {
                    return
                }

                const currentActive = $tocLink[currentIndex]
                currentActive.classList.add('current')

                setTimeout(() => {
                    autoScrollToc(currentActive)
                }, 0)

                if (isExpand) return
                let parent = currentActive.parentNode

                for (; !parent.matches('.toc'); parent = parent.parentNode) {
                    if (parent.matches('li')) parent.classList.add('current')
                }
            }
        }

        // main of scroll
        window.tocScrollFn = function () {
            return jyUtils.throttle(function () {
                const currentTop = window.scrollY || document.documentElement.scrollTop
                isToc && scrollPercent(currentTop)
                findHeadPosition(currentTop)
            }, 100)()
        }
        window.addEventListener('scroll', tocScrollFn)
    }

    //网站运行时间
    const siteRuntime = function () {
        const $runtimeDay = document.getElementById('site-runtime-day')
        if ($runtimeDay) $runtimeDay.innerHTML = new jyUtils.DiffDate().runDay
        const $runtime = document.getElementById('site-runtime')
        if ($runtime) {
            setInterval(function () {
                $runtime.innerHTML = new jyUtils.DiffDate().runTime;
            }, 1000)
        }
    }
    const lazyloadImg = () => {
        window.lazyLoadInstance = new LazyLoad({
            elements_selector: 'img',
            threshold: 0,
            data_src: 'lazy-src'
        })
    }

    const unRefreshFn = function () {
        window.addEventListener('pjax:complete', () => {
            mobileMenuOpen && sidebarFn.close()
        })
        document.getElementById('close-mobile-menu').addEventListener('click', e => {
            sidebarFn.close()
        })

        clickFnOfSubMenu()
        GLOBAL_CONFIG.islazyload && lazyloadImg()
    }

    window.refreshFn = function () {
        scrollFn();
        addTableWrap();
        tabsFn.clickFnOfTabs();
        tabsFn.backToTop();
        const $jgEle = document.querySelectorAll('.post-inner .fj-gallery')
        $jgEle.length && runJustifiedGallery($jgEle)
        runLightbox();
        rightSideFn();
        addHighlightTool();
        clickFnOfTagHide();
        siteRuntime();
        scrollFnToDo();
        document.getElementById('moon-switch').addEventListener('click', switchDarkMode)
        document.getElementById('navbar-toggle').addEventListener('click', () => { sidebarFn.open()  })
    }
    refreshFn();
    unRefreshFn();
})