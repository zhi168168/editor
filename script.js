let articles = [];
let currentArticleIndex = -1;
let deletedArticles = [];

// DOM 元素
const articleContainer = document.getElementById('articleContainer');
const editor = document.getElementById('editor');
const titleEditor = document.getElementById('titleEditor');
const editorArea = document.querySelector('.editor-area');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const createBtn = document.getElementById('createBtn');
const restoreBtn = document.getElementById('restoreBtn');
const generateBtn = document.getElementById('generateBtn');
const articleInput = document.getElementById('articleInput');
const titleInput = document.getElementById('titleInput');
const topicInput = document.getElementById('topicInput');
const downloadLogsBtn = document.getElementById('downloadLogsBtn');
const importTitlesBtn = document.getElementById('importTitlesBtn');
const removeTopicsBtn = document.getElementById('removeTopicsBtn');

// 更新文章计数
function updateArticleCount() {
    const totalCount = document.getElementById('totalCount');
    const emptyCount = document.getElementById('emptyCount');
    
    totalCount.textContent = `总数：${articles.length}`;
    const emptyArticles = articles.filter(a => !a.content.trim()).length;
    emptyCount.textContent = emptyArticles ? `未填写：${emptyArticles}` : '';
}

// 渲染文章列表
function renderArticles() {
    articleContainer.innerHTML = '';
    articles.forEach((article, index) => {
        const div = document.createElement('div');
        div.className = `article-item ${index === currentArticleIndex ? 'active' : ''}`;
        div.innerHTML = `
            <div class="title">${article.title || '未命名文案'}</div>
            <div class="time">${article.time}</div>
        `;
        div.onclick = () => selectArticle(index);
        articleContainer.appendChild(div);
    });
    updateArticleCount();
}

