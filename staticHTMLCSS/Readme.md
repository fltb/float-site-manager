# 说明

这是我给文档的说明，这个网站的项目就按照这个做了

## 组成

主要分成主页，索引页和内容页

主页展示一些最基础的导航，要试着加上一些看起来比较 geek 的元素，用来炫技

索引页有两种：分类页和标签页。这两种都使用卡片的方式展示子连接。

其中，分类页是用一个 JS　在同一页面进行不同分类的切换，标签页通过一个标签索引页来导航到不同的标签。

内容页也有两种：子页面和子网站。

子页面是一个单个　HTML，只有一部分内容，会被放在内容模板的 content 里面。也可以有一些资源文件。

子网站就相当于一个独立网站，具有完全的功能

## 使用的技术

前端是原生的 HTML　CSS JS 技术，后端使用 NodeJS 程序加上 ejs 模板进行部署。

## 文件结构

### infos.json

包含很多关于当前页面信息的 json，包括了：

- name
- auther
- categorie
- tags
- description
- date

以后也会可能加上一些新的东西。

## 部署流程

遍历 src 文件夹的所有文件，对于每个 page 生成对应子目录下的 HTML。

按照每个 page 或者 site 的 infos.json 对它属于的归档页面和标签页面进行生成。

之后把生成的文件写到 public 文件夹当中，再复制拿些不用生成的文件(page 中除了 HTML 的资源，site 的全部)。

把这些文件 hash 都记录到 fileRecord.json 当中。

最后，使用 git 对 public 文件夹中的东西进行 push 到对应的 pages 上面。

### 更新

首先读取所有的文件，判断文件的变更情况(使用一个 fileRecord.json 来记录 src 文件夹中每个文件名和对应的 Hash 值)，对于变更或者新增的文件对应的 HTML 和索引都进行更新。具体变化有：

- public 文件夹下对应 HTML(page.html)
- 对应的标签或者模板(infos.json)
- 或者直接对应的文件(不是前面提到的)

接着把新生成的文件覆盖掉 public 文件夹中的对应文件，并且修改 fileRecord.json。

## 使用

暂且命名为 yjzx 。主要命令目前就只有这么几个

``` text
yjzx new page [name]
yjzx new site [name]
yjzx generate
yjzx clean
yjzx deploy
```

generate 就是生成对应的。然后 clean 直接删掉 public 和 fileRecord.json。deploy 是上传到 github。
