const container = document.getElementById("themeContainer");

fetch("data/index.json")
  .then(res => res.json())
  .then(index => {

    index.categories.forEach(cat => {

      // カテゴリコンテナ（details/summary）
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = cat.title;
      details.appendChild(summary);

      const ul = document.createElement("ul");

      // 該当カテゴリのお題だけ抽出
      index.themes
        .filter(t => t.category === cat.id)
        .forEach(theme => {

          const li = document.createElement("li");
          const a = document.createElement("a");

          a.href = `theme.html?theme=${theme.id}`;
          a.textContent = theme.title;

          li.appendChild(a);
          ul.appendChild(li);
        });

      details.appendChild(ul);
      details.open = false; // デフォルトは閉じておく
      container.appendChild(details);
    });

  });
