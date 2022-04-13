
window.addEventListener('load', () => {
    function searchClickFn() {
        document.querySelector('.local-search-content .search-close-btn').addEventListener('click', closeSearch);
        document.getElementById('search-btn').addEventListener('click', openSearch);
        document.getElementById('search-mask').addEventListener('click', closeSearch);
    }

    searchClickFn()

    window.addEventListener('pjax:complete', function () {
        getComputedStyle(document.querySelector('.search-inner')).display === 'block' && closeSearch()
        searchClickFn()
    })

    let loadFlag = false
    function openSearch() {
        const bodyStyle = document.body.style
        bodyStyle.width = '100%'
        bodyStyle.overflow = 'hidden'
        if (!loadFlag) {
            search(GLOBAL_CONFIG.localSearch)
            loadFlag = true
        }
        jyUtils.animateIn(document.querySelector('.search-inner'),'titleScale .5s');
        jyUtils.animateIn(document.getElementById('search-mask'),'to_show .5s')
        document.addEventListener('keydown', function f (event) {
            if (event.code === 'Escape') {
                closeSearch()
                document.removeEventListener('keydown', f)
            }
        })
    }

    function closeSearch() {
        const bodyStyle = document.body.style
        bodyStyle.width = ''
        bodyStyle.overflow = ''
        document.getElementById('local-search-results').innerHTML = '';
        document.getElementById('search-input').value = '';
        jyUtils.animateOut(document.querySelector('.search-inner'),'search_close .5s');
        jyUtils.animateOut(document.getElementById('search-mask'),'to_hide 0.5s')
    }

    async function search(path) {
        let datas = []
        const typeF = path.split('.')[1]
        const response = await fetch(GLOBAL_CONFIG.root + path)
        if (typeF === 'json') {
            datas = await response.json()
        } else if (typeF === 'xml') {
            const res = await response.text()
            const t = await new window.DOMParser().parseFromString(res, 'text/xml')
            const a = await t
            datas = [...a.querySelectorAll('entry')].map(function (item) {
                return {
                    title: item.querySelector('title').textContent,
                    content: item.querySelector('content') && item.querySelector('content').textContent,
                    url: item.querySelector('url').textContent
                }
            })
        }
        if (response.ok) {
            document.querySelector('.local-search-loding').style.display = "none";
        }

        const $search_input = document.getElementById('search-input');
        const $search_result = document.getElementById('local-search-results');
        $search_input.addEventListener('input', function () {
            let str = '<ul class="search-result-list">';
            let keywords = this.value.trim().toLowerCase().split(/[\s\-]+/);
            $search_result.innerHTML = "";
            if (this.value.trim().length <= 0) return
            let count = 0
            datas.forEach(function (data) {
                let isMatch = true;
                const data_title = data.title.trim().toLowerCase();
                const data_content = data.content.trim().replace(/<[^>]+>/g, "").toLowerCase();
                const data_url = data.url.startsWith('/') ? data.url : '/' + data.url;
                let index_title = -1;
                let index_content = -1;
                let first_occur = -1;
                if (data_title !== '' && data_content !== '') {
                    keywords.forEach(function (keyword, i) {
                        index_title = data_title.indexOf(keyword);
                        index_content = data_content.indexOf(keyword);
                        if (index_title < 0 && index_content < 0) {
                            isMatch = false;
                        } else {
                            if (index_content < 0) {
                                index_content = 0;
                            }
                            if (i === 0) {
                                first_occur = index_content;
                            }
                        }
                    })
                } else {
                    isMatch = false
                }
                if (isMatch) {
                    const content = data.content.trim().replace(/<[^>]+>/g, "");
                    if (first_occur >= 0) {
                        var start = first_occur - 6;
                        var end = first_occur + 6;
                        if (start < 0) {
                            start = 0;
                        }
                        if (start === 0) {
                            end = 10;
                        }
                        if (end > content.length) {
                            end = content.length;
                        }
                        let match_content = content.substr(start, end);
                        let match_title = data_title
                        keywords.forEach(function (keyword) {
                            var regS = new RegExp(keyword, "gi");
                            match_content = match_content.replace(regS, `<em class="search-keyword">${keyword}</em>`);
                            match_title = match_title.replace(regS, `<em class="search-keyword">${keyword}</em>`)
                        })
                        str += `<li><a href="${data_url}" class="search-result-title">${match_title}</a>`;
                        str += `<p class="search-result"> ${match_content}...</p></li>`
                        count += 1
                    }
                }
            })
            str += `</ul>`
            if (count === 0) {
                str += `<span>无搜索结果...</span>`
                $search_result.innerHTML = str;
            } else {
                $search_result.innerHTML = str;
                window.pjax && window.pjax.refresh($search_result)
            }

        })
    }

})