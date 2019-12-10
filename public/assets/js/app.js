/**
 * Main class for book reader
 */
class BookginiReader {
    /**
     * Initialize the book and the viewer
     * @param {String} book - Link of the book
     * @param {Object} args - Settings of the reader (e.g width, height, stylesheet link)
     */
    constructor(book, args) {
        this.book = book;
        this.args = {
            ...args,
        };
        this.rendition = null;
        this.bookmarks = [];
        this.highlights = [];
    }

    /**
     * Adds a bookmark and stores it on localStorage
     * @returns {Object} Returns the new bookmark as an object
     */
    addBookmark() {
        let flag;
        const key = `${this.book.key()}:bookgini-bookmarks`;
        let currentLocation = this.rendition.location.start.cfi;
        let bookmarksList = JSON.parse(localStorage.getItem(key));

        if (!bookmarksList) bookmarksList = [...this.bookmarks];

        flag = bookmarksList
            .map(bookmark => {
                return bookmark.url;
            })
            .indexOf(currentLocation);

        if (flag > -1) return false;

        let locationCfi = this.rendition.currentLocation().start.cfi;
        let spineItem = this.book.spine.get(locationCfi);
        let navItem = this.book.navigation.get(spineItem.href);
        let title = navItem ? navItem.label.trim() : "Titlepage";
        let newBookmark = {
            title: title,
            url: currentLocation,
        };

        bookmarksList.push(newBookmark);
        this.bookmarks = [...bookmarksList];

        localStorage.setItem(key, JSON.stringify(bookmarksList));

        return newBookmark;
    }

    /**
     * Stores the highlighted text to localStorage
     * @returns {Object} Returns the highlighted text and CFI as an object
     */
    addHighlight(cfiRange, contents) {
        const key = `${this.book.key()}:bookgini-highlights`;
        let highlights = JSON.parse(localStorage.getItem(key));
        let newHighlight;

        if (!highlights) highlights = [...this.highlights];

        setTimeout(() => {
            this.rendition.annotations.highlight(cfiRange);
            contents.window.getSelection().removeAllRanges();
        }, 500);

        this.rendition.book.getRange(cfiRange).then(range => {
            let text;
            if (range) {
                text = range.toString().substr(0, 15) + "...";
                newHighlight = {
                    text: text,
                    url: cfiRange,
                };

                highlights.push(newHighlight);
                this.highlights = [...highlights];

                localStorage.setItem(key, JSON.stringify(highlights));
            }
        });

        return newHighlight;
    }

    /**
     * Change theme by adding class to body of the epub viewer. Class should exist on the CSS file added
     * @param {String} themeName - theme or class name to be added
     */
    chooseTheme(themeName) {
        if (themeName) {
            this.rendition.getContents().forEach(content => {
                content.emptyClass = function () {
                    var content;
                    if (!this.document) return;
                    content = this.content || this.document.body;
                    if (content) {
                        content.className = "";
                    }
                };
                content.emptyClass();
                content.addClass(themeName);
            });

            return localStorage.setItem("bookgini-theme", themeName);
        }
    }

    /**
     * Increase/Decrease font size and saves it to localStorage
     *
     * @param {Boolean} increase If true, increases font size, else, decreases.
     */
    fontSize(increase) {
        let storedfs = localStorage.getItem("bookgini-fontsize");
        let fontsize = storedfs ? storedfs : 100;
        let ctr = parseInt(fontsize);

        if (increase && increase === true) {
            if (fontsize < 125) ctr++;
        } else {
            if (fontsize > 100) ctr--;
        }

        this.rendition.themes.override("font-size", `${ctr}%`, true);
        localStorage.setItem("bookgini-fontsize", ctr);
        return ctr;
    }

    /**
     * Change font family
     *
     * @param {String} fontfamily String. Name of the font family
     * @param {Boolean} serif If true, serif, else, sans-serif
     */
    fontFamily(fontfamily, serif) {
        let savedFont = localStorage.getItem("bookgini-fontfamily");
        let ff = fontfamily;
        let sf = serif && serif === true ? "serif" : "sans-serif";
        let overrideff = `${ff}, ${sf}`;

        if (savedFont)
            this.rendition.themes.override("font-family", overrideff, true);
        localStorage.setItem("bookgini-fontfamily", overrideff);

        return overrideff;
    }

