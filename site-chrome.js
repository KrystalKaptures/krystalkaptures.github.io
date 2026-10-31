(() => {
  const widgets = document.querySelectorAll('[data-kk-funtime-clock]');
  if (!widgets.length) return;

  function isFunTime(timeKey) {
    const [hour, minute] = timeKey.split(':');
    const digits = `${hour}${minute}`;
    const values = [...digits].map(Number);
    return digits === [...digits].reverse().join('')
      || hour === minute
      || values.every((value, index) => index === 0 || value === values[index - 1] + 1)
      || values.every((value, index) => index === 0 || value === values[index - 1] - 1);
  }

  function updateClocks() {
    const now = new Date();
    const timeKey = `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')}`;
    const fun = isFunTime(timeKey);

    widgets.forEach((widget) => {
      const clock = widget.querySelector('time');
      const indicator = widget.querySelector('.header-clock-label i');
      clock.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      clock.dateTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      widget.classList.toggle('is-funtime', fun);
      indicator.textContent = fun ? '✦' : '';
      widget.setAttribute('aria-label', fun ? `Open FunTimes — ${timeKey} is a FunTime` : 'Open FunTimes');
    });
  }

  updateClocks();
  window.setInterval(updateClocks, 1000);
})();
