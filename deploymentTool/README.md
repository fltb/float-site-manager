# README

## layout

### ejs

里面是一堆 ejs，每个 ejs 渲染时假定会传入两个对象：config 和 page。

config:

``` js
let config = {
    year: 2021,
    siteName: "",
    owner: '',
    lisenseName: '',
    navs: [ {
            name: '',
            link: '/'
        }
    ],
}
```

page:

``` js
let page = {
    title: '',
    content: '' // 如果当前 ejs 是 page
}
```

每个不同的模板都有自己不同的对象

``` js
let category = {
    categories: [{
        name: '',
        active: true
    }, {
        name: '',
        active: false
    }],
    items: [{
        link: '/',
        title: '',
        description: '',
        category: '',
        auther: '',
        date: ''
    }],
};

let tag = {
    name: '',
    items: [{
        link: '/',
        title: '',
        description: '',
        category: '',
        auther: '',
        date: ''
    }],
};

let tagGuiding = {
    items: [{
        link: '/',
        name: ''
    }]
}
```

static 下面是静态的资源，是自己写的垃圾 CSS 和 js。
