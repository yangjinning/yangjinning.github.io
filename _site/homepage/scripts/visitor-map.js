(function () {
  var endpoint = window.VISITOR_STATS_ENDPOINT || "";
  var sampleCountries = [
    { code: "CN", name: "China", visits: 128, lat: 35.8617, lon: 104.1954 },
    { code: "US", name: "United States", visits: 76, lat: 37.0902, lon: -95.7129 },
    { code: "SG", name: "Singapore", visits: 41, lat: 1.3521, lon: 103.8198 },
    { code: "DE", name: "Germany", visits: 28, lat: 51.1657, lon: 10.4515 },
    { code: "JP", name: "Japan", visits: 22, lat: 36.2048, lon: 138.2529 }
  ];
  var countryMeta = {
    AU: { name: "Australia", lat: -25.2744, lon: 133.7751 },
    BR: { name: "Brazil", lat: -14.235, lon: -51.9253 },
    CA: { name: "Canada", lat: 56.1304, lon: -106.3468 },
    CN: { name: "China", lat: 35.8617, lon: 104.1954 },
    DE: { name: "Germany", lat: 51.1657, lon: 10.4515 },
    FR: { name: "France", lat: 46.2276, lon: 2.2137 },
    GB: { name: "United Kingdom", lat: 55.3781, lon: -3.436 },
    IN: { name: "India", lat: 20.5937, lon: 78.9629 },
    JP: { name: "Japan", lat: 36.2048, lon: 138.2529 },
    KR: { name: "South Korea", lat: 35.9078, lon: 127.7669 },
    SG: { name: "Singapore", lat: 1.3521, lon: 103.8198 },
    US: { name: "United States", lat: 37.0902, lon: -95.7129 }
  };
  var mapEl = document.getElementById("visitor-map");
  var totalEl = document.getElementById("visitor-total");
  var listEl = document.getElementById("visitor-countries");
  var statusEl = document.getElementById("visitor-map-status");
  if (!mapEl || !totalEl || !listEl || !statusEl) return;

  function project(lon, lat) {
    return { x: ((lon + 180) / 360) * 100, y: ((90 - lat) / 180) * 100 };
  }

  function normalizeStats(rawStats) {
    return Object.keys(rawStats).map(function (code) {
      var meta = countryMeta[code] || { name: code, lat: 0, lon: 0 };
      return { code: code, name: meta.name, lat: meta.lat, lon: meta.lon, visits: Number(rawStats[code]) };
    }).filter(function (item) {
      return Number.isFinite(item.visits) && item.visits > 0;
    }).sort(function (a, b) {
      return b.visits - a.visits;
    });
  }

  function renderMap(countries) {
    var maxVisits = countries.reduce(function (max, country) { return Math.max(max, country.visits); }, 1);
    mapEl.innerHTML = [
      '<span class="visitor-land na" aria-hidden="true"></span>',
      '<span class="visitor-land sa" aria-hidden="true"></span>',
      '<span class="visitor-land eu" aria-hidden="true"></span>',
      '<span class="visitor-land af" aria-hidden="true"></span>',
      '<span class="visitor-land as" aria-hidden="true"></span>',
      '<span class="visitor-land au" aria-hidden="true"></span>'
    ].join("");
    countries.slice(0, 10).forEach(function (country) {
      var pos = project(country.lon, country.lat);
      var marker = document.createElement("span");
      var size = 12 + (country.visits / maxVisits) * 34;
      marker.className = "visitor-point";
      marker.style.left = pos.x + "%";
      marker.style.top = pos.y + "%";
      marker.style.setProperty("--size", size + "px");
      marker.dataset.label = country.name + " · " + country.visits;
      marker.title = country.name + ": " + country.visits + " visits";
      mapEl.appendChild(marker);
    });
  }

  function renderSummary(countries, isSample) {
    var total = countries.reduce(function (sum, country) { return sum + country.visits; }, 0);
    totalEl.textContent = total.toLocaleString();
    listEl.innerHTML = countries.slice(0, 6).map(function (country) {
      return "<li><strong>" + country.name + "</strong><br><span>" + country.visits.toLocaleString() + " visits</span></li>";
    }).join("");
    statusEl.textContent = isSample
      ? "当前为示例数据。配置 visitor_stats_endpoint 后将显示真实访问来源。"
      : "正在显示真实访问来源统计。统计只保存国家/地区汇总，不保存原始 IP。";
  }

  function renderSample(message) {
    renderMap(sampleCountries);
    renderSummary(sampleCountries, true);
    if (message) statusEl.textContent = message;
  }

  async function loadVisitorStats() {
    if (!endpoint) {
      renderSample();
      return;
    }
    try {
      var today = new Date().toISOString().slice(0, 10);
      var visitKey = "visitor-counted:" + today;
      if (localStorage.getItem(visitKey) !== "true") {
        await fetch(endpoint + "/visit", { method: "POST", mode: "cors" });
        localStorage.setItem(visitKey, "true");
      }
      var response = await fetch(endpoint + "/stats", { mode: "cors" });
      if (!response.ok) throw new Error("Stats endpoint failed");
      var data = await response.json();
      var countries = normalizeStats(data.countries || {});
      if (countries.length === 0) {
        renderSample();
        return;
      }
      renderMap(countries);
      renderSummary(countries, false);
    } catch (error) {
      renderSample("统计接口暂时不可用，页面已回退为示例地图。");
    }
  }
  loadVisitorStats();
})();
