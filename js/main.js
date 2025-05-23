console.log('jQuery загружен:', typeof $ !== 'undefined');
console.log('Slick доступен:', $.fn.slick ? 'да' : 'нет');
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }
  document.body.style.visibility = 'visible';
});

$(document).ready(function(){
    $('.multiple-items').slick({
        slidesToShow: 5, // Show 4 slides by default (reduced from 5 for better spacing)
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 1500,
        infinite: true,
        arrows: false, // Enable arrows for navigation
        dots: false, // Enable dots for navigation
        centerMode: false, // Disable centerMode to ensure consistent slide alignment
        responsive: [
          {
              breakpoint: 2200,
              settings: {
                  slidesToShow: 5
              }
          },
          {
              breakpoint: 1800,
              settings: {
                  slidesToShow: 4
              }
          },
            {
                breakpoint: 1400,
                settings: {
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1
                }
            }
        ]
    });
});
// ====== Переключатель темы ======
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const body = document.body;

// Применить тему из localStorage при загрузке
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark');
    themeIcon.textContent = '☀️';
  } else {
    body.classList.remove('dark');
    themeIcon.textContent = '🌙';
  }
});

// Переключатель темы
themeToggle?.addEventListener('click', () => {
  const isDark = body.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  themeIcon.textContent = isDark ? '☀️' : '🌙';
});



// ====== Калькулятор гидроцилиндра ======
document.getElementById('cylinder-form')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const pressure = parseFloat(document.getElementById('pressure').value);
    const cylinderDiameter = parseFloat(document.getElementById('cylinder_diameter').value);
    const strokeLength = parseFloat(document.getElementById('stroke_length').value);
    const friction = parseFloat(document.getElementById('friction').value);
    const cylinderType = document.getElementById('cylinder_type').value;

    if (!cylinderDiameter || !pressure || !strokeLength) return;

    // Расчёт усилия
    let baseArea = Math.PI * (cylinderDiameter / 2) ** 2;
    if (cylinderType === "double") baseArea *= 2;
    const force = ((baseArea * pressure * friction) / 1000).toFixed(2);
    const totalLength = strokeLength + 2 * (cylinderDiameter + 20);

    document.getElementById('force-result').textContent = force;
    document.getElementById('length-result').textContent = totalLength;
    document.getElementById('type-result').textContent = cylinderType === 'single' ? 'Одностороннего действия' : 'Двустороннего действия';
    document.getElementById('d-label').textContent = `D = ${cylinderDiameter} мм`;
    document.getElementById('l-label').textContent = `L = ${totalLength} мм`;
    document.getElementById('s-label').textContent = `S = ${strokeLength} мм`;

    document.getElementById('result-section').classList.remove('hidden');

    document.getElementById('save-button').disabled = false;
    document.getElementById('export-button').disabled = false;
});

