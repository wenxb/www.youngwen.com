const jyUtils = {

    animateIn: (ele, text) => {
        ele.style.display = 'block'
        ele.style.animation = text
    },
    throttle: function (func, wait, options) {
        let timeout, context, args
        let previous = 0
        if (!options) options = {}

        const later = function () {
            previous = options.leading === false ? 0 : new Date().getTime()
            timeout = null
            func.apply(context, args)
            if (!timeout) context = args = null
        }

        const throttled = function () {
            const now = new Date().getTime()
            if (!previous && options.leading === false) previous = now
            const remaining = wait - (now - previous)
            context = this
            args = arguments
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout)
                    timeout = null
                }
                previous = now
                func.apply(context, args)
                if (!timeout) context = args = null
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining)
            }
        }

        return throttled
    },
    updateAnchor: (anchor) => {
        if (anchor !== window.location.hash) {
            if (!anchor) anchor = location.pathname
            const title = GLOBAL_CONFIG.title
            window.history.replaceState({
                url: location.href,
                title: title
            }, title, anchor)
        }
    },
    animateOut: (ele, text) => {
        ele.addEventListener('animationend', function f() {
            ele.style.display = ''
            ele.style.animation = ''
            ele.removeEventListener('animationend', f)
        })
        ele.style.animation = text
    },
    copyPageUrl: () => {
        var input = document.createElement("input");
        url = window.location.href
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("Copy");
        document.body.removeChild(input);
        jyUtils.snackbarShow(GLOBAL_CONFIG.copy.success)
    },
    snackbarShow: (text, showAction = false, duration = 2000) => {
        const {position, bgLight, bgDark} = GLOBAL_CONFIG.Snackbar
        const bg = document.documentElement.getAttribute('data-theme') === 'light' ? bgLight : bgDark
        Snackbar.show({
            text: text,
            backgroundColor: bg,
            showAction: showAction,
            duration: duration,
            pos: position,
            customClass: 'snackbar-css'
        })
    },
    getParents: (elem, selector) => {
        for (; elem && elem !== document; elem = elem.parentNode) {
            if (elem.matches(selector)) return elem
        }
        return null
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
    DiffDate: function () {
        let date = GLOBAL_CONFIG.runTime
        let creatDate = new Date(date);
        let nowDate = new Date();
        let runDateM = parseInt(nowDate - creatDate)
        this.runDay = Math.floor(runDateM / (24 * 3600 * 1000));
        this.runHour = Math.floor(runDateM % (24 * 3600 * 1000) / (3600 * 1000));
        this.runMinute = Math.floor(runDateM % (24 * 3600 * 1000) % (3600 * 1000) / (60 * 1000));
        this.runSecond = Math.round(runDateM % (24 * 3600 * 1000) % (3600 * 1000) % (60 * 1000) / 1000);
        this.runTime = this.runDay + " 天 " + this.runHour + " 时 " + this.runMinute + " 分 " + this.runSecond + " 秒";
    },
    wrap: (selector, eleType, options) => {
        const creatEle = document.createElement(eleType)
        for (const [key, value] of Object.entries(options)) {
            creatEle.setAttribute(key, value)
        }
        selector.parentNode.insertBefore(creatEle, selector)
        creatEle.appendChild(selector)
    },

    unwrap: el => {
        const elParentNode = el.parentNode
        if (elParentNode !== document.body) {
            elParentNode.parentNode.insertBefore(el, elParentNode)
            elParentNode.parentNode.removeChild(elParentNode)
        }
    },
    isHidden: ele => ele.offsetHeight === 0 && ele.offsetWidth === 0,
    loadLightbox: ele => {
        if (GLOBAL_CONFIG.lightbox === 'lightbox') {
            const zoom = mediumZoom(ele)
            zoom.on('open', e => {
                const photoBg = document.documentElement.getAttribute('data-theme') === 'dark' ? '#121212' : '#fff'
                zoom.update({
                    background: photoBg
                })
            })
        }
    },
    initJustifiedGallery: function (selector) {
        selector.forEach(function (i) {
            if (!jyUtils.isHidden(i)) {
                fjGallery(i, {
                    itemSelector: '.fj-gallery-item',
                    rowHeight: 220,
                    gutter: 4,
                    onJustify: function () {
                        this.$container.style.opacity = '1'
                    }
                })
            }
        })
    },
    siblings: (ele, selector) => {
        return [...ele.parentNode.children].filter((child) => {
            if (selector) {
                return child !== ele && child.matches(selector)
            }
            return child !== ele
        })
    },
    scrollToDest: (pos, time = 500) => {
        const currentPos = window.scrollY
        if (currentPos > pos) pos = pos - 70

        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: pos,
                behavior: 'smooth'
            })
            return
        }

        let start = null
        pos = +pos
        window.requestAnimationFrame(function step(currentTime) {
            start = !start ? currentTime : start
            const progress = currentTime - start
            if (currentPos < pos) {
                window.scrollTo(0, ((pos - currentPos) * progress / time) + currentPos)
            } else {
                window.scrollTo(0, currentPos - ((currentPos - pos) * progress / time))
            }
            if (progress < time) {
                window.requestAnimationFrame(step)
            } else {
                window.scrollTo(0, pos)
            }
        })
    }
}
