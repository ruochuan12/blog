#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

VERSION=$(grep version package.json | sed -E 's/^.*"([^"]+)".*$/\1/')

# echo "Release $VERSION"

# 生成静态文件
npm run build

# 进入生成的文件夹
# cd docs/.vuepress/dist
cd doc_build

# 如果是发布到自定义域名
# echo 'www.lxchuan12.cn' > CNAME
# echo 'ruochuan12.github.io' > CNAME

git init
git config user.name 'ruochuan'
git config user.email 'lxchuan12@163.com'
git add -A
git commit -m "Release $VERSION"

# 如果发布到 https://ruochuan12.github.io
# git push -f git@github.com:ruochuan12/ruochuan12.github.io.git master
git push -f https://ruochuan12:${GITHUB_TOKEN}@github.com/ruochuan12/ruochuan12.github.io.git master

# 暂时手动同步，直接push不会自动部署
# git remote add origin https://ruochuan12:${GITEE_TOKEN}@gitee.com/lxchuan12/lxchuan12.git
# git push origin HEAD:master --force

# 同步gitee.com/lxchuan12/lxchuan12
# git push -f https://lxchuan12:${GITEE_TOKEN}@gitee.com/lxchuan12/lxchuan12.git master
# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
