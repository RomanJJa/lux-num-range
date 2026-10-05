   const languageMax = 6;
   const languageList = document.getElementById("language_list");
   const languageTemplate = document.getElementById("language_row_template");
   const addLanguageButton = document.getElementById("add_language_button");
   const languageStatus = document.getElementById("language_status");
   const languageCount = document.getElementById("language_count");

   function languageRows() {
      return Array.from(languageList.querySelectorAll("[data-language-row]"));
   }

   function refreshLanguageNames() {
      languageRows().forEach(function (row, index) {
         const rank = index + 1;
         row.querySelector(".row-title").textContent = "Langue " + rank;
         row.querySelectorAll("[data-field]").forEach(function (field) {
            const key = field.getAttribute("data-field");
            field.name = "language_" + rank + "_" + key;
            field.id = field.name;
            const label = field.parentElement.querySelector("label");
            if (label) label.setAttribute("for", field.id);
         });
      });
      languageCount.value = String(languageRows().length);
      addLanguageButton.disabled = languageRows().length >= languageMax;
      languageStatus.textContent = languageRows().length >= languageMax
         ? "Maximum de 6 langues atteint."
         : languageRows().length + " / " + languageMax + " langues.";
   }

   function addLanguageRow() {
      if (languageRows().length >= languageMax) return;
      const row = languageTemplate.content.firstElementChild.cloneNode(true);
      languageList.appendChild(row);
      refreshLanguageNames();
      const firstField = row.querySelector("input");
      if (firstField) firstField.focus();
   }

   addLanguageButton.addEventListener("click", addLanguageRow);
   languageList.addEventListener("click", function (event) {
      const button = event.target.closest("[data-remove-language]");
      if (!button) return;
      button.closest("[data-language-row]").remove();
      refreshLanguageNames();
   });

   addLanguageRow();
