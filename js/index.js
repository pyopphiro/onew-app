// 最近の更新を読み込む
fetch("data/updates.json")
  .then(res => res.json())
  .then(updates => {
    const list = document.getElementById("updatesList");
    updates.forEach(item => {
      const div = document.createElement("div");
      div.className = "update-item";

      const badge = document.createElement("span");
      badge.className = `update-badge update-badge--${item.type}`;
      badge.textContent =
        item.type === "theme" ? "お題追加" :
          item.type === "feature" ? "機能追加" :
            item.type === "fix" ? "バグ修正" : item.type;

      const date = document.createElement("span");
      date.className = "update-date";
      date.textContent = item.date;

      const text = document.createElement("span");
      text.className = "update-text";
      text.textContent = item.text;

      div.appendChild(badge);
      div.appendChild(date);
      div.appendChild(text);
      list.appendChild(div);
    });
  });

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

      const themes = index.themes.filter(t => t.category === cat.id);
      const VISIBLE = 3;

      const ul = document.createElement("ul");

      themes.forEach((theme, i) => {
        const li = document.createElement("li");
        // 先頭3件は表示、それ以降は隠す
        if (i >= VISIBLE) li.style.display = "none";

        const a = document.createElement("a");
        a.href = `theme.html?theme=${theme.id}`;
        a.textContent = theme.title;

        li.appendChild(a);
        ul.appendChild(li);
      });

      details.appendChild(ul);

      // 4件以上ある場合は「もっと見る」ボタンを追加
      if (themes.length > VISIBLE) {
        const toggle = document.createElement("button");
        toggle.className = "toggle-more";
        toggle.textContent = `もっと見る（残り ${themes.length - VISIBLE} 件）`;
        let expanded = false;

        toggle.addEventListener("click", () => {
          expanded = !expanded;
          ul.querySelectorAll("li").forEach((li, i) => {
            if (i >= VISIBLE) li.style.display = expanded ? "" : "none";
          });
          toggle.textContent = expanded
            ? "閉じる"
            : `もっと見る（残り ${themes.length - VISIBLE} 件）`;
        });

        details.appendChild(toggle);
      }

      details.open = true; // 初期状態は開いておく
      container.appendChild(details);
    });

  });
