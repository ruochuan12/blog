---
highlight: darcula
theme: smartblue
---

# antd-mobile 组件库

## 1. 前言

大家好，我是[若川](https://ruochuan12.github.io)，欢迎关注我的[公众号：若川视野](https://mp.weixin.qq.com/s/MacNfeTPODNMLLFdzrULow)。我倾力持续组织了 3 年多[每周大家一起学习 200 行左右的源码共读活动](https://juejin.cn/post/7079706017579139102)，感兴趣的可以[点此扫码加我微信 `ruochuan02` 参与](https://juejin.cn/pin/7217386885793595453)。另外，想学源码，极力推荐关注我写的专栏[《学习源码整体架构系列》](https://juejin.cn/column/6960551178908205093)，目前是掘金关注人数（6k+人）第一的专栏，写有几十篇源码文章。

打算写一个 antd-mobile 源码系列。

[antd-mobile 仓库](https://github.com/ant-design/ant-design-mobile)

[Toast 轻提示](https://mobile.ant.design/zh/components/toast)

[贡献文档](https://github.com/ant-design/ant-design-mobile/blob/master/.github/CONTRIBUTING.md)

## 准备工作

```bash
git clone https://github.com/ant-design/ant-design-mobile.git
cd ant-design-mobile
pnpm install
pnpm start
```

## Toast.show

```tsx
<DemoBlock title='基础用法'>
    <Button
        onClick={() =>
            Toast.show({
                content: 'Hello World, This is a long text',
                afterClose: () => {
                    console.log('after')
                },
            })
        }
    >
        轻提示
    </Button>
</DemoBlock>
```

如果是你会怎么实现 Toast。

实现简版

```ts
const Toast = (props) => {
    return <div>{props.content}</div>
}
```
