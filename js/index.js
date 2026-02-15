const container = document.getElementById("themeContainer");

fetch("data/index.json")
  .then(res => res.json())
  .then(index => {

    index.categories.forEach(cat => {

      // カテゴリタイトル
      const h4 = document.createElement("h4");
      h4.textContent = cat.title;
      container.appendChild(h4);

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

      container.appendChild(ul);
    });

  });