// 选择文章
function selectArticle(index) {
    // 如果当前有选中的文案，先保存并检查是否为空
    if (currentArticleIndex >= 0) {
        const prevTitle = titleEditor.innerHTML;
        const prevContent = editor.innerHTML;
        
        // 如果当前文案为空，则删除
        if (!prevTitle.trim() && !prevContent.trim()) {
            const articleElement = articleContainer.children[currentArticleIndex];
            articleElement.classList.add('removing');
            
            setTimeout(() => {
                articles.splice(currentArticleIndex, 1);
                saveArticles();
                
                // 调整目标索引
                if (index > currentArticleIndex) {
                    index--;
                }
                
                renderArticles();
                if (articles.length > 0) {
                    const newIndex = Math.min(index, articles.length - 1);
                    currentArticleIndex = -1; // 重置以确保能触发选择
                    selectArticle(newIndex);
                } else {
                    currentArticleIndex = -1;
                    editorArea.style.display = 'none';
                }
            }, 500);
            return;
        } else {
            // 如果不为空，保存内容
            articles[currentArticleIndex].title = prevTitle;
            articles[currentArticleIndex].content = prevContent;
            saveArticles();
        }
    }
    
    // 选择新文案
    currentArticleIndex = index;
    const article = articles[index];
    
    titleEditor.innerHTML = article.title || '';
    editor.innerHTML = article.content || '';
    editorArea.style.display = 'flex';
    
    // 默认激活标题编辑器并全选
    setTimeout(() => {
        titleEditor.focus();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(titleEditor);
        selection.removeAllRanges();
        selection.addRange(range);
    }, 0);
    
    document.querySelectorAll('.article-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });
}

// 保存当前文章
function saveCurrentArticle() {
    if (currentArticleIndex >= 0) {
        articles[currentArticleIndex].content = editor.innerHTML;
        articles[currentArticleIndex].title = titleEditor.innerHTML;
        saveArticles();
    }
}

// 创建新文章
function createNewArticle() {
    const now = new Date();
    const article = {
        title: '',
        content: '',
        time: now.toLocaleString()
    };
    articles.unshift(article);
    renderArticles();
    selectArticle(0);
    saveArticles();
}

// 导入文案
function importArticles() {
    const content = articleInput.value.trim();
    const titles = titleInput.value.trim().split('\n');
    
    if (!content) {
        alert('请输入文案内容');
        return;
    }
    
    // 获取文案内容数组
    const contents = content.split('zzz')
        .map(text => text.trim())
        .filter(text => text)
        .map(text => text.split('\n').map(line => `<div>${line || '<br>'}</div>`).join(''));
    
    // 获取空文案的索引
    const emptyArticles = articles.reduce((acc, article, index) => {
        if (!article.content.trim()) {
            acc.push(index);
        }
        return acc;
    }, []);
    
    // 确保有足够的空文案
    if (emptyArticles.length < contents.length) {
        alert(`当前只有 ${emptyArticles.length} 个空文案，但要导入 ${contents.length} 篇文案内容`);
        return;
    }
    
    // 填充文案内容
    contents.forEach((content, i) => {
        const articleIndex = emptyArticles[i];
        articles[articleIndex].content = content;
        // 如果有对应的标题，也更新标题
        if (titles[i]) {
            articles[articleIndex].title = titles[i].trim();
        }
    });
    
    renderArticles();
    if (articles.length > 0) {
        selectArticle(emptyArticles[0]);
    }
    
    articleInput.value = '';
    titleInput.value = '';
    Logger.log('IMPORT', `填充了 ${contents.length} 篇文案`);
    saveArticles();
}

// 导入话题
function importTopics() {
    const topics = topicInput.value.trim().split('\n')
        .map(topic => topic.trim())
        .filter(topic => topic);
        
    if (!topics.length) return;
    
    // 格式化话题
    const formattedTopics = topics.map(topic => 
        formatTopicToHtml(`#${topic}[话题]#`)
    ).join(' ');
    
    // 为所有文案添加话题
    articles.forEach((article, index) => {
        let content = article.content || '';
        
        // 如果内容不是空的且不以换行结尾，添加换行
        if (content && !content.endsWith('<div><br></div>')) {
            content += '<div><br></div>';
        }
        
        // 添加话题
        content += `<div>${formattedTopics}</div>`;
        articles[index].content = content;
    });
    
    // 保存更改
    saveArticles();
    
    // 如果当前有选中的文案，更新编辑器显示
    if (currentArticleIndex >= 0) {
        editor.innerHTML = articles[currentArticleIndex].content;
    }
    
    // 清空话题输入框
    topicInput.value = '';
    Logger.log('TOPICS', `为所有文案导入了 ${topics.length} 个话题`);
    
    // 重新渲染文章列表
    renderArticles();
}

// 复制并删除当前文章
function copyAndDelete() {
    if (currentArticleIndex < 0) return;
    
    const content = editor.innerHTML;
    navigator.clipboard.writeText(content).then(() => {
        // 保存被删除的文章
        deletedArticles.push({
            ...articles[currentArticleIndex],
            content: content,
            title: titleEditor.innerHTML
        });
        
        // 清空编辑器
        editor.innerHTML = '';
        titleEditor.innerHTML = '';
        
        // 添加移除动画
        const articleElement = articleContainer.children[currentArticleIndex];
        articleElement.classList.add('removing');
        
        // 等待动画完成后移除文章
        setTimeout(async () => {
            articles.splice(currentArticleIndex, 1);
            await saveArticles();
            
            renderArticles();
            if (articles.length > 0) {
                selectArticle(Math.min(currentArticleIndex, articles.length - 1));
            } else {
                currentArticleIndex = -1;
                editorArea.style.display = 'none';
            }
        }, 500);
        
        restoreBtn.style.display = 'block';
    });
}

// 恢复最后删除的文章
function restoreLastArticle() {
    if (deletedArticles.length === 0) return;
    
    const article = deletedArticles.pop();
    articles.unshift(article);
    renderArticles();
    selectArticle(0);
    
    if (deletedArticles.length === 0) {
        restoreBtn.style.display = 'none';
    }
}

// 清空文章列表
async function clearArticles() {
    if (!articles.length || !confirm('确定要清空所有文案吗？')) return;
    
    deletedArticles = [...articles, ...deletedArticles];
    articles = [];
    currentArticleIndex = -1;
    editor.innerHTML = '';
    titleEditor.innerHTML = '';
    editorArea.style.display = 'none';
    
    // 先保存到服务器，确保清空操作同步
    await saveArticles();
    
    // 然后再更新界面
    renderArticles();
    restoreBtn.style.display = 'block';
}

// 事件监听
copyBtn.onclick = copyAndDelete;
clearBtn.onclick = clearArticles;
createBtn.onclick = createNewArticle;
restoreBtn.onclick = restoreLastArticle;
generateBtn.onclick = importArticles;
document.getElementById('applyTopicsBtn').onclick = importTopics;
downloadLogsBtn.onclick = () => Logger.download();
importTitlesBtn.onclick = importTitles;
removeTopicsBtn.onclick = removeAllTopics;

// 初始化
loadArticles();

// 确保 formatTopicToHtml 函数在全局范围可用
function formatTopicToHtml(topic) {
    const match = topic.match(/#([^#\[]+)\[话题\]#/);
    if (!match) return topic;
    
    const topicName = match[1];
    const topicData = {
        name: topicName,
        id: Math.random().toString(36).substr(2, 24),
        link: "",
        denotationChar: "#",
        value: topicName
    };
    
    return `<a class="mention" contenteditable="false" data-topic='${JSON.stringify(topicData)}'><span contenteditable="false">#${topicName}</span></a>`;
}

// 导入标题
function importTitles() {
    const titles = titleInput.value.trim().split('\n')
        .map(title => title.trim())
        .filter(title => title);
        
    if (!titles.length) {
        alert('请输入标题');
        return;
    }
    
    // 为每个标题创建新文章
    const newArticles = titles.map(title => ({
        title: title,
        content: '',
        time: new Date().toLocaleString()
    }));
    
    articles = [...newArticles, ...articles];
    renderArticles();
    
    if (articles.length > 0) {
        selectArticle(0);
    }
    
    titleInput.value = '';
    Logger.log('IMPORT_TITLES', `导入了 ${titles.length} 个标题`);
    saveArticles();
}

// 在现有代码中添加以下事件监听
editor.addEventListener('focus', function() {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(this);
    selection.removeAllRanges();
    selection.addRange(range);
});

titleEditor.addEventListener('focus', function() {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(this);
    selection.removeAllRanges();
    selection.addRange(range);
});

async function loadArticles() {
    try {
        const response = await fetch('http://112.124.43.20:3000/api/articles');
        articles = await response.json();
        renderArticles();
    } catch (err) {
        console.error('加载数据失败:', err);
        // 如果服务器加载失败，尝试从本地存储加载
        const savedArticles = localStorage.getItem('articles');
        if (savedArticles) {
            articles = JSON.parse(savedArticles);
            renderArticles();
        }
    }
}

async function saveArticles() {
    try {
        const response = await fetch('http://112.124.43.20:3000/api/articles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(articles)
        });
        const result = await response.json();
        if (!result.success) {
            console.error('保存失败:', result.error);
        }
    } catch (err) {
        console.error('保存数据失败:', err);
    }
}

// 在事件监听部分添加以下代码
titleEditor.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        // 从标题编辑器切换到内容编辑器
        editor.focus();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editor);
        selection.removeAllRanges();
        selection.addRange(range);
    }
});

