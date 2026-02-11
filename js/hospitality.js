(() => {
  const $ = (id) => document.getElementById(id);

  const money = (v) => 'R' + (Number(v) || 0).toFixed(2);
  const percent = (v) => (Number(v) || 0).toFixed(2) + '%';

  let t;

  function updateHotel() {
    clearTimeout(t);
    t = setTimeout(runHotel, 300);
  }

  async function runHotel() {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/api/calculators/hospitality/hotel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        rooms: +$('hotel-rooms').value || 0,
        occupancyPct: +$('hotel-occupancy').value || 0,
        price: +$('hotel-price').value || 0,
        variable: +$('hotel-variable').value || 0,
        labor: +$('hotel-labor').value || 0,
        fixed: +$('hotel-fixed').value || 0,
      }),
    });

    if (res.status === 403) return location.replace('payment.html');
    if (!res.ok) return;

    const d = await res.json();

    $('hotel-occupied').textContent = d.occupiedNights.toFixed(0);
    $('hotel-revenue').textContent = money(d.revenue);
    $('hotel-total-costs').textContent = money(d.totalCosts);
    $('hotel-profit').textContent = money(d.profit);
    $('hotel-per-room').textContent = money(d.revenuePerRoom);
    $('hotel-cost-per-room').textContent = money(d.costPerRoom);
    $('hotel-margin').textContent = percent(d.margin);
    $('hotel-roi').textContent = percent(d.roi);
  }

  document
    .querySelectorAll('input')
    .forEach((i) => i.addEventListener('input', updateHotel));
})();