//Построение гарфика//
document.addEventListener('DOMContentLoaded', function () {
    const forceCtx = document.getElementById('forceChart')?.getContext('2d');
    const lengthCtx = document.getElementById('lengthChart')?.getContext('2d');
    let forceChart = null;
    let lengthChart = null;

    document.getElementById('cylinder-form')?.addEventListener('submit', function () {
      const pressure = parseFloat(document.getElementById('pressure').value);
      const cylinderDiameter = parseFloat(document.getElementById('cylinder_diameter').value);
      const friction = parseFloat(document.getElementById('friction').value);
      const strokeLength = parseFloat(document.getElementById('stroke_length').value);
      const cylinderType = document.getElementById('cylinder_type').value;

      const baseArea = Math.PI * (cylinderDiameter / 2) ** 2 * (cylinderType === 'double' ? 2 : 1);
      const pressures = Array.from({ length: 26 }, (_, i) => 5 + i); // от 5 до 30 МПа с шагом 1
      const strokes = Array.from({ length: 16 }, (_, i) => 100 + i * 50); // от 100 до 850 мм с шагом 50

      const forces1 = pressures.map(p => ((baseArea * p * friction) / 1000).toFixed(2));
      const forces2 = pressures.map(p => ((baseArea * p * (friction - 0.05)) / 1000).toFixed(2));
      const forces3 = pressures.map(p => ((baseArea * p * (friction + 0.05)) / 1000).toFixed(2));

      const lengths = strokes.map(s => s + 2 * (cylinderDiameter + 20));

      if (forceCtx && forceChart) forceChart.destroy();
      if (lengthCtx && lengthChart) lengthChart.destroy();

      forceChart = new Chart(forceCtx, {
        type: 'line',
        data: {
          labels: pressures.map(p => `${p} МПа`),
          datasets: [
            {
              label: `Усилие (μ=${friction})`,
              data: forces1,
              borderColor: '#5d576b',
              fill: false,
              tension: 0.4,
              pointRadius: 3
            },
            {
              label: `Усилие (μ=${(friction - 0.05).toFixed(2)})`,
              data: forces2,
              borderColor: '#a1626a',
              borderDash: [5, 5],
              fill: false,
              tension: 0.3,
              pointRadius: 2
            },
            {
              label: `Усилие (μ=${(friction + 0.05).toFixed(2)})`,
              data: forces3,
              borderColor: '#3b6978',
              borderDash: [2, 3],
              fill: false,
              tension: 0.3,
              pointRadius: 2
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.dataset.label}: ${ctx.raw} кН`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Усилие (кН)' }
            },
            x: {
              title: { display: true, text: 'Давление (МПа)' }
            }
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
            fill: false,
            tension: 0.3,
            pointRadius: 3
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.dataset.label}: ${ctx.raw} мм`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Общая длина (мм)' }
            },
            x: {
              title: { display: true, text: 'Ход штока (мм)' }
            }
          }
        }
      });
    });
  });

// Кнопка-сохранения расчета//
let saveBtn = document.getElementById('save-button');
let exportBtn = document.getElementById('export-button');
saveBtn.disabled = true;
exportBtn.disabled = true;

document.getElementById('save-button')?.addEventListener('click', function () {
  const pressure = document.getElementById('pressure').value;
  const diameter = document.getElementById('cylinder_diameter').value;
  const stroke = document.getElementById('stroke_length').value;
  const temp = document.getElementById('temperature').value;
  const friction = document.getElementById('friction').value;
  const typeText = document.getElementById('cylinder_type').options[document.getElementById('cylinder_type').selectedIndex].text;

  const force = document.getElementById('force-result').innerText;
  const length = document.getElementById('length-result').innerText;
  const type = document.getElementById('type-result').innerText;

  const content = `=== Исходные данные ===\n` +
    `Давление масла (P): ${pressure} МПа\n` +
    `Диаметр цилиндра (D): ${diameter} мм\n` +
    `Ход штока (S): ${stroke} мм\n` +
    `Температура масла (T): ${temp} °C\n` +
    `Коэффициент трения (μ): ${friction}\n` +
    `Тип цилиндра: ${typeText}\n\n` +
    `=== Результаты расчёта ===\n` +
    `Усилие: ${force} кН\n` +
    `Общая длина: ${length} мм\n` +
    `Тип цилиндра: ${type}`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'расчет_гидроцилиндра.txt';
  link.click();
});

document.getElementById("cylinder-form")?.addEventListener("submit", function () {
  saveBtn.disabled = false;
  exportBtn.disabled = false;
});

exportBtn?.addEventListener("click", function () {
  const url = new URL(window.location.href);
  url.searchParams.set("p", document.getElementById("pressure").value);
  url.searchParams.set("d", document.getElementById("cylinder_diameter").value);
  url.searchParams.set("s", document.getElementById("stroke_length").value);
  url.searchParams.set("t", document.getElementById("temperature").value);
  url.searchParams.set("mu", document.getElementById("friction").value);
  url.searchParams.set("type", document.getElementById("cylinder_type").value);

  navigator.clipboard.writeText(url.toString()).then(() => {
    exportBtn.innerText = "Скопировано!";
    setTimeout(() => exportBtn.innerText = "Скопировать ссылку", 1500);
  });
});
//Site info//

document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll('.number');
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const increment = target / 100;

            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 10);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
});
