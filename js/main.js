console.log('jQuery загружен:', typeof $ !== 'undefined');
console.log('Slick доступен:', $.fn.slick ? 'да' : 'нет');

document.addEventListener('DOMContentLoaded', () => {
  // ====== Применение темы ======
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const body = document.body;

  const applyTheme = (theme) => {
    body.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  };

  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  themeToggle?.addEventListener('click', () => {
    const isDark = body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    applyTheme(isDark ? 'dark' : 'light');
  });

  // ====== Инициализация Slick ======
  $('.multiple-items').slick({
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    infinite: true,
    arrows: false,
    dots: false,
    responsive: [
      { breakpoint: 2200, settings: { slidesToShow: 5 } },
      { breakpoint: 1800, settings: { slidesToShow: 4 } },
      { breakpoint: 1400, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ]
  });

  // ====== Калькулятор ======
  const form = document.getElementById('cylinder-form');
  const forceCtx = document.getElementById('forceChart')?.getContext('2d');
  const lengthCtx = document.getElementById('lengthChart')?.getContext('2d');
  let forceChart, lengthChart;

  const saveBtn = document.getElementById('save-button');
  const exportBtn = document.getElementById('export-button');
  if (saveBtn) saveBtn.disabled = true;
  if (exportBtn) exportBtn.disabled = true;

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const pressure = parseFloat(form.pressure.value);
    const d = parseFloat(form.cylinder_diameter.value);
    const s = parseFloat(form.stroke_length.value);
    const mu = parseFloat(form.friction.value);
    const type = form.cylinder_type.value;

    const baseArea = Math.PI * (d / 2) ** 2 * (type === 'double' ? 2 : 1);
    const force = ((baseArea * pressure * mu) / 1000).toFixed(2);
    const length = s + 2 * (d + 20);

    document.getElementById('force-result').textContent = force;
    document.getElementById('length-result').textContent = length;
    document.getElementById('type-result').textContent = type === 'single' ? 'Одностороннего действия' : 'Двустороннего действия';
    document.getElementById('d-label').textContent = `D = ${d} мм`;
    document.getElementById('l-label').textContent = `L = ${length} мм`;
    document.getElementById('s-label').textContent = `S = ${s} мм`;

    document.getElementById('result-section').classList.remove('hidden');
    saveBtn.disabled = false;
    exportBtn.disabled = false;

    // Построение графиков
    const pressures = Array.from({ length: 26 }, (_, i) => 5 + i);
    const strokes = Array.from({ length: 16 }, (_, i) => 100 + i * 50);
    const forces1 = pressures.map(p => ((baseArea * p * mu) / 1000).toFixed(2));
    const forces2 = pressures.map(p => ((baseArea * p * (mu - 0.05)) / 1000).toFixed(2));
    const forces3 = pressures.map(p => ((baseArea * p * (mu + 0.05)) / 1000).toFixed(2));
    const lengths = strokes.map(s => s + 2 * (d + 20));

    if (forceChart) forceChart.destroy();
    if (lengthChart) lengthChart.destroy();

    forceChart = new Chart(forceCtx, {
      type: 'line',
      data: {
        labels: pressures.map(p => `${p} МПа`),
        datasets: [
          { label: `μ=${mu}`, data: forces1, borderColor: '#5d576b', tension: 0.4 },
          { label: `μ=${(mu - 0.05).toFixed(2)}`, data: forces2, borderColor: '#a1626a', borderDash: [5, 5], tension: 0.3 },
          { label: `μ=${(mu + 0.05).toFixed(2)}`, data: forces3, borderColor: '#3b6978', borderDash: [2, 3], tension: 0.3 }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Усилие (кН)' } },
          x: { title: { display: true, text: 'Давление (МПа)' } }
        }
      }
    });

    lengthChart = new Chart(lengthCtx, {
      type: 'line',
      data: {
        labels: strokes.map(s => `${s} мм`),
        datasets: [{
          label: 'Общая длина цилиндра',
          data: lengths,
          borderColor: '#f97316',
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Общая длина (мм)' } },
          x: { title: { display: true, text: 'Ход штока (мм)' } }
        }
      }
    });
  });

  saveBtn?.addEventListener('click', () => {
    const result = [
      `=== Исходные данные ===`,
      `Давление масла (P): ${form.pressure.value} МПа`,
      `Диаметр цилиндра (D): ${form.cylinder_diameter.value} мм`,
      `Ход штока (S): ${form.stroke_length.value} мм`,
      `Температура масла (T): ${form.temperature.value} °C`,
      `Коэффициент трения (μ): ${form.friction.value}`,
      `Тип цилиндра: ${form.cylinder_type.options[form.cylinder_type.selectedIndex].text}`,
      ``,
      `=== Результаты расчёта ===`,
      `Усилие: ${document.getElementById('force-result').innerText} кН`,
      `Общая длина: ${document.getElementById('length-result').innerText} мм`,
      `Тип цилиндра: ${document.getElementById('type-result').innerText}`
    ].join('\n');

    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'расчет_гидроцилиндра.txt';
    link.click();
  });

  exportBtn?.addEventListener('click', () => {
    const url = new URL(window.location.href);
    url.searchParams.set("p", form.pressure.value);
    url.searchParams.set("d", form.cylinder_diameter.value);
    url.searchParams.set("s", form.stroke_length.value);
    url.searchParams.set("t", form.temperature.value);
    url.searchParams.set("mu", form.friction.value);
    url.searchParams.set("type", form.cylinder_type.value);

    navigator.clipboard.writeText(url.toString()).then(() => {
      exportBtn.innerText = "Скопировано!";
      setTimeout(() => exportBtn.innerText = "Скопировать ссылку", 1500);
    });
  });
}); // <-- ЭТА строка закрывает весь addEventListener
