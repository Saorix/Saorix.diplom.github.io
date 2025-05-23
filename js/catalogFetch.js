// ====== Загрузка таблицы каталога ======
const rowsPerPageByHeight = () => {
  const height = window.innerHeight;
  if (height < 500) return 5;
  if (height < 700) return 6;
  if (height < 900) return 8;
  return 14;
};

let rowsPerPage = rowsPerPageByHeight();
let currentPage = 1;
let filteredData = [];
let sortDirection = { manufacturer: true, price: true };

const log = msg => {
  const debugEl = document.getElementById('debug-log');
  if (debugEl) debugEl.innerHTML += `<div>${msg}</div>`;
  console.log(msg);
};

function renderTablePage(data) {
  rowsPerPage = rowsPerPageByHeight();
  const tableBody = document.querySelector("#catalogTable");
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageItems = data.slice(start, end);

  pageItems.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.shifr}</td>
      <td>${item.manufacturer}</td>
      <td>${item.size}</td>
      <td>${item.price}</td>
    `;
    tableBody.appendChild(row);
  });

  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("nextBtn").disabled = end >= data.length;
}

function updatePaginationControls(data) {
  document.getElementById("prevBtn").onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderTablePage(data);
    }
  };

  document.getElementById("nextBtn").onclick = () => {
    if ((currentPage * rowsPerPage) < data.length) {
      currentPage++;
      renderTablePage(data);
    }
  };
}

function setupSearch(data) {
  document.getElementById("searchCatalog").addEventListener("input", () => {
    const query = document.getElementById("searchCatalog").value.toLowerCase();
    filteredData = data.filter(item => {
      const sizePlain = item.size.replace("Ø", "").toLowerCase();
      return item.shifr.toLowerCase().includes(query) ||
             item.manufacturer.toLowerCase().includes(query) ||
             sizePlain.includes(query);
    });
    currentPage = 1;
    renderTablePage(filteredData);
  });
}

function setupSorting(data) {
  const sortIndicators = {
    manufacturer: document.querySelector("#sortManufacturer .sort-indicator"),
    price: document.querySelector("#sortPrice .sort-indicator")
  };

  const updateIndicators = (activeKey) => {
    Object.keys(sortIndicators).forEach(key => {
      const direction = sortDirection[key];
      sortIndicators[key].textContent =
        key === activeKey ? (direction ? "↑" : "↓") : "⇅";
    });
  };

  const makeSortable = (headerId, key) => {
    const header = document.getElementById(headerId);
    if (!header) return;

    header.style.cursor = "pointer";
    header.addEventListener("click", () => {
      const direction = sortDirection[key] ? 1 : -1;
      filteredData.sort((a, b) => {
        if (key === "price") {
          return (parseFloat(a.price) - parseFloat(b.price)) * direction;
        }
        return a[key].localeCompare(b[key]) * direction;
      });
      sortDirection[key] = !sortDirection[key];
      updateIndicators(key);
      currentPage = 1;
      renderTablePage(filteredData);
    });
  };

  makeSortable("sortManufacturer", "manufacturer");
  makeSortable("sortPrice", "price");
  updateIndicators(null); // Устанавливаем начальные стрелки
}


fetch("../data/catalog.json")
  .then(response => {
    log("📡 Ответ от сервера получен");
    if (!response.ok) throw new Error("Ошибка при загрузке JSON файла");
    return response.json();
  })
  .then(data => {
    const catalogTable = data.find(entry => entry.type === "table" && entry.name === "catalog");
    if (!catalogTable || !Array.isArray(catalogTable.data)) {
      throw new Error("Ошибка структуры JSON");
    }

    filteredData = catalogTable.data;
    renderTablePage(filteredData);
    updatePaginationControls(filteredData);
    setupSearch(catalogTable.data);
    setupSorting(filteredData);

    log("✅ Таблица успешно загружена");
  })
  .catch(error => {
    log(`❌ Ошибка: ${error.message}`);
    const tableBody = document.querySelector("#catalogTable");
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="4">Ошибка загрузки данных</td></tr>`;
    }
  });

// Перерисовка таблицы при изменении размера окна
window.addEventListener('resize', () => {
  renderTablePage(filteredData);
});