    /**
     * Reads and displays the book
     * @param {String} el - ID of the element
     */
    read(el) {
        this.book = ePub(this.book);
        this.rendition = this.book.renderTo(document.getElementById(el), {
            width: this.args.width || "100%",
            height: this.args.height || "100%",
            ignoreClass: "annotator-hl",
            stylesheet: this.args.stylesheet,
            script: this.args.script,
        });

        this.book.ready
            .then(event => {
                let chars = 1000;
                let key = `${this.book.key()}:bookgini-locations-${chars}`;
                let storedLocations = localStorage.getItem(key);
                let lastLocation = localStorage.getItem(
                    `${this.book.key()}:bookgini-lastLocation`
                );

                if (lastLocation) this.rendition.display(lastLocation);
                else this.rendition.display();

                if (storedLocations)
                    return this.book.locations.load(storedLocations);

                return this.book.locations
                    .generate(chars)
                    .then(() => {
                        localStorage.setItem(key, this.book.locations.save());
                    })
                    .catch(err =>
                        console.error("error generating locations", err)
                    );
            })
            .then(() => {
                document.getElementById("total-pages").textContent =
                    this.book.locations.length() - 1;
            });

        this.rendition.hooks.render.register((contents, view) => {
            let storedTheme = localStorage.getItem("bookgini-theme");
            let fontSize = localStorage.getItem("bookgini-fontsize");

            if (storedTheme) {
                view.getContents().forEach(function (content) {
                    content.addClass(storedTheme);
                });
            }

            if (fontSize)
                this.rendition.themes.override(
                    "font-size",
                    `${fontSize}%`,
                    true
                );
        });

        this.rendition.on("selected", (cfiRange, contents) => {
            this.addHighlight(cfiRange, contents);
        });

        this.rendition.on("relocated", event => {
            let percent = event.start.percentage * 100;
            let currentPage = event.start.location;

            localStorage.setItem(
                `${this.book.key()}:bookgini-lastLocation`,
                event.start.cfi
            );
            document
                .getElementById("current-progress")
                .style.setProperty("width", `${percent}%`);
            document.getElementById("current-page").textContent = currentPage;
        });

        return this.book;
    }
}

// _initAuth();

$(window).bind("load", function () {
    var Reader = new BookginiReader();
    Reader.book = "https://s3-ap-southeast-1.amazonaws.com/library.bookgini.com/sample_book/content.opf";
    var read = Reader.read("bookgini-reader");

    var setWindowHeight = function setWindowHeight() {
        var headerH = $("#main-header").outerHeight();
        var footerH = $("#main-footer").outerHeight();
        var windowH = $(window).outerHeight();
        var diffH = windowH - (headerH + footerH);
        $("#bookgini-reader").outerHeight(diffH);
    };

    var initTheme = function initTheme() {
        Reader.book.ready.then(function () {
            var theme = localStorage.getItem("bookgini-theme");
            if (theme)
                $("body")
                .removeClass("light sepia dark")
                .addClass(theme);
        });
    };

    initTheme();
    setWindowHeight();

    Reader.rendition.on("relocated", function (location) {
        if (location.atStart) {
            $(".prev-button").css("visibility", "hidden");
        } else {
            $(".prev-button").css("visibility", "visible");
        }

        if (location.atEnd) {
            $(".next-button").css("visibility", "hidden");
        } else {
            $(".next-button").css("visibility", "visible");
        }
        window.history.replaceState(
            null,
            null,
            "?loc=" + Reader.rendition.location.start.cfi
        );
    });

    Reader.book.ready.then(function () {
        Reader.book.loaded.navigation.then(function (toc) {
            $("#toc-list").html("");

            $.each(toc.toc, function (i, v) {
                $("#toc-list").append(
                    $(
                        "<li class='toc-item'><a class='toc-link' href=" +
                        v.href +
                        ">" +
                        v.label +
                        "</li>"
                    )
                );
            });
        });
    });

    $(".toggle-button").on("click", function () {
        var target = $(this).data("target");

        $(".popup-el.active").slideUp();
        $("#" + target)
            .slideDown()
            .addClass("active");
        $(this).addClass("clicked");
    });

    $(document).on("click", ".toc-link", function (e) {
        e.preventDefault();
        Reader.rendition.display($(this).attr("href"));
    });

    $(".next-button").on("click", function () {
        Reader.rendition.next();
    });

    $(".prev-button").on("click", function () {
        Reader.rendition.prev();
    });

    $("#add-bookmark").on("click", function () {
        var newBookmark = Reader.addBookmark();
    });

    $("#more-fontsize").on("click", function () {
        Reader.fontSize(true);
    });

    $("#less-fontsize").on("click", function () {
        Reader.fontSize();
    });

    $(".custom-theme").on("click", function () {
        var theme = $(this).data("theme");
        $(".custom-theme").removeClass("current-theme");
        $(this).addClass("current-theme");
        $("body")
            .removeClass("light sepia dark")
            .addClass(theme);
        Reader.book.ready.then(function () {
            Reader.chooseTheme(theme);
        });
    });

    $("#fullscreen-button").on("click", function () {
        if (screenfull.isEnabled) {
            screenfull.toggle($(".main-container")[0]);
        }
    });

    if (screenfull.isEnabled) {
        screenfull.on("change", function () {
            if (screenfull.isFullscreen)
                $("#fullscreen-button")
                .children("i")
                .addClass("icon-fullscreen_exit");
            else
                $("#fullscreen-button")
                .children("i")
                .removeClass("icon-fullscreen_exit");
        });
    }

    $("#custom-font_family").on("change", function () {
        Reader.fontFamily($(this).val(), $(this).data("serif"));
        console.log($(this).val());
    });

    $(window).on("resize", function () {
        setTimeout(function () {
            setWindowHeight();
            Reader.rendition.resize();
        }, 500);
    });

    $(document).on("click", "body, .main-wrapper", function (e) {
        // e.stopPropagation();
        if (e.target === e.currentTarget) $(".popup-el.active").slideUp();

        // console.log(e.target);
        // console.log(e.currentTarget);
        // console.log($(this)[0]);
    });

    var keyListener = function keyListener(e) {
        var kc = e.keyCode || e.which;
        if (kc == 37) Reader.rendition.prev();
        if (kc == 39) Reader.rendition.next();
    };

    Reader.rendition.on("keyup", keyListener);
    $(document).on("keyup", keyListener);
});