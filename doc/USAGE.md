# 使用方式

## 前言

反正又不是啥正经项目，文档写的规规整整也没啥意思，搞得大家看到烦。不如整点烂活，写成古里古怪的样子，争取让大家笑一下。

本文中的人物并没有现实中的对应，当然你硬要无端联想我只能说个人自由。

教程是这个项目自己的，如果需要给 yjzx-site 发文章要看那边的教程有关的特殊说明。

写文章好累，难怪大多项目文档都这么烂。

情节其实已经完了，但是我要把情节改到逻辑自洽了再放上来。

## 正文

### 引子

一日， {{ajun}} ……

{此处应该有情节。}  

过去了两个星期，{{ajun}}快要忘记这茬了，没想到某企鹅上面亮了个红点，是那人发的：

“你说的那个项目，我已经写好了，要不你试试看？”

“打开 <https://yjzx-site.github.io> 就可以看到我那个网站的成品了。是相应式布局的，你的手机应该也能正常显示”  

“我本来想着能一个星期写完的，结果还是高估自己了，不过好在也没拖太久”

“后端是拿 NodeJS 搞的一个简易的部署工具。没时间写文档了，待会你在线了我再告诉你怎么用”

怀揣着惊讶，{{ajun}}打开了这个网站，发现果然是一个完整的网站，首先是主页。他点开了上面导航栏里面的 “分类” ，看见里面陈列着几篇测试页面的导航，按照各自的归档分着类。每个页面按照卡片形式展示，有一些基础的信息。点开来是各个页面。“标签”也是一样。虽然很简单，但是也能足够让他震惊到了。

{这里似乎需要一点感谢的话，可惜我一时想不出。两者风格应该不一样，不然明显双簧戏。，大括号包裹的是 {{ajun}} 的回话，我决定找另一个人表述。}

“只是举手之劳而已，毕竟我也好久没写什么正经程序了，你这也算是给我创造一个展现的机会嘛”

“好了，废话不多说，我现在要告诉你这个怎么用了，{{ajun}}”

### 安装篇

“你的系统应该是 Windows 吧。”

{是的}

“那好，你先搭一个运行环境吧。就装个 Git 和 NodeJS 就行了。”

