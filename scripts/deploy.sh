#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

VERSION=$(grep version package.json | sed -E 's/^.*"([^"]+)".*$/\1/')

# echo "Release $VERSION"

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
echo 'www.lxchuan12.cn' > CNAME

git init
git config user.name 'ruochuan'
git config user.email 'lxchuan12@163.com'
git add -A
git commit -m "Release $VERSION"

# 如果发布到 https://lxchuan12.github.io
# git push -f git@github.com:lxchuan12/lxchuan12.github.io.git master
# git push -f https://${GITHUB_TOKEN}@github.com/lxchuan12/lxchuan12.github.io.git master

git remote add origin https://lxchuan12:${GITEE_TOKEN}@gitee.com/lxchuan12/lxchuan12.git
git push origin HEAD:master --force

# 同步gitee.com/lxchuan12/lxchuan12
# git push -f https://lxchuan12:${GITEE_TOKEN}@gitee.com/lxchuan12/lxchuan12.git master
# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
