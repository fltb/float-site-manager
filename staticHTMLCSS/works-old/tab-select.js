"use strict";
// tab select begin::
let FltB = { //Just my namespace using my id FloatingBlocks
    renderTab: function() {
        let that = this;
        that.tabLinks = document.querySelectorAll(".categories-tab-link");
        that.tabContents = document.querySelectorAll(".categories-tab-content");
        that.tabLinks[0].classList.add("active");
        that.tabContents[0].classList.add("active");
        that.tabLinks.forEach(function (tabLink, i) {
            tabLink.addEventListener("click", function () {
                that.tabLinks.forEach(function (tabLink) { return tabLink.classList.remove("active"); });
                that.tabContents.forEach(function (tabContent) { return tabContent.classList.remove("active"); });
                tabLink.classList.add("active");
                that.tabContents[i].classList.add("active");
            });
        });
    }
};
FltB.renderTab();

// tab select end::