“因为东方的神秘法术，现在访问 Github 和 Npm 有点困难，所以你可能需要施法对抗。下个 [dev-sidecar](https://gitee.com/docmirror/dev-sidecar/releases) ，然后安装上。”

{打开了}

“安装好了之后，打开，点那个安装证书，应该就可以用上了吧。有啥问题看下那边的文档。”

{好了}

“那么接下来你就可以装 [Git](https://git-scm.com/) 和 [NodeJS](https://nodejs.org/zh-cn/) 了。”

“Git 直接点这个下载就能用了 <https://git-scm.com/download/win>。”

“NodeJS 的话，Windows 8 以上是可以直接用官网上面最新版的。Windows 7 我找到了 13.14 版本的，是可以正常使用的最后一个版本了 <https://nodejs.org/download/release/v13.14.0/node-v13.14.0-x86.msi>。”

{版本号好奇怪(此处表情，作者注)}

“应该是缘分吧(此处表情，作者注)”

“好了，不浪费你时间。安装什么就的无脑下一步吧，看不懂的不要乱改，安装路径啥最好也别动。免得出什么问题。”

{OK，装好了。}

“好啦，现在你已经有了完整的运行环境了。”

“随便打开一个文件夹，右键，打开 git bash，然后按顺序输入下面的几条命令：”

``` sh
# 因为先前使用了 dev sidecar，这里需要暂时关掉证书认证
git config --global http.sslverify false

# 下载一些资源文件
git clone https://github.com/floatingblocks/float-site-manager.git
```

{运行了，下好了}

“现在你应该可以再这个目录下面看到一个叫做 float-site-manager 的文件夹了吧。使用 VSCode 打开那个文件夹，然后再在 VSCode 里面按下 Ctrl+Shift+\` 打开命令行，输入下面的内容，安装我的网站管理程序：”

``` sh
# npm 会自动安装好需要的程序
npm install
```

### 使用篇

“安装好了之后应该就可以使用了。”

{那我要怎么用它}

“里面有一些测试页面，你可以先试着本地跑下服务看看是不是正常的。”

``` sh
# 命令格式 npx float-site-manager [参数]

# 从源文件渲染好整个网站
npx float-site-manager g

# 打开测试服务器，然后就可以在浏览器打开 http://localhost:4000 预览
npx float-site-manager s
```

“如果一切正常的话，打开 <http://localhost:4000> 就能看到预览网页了。”

{预览网页是开起来了，一切正常。具体操作又是如何呢？比如说怎么添加页面？}

“你可以用 new 命令生成对应的文件嘛，生成一个页面对应的文件。命令的格式是这样：”

``` sh
npx float-site-manager [页面类型] [页面名称]
```

“页面类型目前是两个选项，一个是 page，它的 index.html 是只有正文内容的，渲染的时候就会把其中的内容复制到中间那一块正文区域里面去。这个是最常用的。”

“另一个选项是 site，它的 index.html 是个完整的 HTML，相当于一个子网站，如果需要高自由度自定义的话可以用上。”

“比如我们要生成一个 page，名字叫做 PageA，或者生成一个 site 叫做 site1：”

``` sh
npx float-site-manager new page PageA
npx float-site-manager new site site1
```

“之后你应该就可以看到 source 文件夹下面多出来一些文件夹，目录结构大概是这样：”

``` text
- source/
    - PageA/
        - index.html
        - infos.json
    - site1/
        - index.html
        - infos.json
```

{是的，但是接下来要怎么做？}

“这样的话，每个文件夹都是一个对应的页面了。其中 index.html 是页面的主页，infos.json 则包含了页面的一些信息，是管理这个网站的重要部分。infos.json 里面的信息是不会显示在页面中的，但是它会显示在“归档”，“标签”之类的导航页里面，所以非常非常重要。”

“我们先看看 infos.json 吧，打开来应该能看到这个东西：”

``` json
{
    "type": "page",
    "title": "PageA",
    "auther": "",
    "category": "",
    "tags": [""],
    "description": "",
    "date": "2021-12-05"
}
```

{看到了，要怎么用？}

“这里面的 type title 和 date 都已经自动填充好了，一般不用改。”

“auther 是作者，显示在信息里面，比如你的名字是{{ajun}}， 那么就可以写成 "auther": "{{ajun}}"。”

“ category 的意思是分类，页面属于什么分类，主要用作分类页面的导航。”

“当然分类的粒度比较大，最好还是加上一些 tags，比如要加上 tag A 和 B，就可以这么写： "tags": ["A", "B"]。这里可以使用 tag 进行导航。”

“最好加上一点点对于这个页面写了什么的简易介绍，就是 description，讲下这个页面是什么。下面就是一个例子：”

``` json
{
    "type": "page",
    "title": "我是标题",
    "auther": "王大锤",
    "category": "测试",
    "tags": [
        "测试",
        "真的只是测试"
    ],
    "description": "一个非常简单的测试页面",
    "date": "2077-07-07"
}
```

{现在 infos.json 我算是知道了，不过页面怎么做。}

“接下来自然是 index.html 了。对于 page 类型，这里面是只有正文的内容，比如这样：”

``` html
<h1>标题</h1>
<p>第一段内容.</p>
<p>第二段内容.</p>
```

“而不是这样：”

``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Document</title>
</head>
<body>
    <h1>标题</h1>
    <p>第一段内容.</p>
    <p>第二段内容.</p>
</body>
</html>
```

{为什么要这样子呢？}

“因为这样子，渲染的时候就会自动填充进页面里面去。如果要对页面的模板进行改动，就不需要一个一个页面改过来了。”

{如果我想要加入一些资源，比如图片，要怎么办？}

“直接往里面加就好了嘛，一个文件夹就相当于一个子网站，里面的所有其他文件都会被直接复制到渲染好的网站的对应目录下面，所以你要给 PageA 加上图片的话，直接用 img 标签就行了。”

“假设目录结构如下：”

``` text
- source/
    - PageA/
        - img.png
        - index.html
        - infos.json
```

“ HTML 就可以写成这样”

``` html
<img src="./img.png" alt="a photograph">
```

{如果我的页面不使用网站的默认模板，是不是最好要选择 site 类型？}

“对了，不然我写这东西干嘛。自定义程度很高的需求就需要这样了。site 类型下面，除了 infos.json，其他的都可以当成是一个完整的网站来看待。”

{假如我已经搞好了页面，下一步怎么做？}

“肯定是生成+测试啊。最后再部署上去。”

“因为现在整个网站还是源码阶段，就是都在 source 文件夹里面，所以需要渲染成一个完整可用的网站。这个过程是自动化的，你只要一条命令就可以了。完成之后你可以看到一个 public 文件夹，里面就是渲染好了的文件。source 目录下面也会多出来一个 fileRecord.json。生成出来的文件最好别动。”

``` sh
npx float-site-manager g
```

{输出了一大堆东西，不过文件夹倒是有了。}

“输出啥的不用管他，只是为了说明它在正常运行。”

“现在运行一下网站测试它吧。跑一跑下面的命令。然后打开 <http://localhost:4000> ，应该就能看到页面跑起来了。”

{对，成了。}

### 配置篇

“不过，现在网站的基本信息还是默认的。你可能要自己去改 config.json。打开来，你看到下面的内容”

``` json
{
    "siteName": "Float's Site",
    "siteURL": "https://example.com",
    "year": 2021,
    "owner": "Float",
    "licenseLink": "https://creativecommons.org/licenses/by-sa/4.0/",
    "licenseName": "CC-BY-SA 4.0",
    "navs": [ {
            "name": "主页",
            "link": "/"
        }, {
            "name": "分类看到了out"
        }
    ],
    "deploygit": {
        "repo": "https://github.com/yjzx-site/yjzx-site.github.io.git",
        "branch": "master"
    }
}
```

“siteName 是网站的标题，显示在左上角和页面标题中的那个。”

“siteURL 目前没用，一般放上网站的主页连接。”

“year 显示在网站的最下方。licenseLink 和 licenseName 说明当前网站用的是什么协议。我默认是直接 CC-BY-SA 了，也可以换成别的。”

“navs 是导航栏里面的项目连接和名称。”

“deploygit 是部署到 Github Pages 上面的时候用的，等会再提。”

“现在你按照自己的信息改下里面的内容”

{我改好了。}

“现在网站需要重新生成一下了。因为改了总配置，所以需要先清空之前生成过的文件。当然在 source 文件夹下面改文件是不需要这么做的。”

``` sh
# 清空生成过的文件
npx float-site-manager clean

# 生成文件
npx float-site-manager g

# 运行测试服务器
npx float-site-manager s
```

“打开 <http://localhost:4000>，现在你的信息是不是改过来了？”

{是的，我看到了。看起来还挺容易的。}

### 部署篇

“OK，到最后一步了。我们的网站需要部署起来。”

“因为没钱买服务器，加上这个网站也是简单的静态网站，我就推荐你用 Github Pages 好了。”

“你之前应该没用过 Github Pages 吧。”

{我怎么会用过呢？}

“好吧，不过 Github 帐号总是有的吧。”

{那肯定，毕竟还是写过那么一点点程序的。}

“OK，你新建一个仓库，名字 `[你的用户名].github.io` ， 比如用户名 user123，就是 user123.github.io。”

{新建完成了。}

“接下来好办，打开 config.json，把 deploygit 选项的 url 换成你的仓库的地址。branch 就先不要动好了。”

“如果你没有初始化 git 的话，你就可能需要加入一个用户：”

``` sh
git config --global user.name "一个名字"
git config --global user.email "自己的邮箱@邮箱.com"
```

“接着运行这个命令，按照提示操作，就可以部署上了”

``` sh
npx float-site-manager d
```

“当然现在 Github 不允许你使用密码登录 git，你可能需要自己创建一个 Personal Acess Token。具体百度吧，我有点累了。”

{行得行得，我慢慢研究。}

### 尾声

{没想到我这个东西你还能帮忙做出来。}

“小事小事，帮你忙了，我也高兴。”

{好了，现在时间也不早了，下次再聊。}

“嗯嗯”

{此处还有一点小小的情节，呼应开头，回头润色一下}