editor.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        
        // 检查当前文案是否为空（只检查标题和内容）
        const currentTitle = titleEditor.innerHTML.replace(/<[^>]*>/g, '').trim();
        const currentContent = editor.innerHTML.replace(/<[^>]*>/g, '').trim();
        
        // 忽略时间戳，只检查标题和内容是否为空
        if ((!currentTitle || currentTitle === '<br>') && 
            (!currentContent || currentContent === '<br>')) {
            // 直接删除空文案，不添加动画
            articles.splice(currentArticleIndex, 1);
            saveArticles();
            
            renderArticles();
            if (articles.length > 0) {
                // 选择下一个文案（如果存在）
                const nextIndex = Math.min(currentArticleIndex, articles.length - 1);
                currentArticleIndex = -1; // 重置以确保能触发选择
                selectArticle(nextIndex);
            } else {
                currentArticleIndex = -1;
                editorArea.style.display = 'none';
            }
        } else {
            // 如果文案不为空，正常切换到下一个
            if (currentArticleIndex >= 0 && currentArticleIndex < articles.length - 1) {
                saveCurrentArticle();
                selectArticle(currentArticleIndex + 1);
            }
        }
    }
});

titleEditor.addEventListener('input', function() {
    // 更新当前文案的标题
    if (currentArticleIndex >= 0) {
        // 更新数据
        articles[currentArticleIndex].title = this.innerHTML;
        
        // 更新列表显示
        const articleElement = articleContainer.children[currentArticleIndex];
        if (articleElement) {
            const titleDiv = articleElement.querySelector('.title');
            titleDiv.textContent = this.innerHTML.trim() || '未命名文案';
        }
        
        // 保存更改
        saveArticles();
    }
});

// 添加移除所有话题的函数
function removeAllTopics() {
    // 遍历所有文案
    articles.forEach((article, index) => {
        // 获取文案内容
        let content = article.content || '';
        
        // 移除所有话题标签
        content = content.replace(/<div><a class="mention"[^>]*>.*?<\/a><\/div>/g, '');
        
        // 移除可能留下的空行
        content = content.replace(/<div><br><\/div>$/, '');
        
        // 更新文案内容
        articles[index].content = content;
    });
    
    // 保存更改
    saveArticles();
    
    // 如果当前有选中的文案，更新编辑器显示
    if (currentArticleIndex >= 0) {
        editor.innerHTML = articles[currentArticleIndex].content;
    }
    
    // 记录日志
    Logger.log('REMOVE_TOPICS', '已移除所有文案的话题');
}