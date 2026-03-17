const SHEET_ID = '1-6qFgdW2FJTJiy3_Cmw11cgsnJMPdIv-TkJAm9LxgL0';
const USD_RATE = 41;

const FORMATS = ['1/24','2/48','3/72','7 днів','Без видалення','Розіграш','Репост','Закріп','Інше'];
const TYPES = ['Telegram канал','Telegram бот','Крипто проєкт','Біржа/Платформа','NFT','Послуга','Інше'];

let records = JSON.parse(localStorage.getItem('ads') || '[]');
let usdRate = parseFloat(localStorage.getItem('usdRate') || USD_RATE);

function save() { localStorage.setItem('ads', JSON.stringify(records)); }

function totalUAH() { return records.reduce((s,r) => s+(parseFloat(r.priceUAH)||0),0); }
function totalUSD() { return records.reduce((s,r) => s+(parseFloat(r.priceUSD)||0),0); }
function thisMonth() {
  const now = new Date();
  return records.filter(r => {
    const d = new Date(r.datetime);
    return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  }).reduce((s,r) => s+(parseFloat(r.priceUAH)||0),0);
}

function formatDT(iso) {
  if(!iso) return '—';
  return new Date(iso).toLocaleString('uk-UA',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
}

function exportCSV() {
  const rows = [['Дата та час','Що рекламується','Тип','Формат','Ціна (₴)','Ціна ($)','Нотатки'],
    ...records.map(r=>[formatDT(r.datetime),r.name,r.type,r.format,r.priceUAH,r.priceUSD,r.notes])];
  const csv = rows.map(r=>r.map(c=>`"${c||''}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv);
  a.download = 'cryptotime_ads.csv';
  a.click();
}

function render() {
  document.getElementById('app').innerHTML = `
<div style="font-family:monospace;background:#0a0a0a;min-height:100vh;padding-bottom:60px">
  <div style="background:#111;border-bottom:1px solid #222;padding:20px 16px;position:sticky;top:0;z-index:99">
    <div style="max-width:600px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div>
          <div style="font-size:10px;color:#f5c518;letter-spacing:3px;text-transform:uppercase">CryptoTime</div>
          <div style="font-size:20px;font-weight:bold;color:#fff">📊 Облік реклами</div>
        </div>
        <div style="display:flex;gap:8px">
          <button onclick="exportCSV()" style="background:transparent;border:1px solid #333;color:#aaa;padding:8px 12px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:12px">⬇ CSV</button>
          <button onclick="toggleForm()" style="background:#f5c518;border:none;color:#000;padding:8px 16px;border-radius:6px;cursor:pointer;font-family:monospace;font-size:13px;font-weight:bold">+ Нова</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px">
        ${[['Записів',records.length],['Цей місяць','₴'+thisMonth().toLocaleString('uk-UA')],['Всього ₴','₴'+totalUAH().toLocaleString('uk-UA')],['Всього $','$'+totalUSD().toFixed(0)]].map(([l,v])=>`
        <div style="background:#0d0d0d;border:1px solid #222;border-radius:8px;padding:8px 10px">
          <div style="font-size:9px;color:#555;text-transform:uppercase;letter-spacing:1px">${l}</div>
          <div style="font-size:15px;font-weight:bold;color:#f5c518;margin-top:2px">${v}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>
  <div style="max-width:600px;margin:0 auto;padding:0 16px">
    <div id="form-wrap"></div>
    <div id="list" style="margin-top:16px">
      ${records.length===0?`
      <div style="text-align:center;padding:60px 20px;color:#333;border:1px dashed #222;border-radius:12px;margin-top:16px">
        <div style="font-size:36px">📭</div>
        <div style="font-size:14px;color:#444;margin-top:8px">Записів поки немає</div>
      </div>`
      :records.map((r,i)=>`
      <div style="background:#111;border:1px solid #1e1e1e;border-radius:10px;padding:14px 16px;margin-bottom:10px">
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
          <span style="background:#1a1a1a;border:1px solid #2a2a2a;color:#666;font-size:10px;padding:2px 8px;border-radius:4px">${formatDT(r.datetime)}</span>
          <span style="background:#1a1400;border:1px solid #3a2e00;color:#f5c518;font-size:10px;padding:2px 8px;border-radius:4px">${r.format}</span>
          <span style="background:#0d1a0d;border:1px solid #1a3a1a;color:#4caf50;font-size:10px;padding:2px 8px;border-radius:4px">${r.type}</span>
        </div>
        <div style="font-size:15px;font-weight:bold;color:#fff;margin-bottom:4px">${r.name}</div>
        <div style="display:flex;gap:14px">
          ${r.priceUAH?`<span style="color:#f5c518;font-size:14px">₴${parseFloat(r.priceUAH).toLocaleString('uk-UA')}</span>`:''}
          ${r.priceUSD?`<span style="color:#888;font-size:13px">$${parseFloat(r.priceUSD).toFixed(2)}</span>`:''}
        </div>
        ${r.notes?`<div style="font-size:11px;color:#555;margin-top:4px;font-style:italic">${r.notes}</div>`:''}
        <div style="display:flex;gap:6px;margin-top:10px">
          <button onclick="editRecord(${i})" style="background:#1a1a1a;border:1px solid #2a2a2a;color:#888;padding:4px 12px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:12px">✏️ Редагувати</button>
          <button onclick="deleteRecord(${i})" style="background:#1a0000;border:1px solid #3a0000;color:#ff5555;padding:4px 12px;border-radius:5px;cursor:pointer;font-family:monospace;font-size:12px">🗑 Видалити</button>
        </div>
      </div>`).join('')}
    </div>
  </div>
</div>`;
  if(window._showForm) renderForm(window._editIdx);
}

function toggleForm() { window._showForm=!window._showForm; window._editIdx=null; render(); }

function renderForm(editIdx=null) {
  const r = editIdx!==null ? records[editIdx] : null;
  document.getElementById('form-wrap').innerHTML = `
<div style="background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:20px;margin-top:16px">
  <div style="font-size:13px;color:#f5c518;font-weight:bold;margin-bottom:16px">${r?'✏️ Редагувати':'➕ Новий запис'}</div>
  <label style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">📅 Дата та час</label>
  <input type="datetime-local" id="f-dt" value="${r?r.datetime.slice(0,16):new Date().toISOString().slice(0,16)}" style="width:100%;background:#0d0d0d;border:1px solid #2a2a2a;color:#e0e0e0;padding:9px 12px;border-radius:7px;font-family:monospace;font-size:13px;box-sizing:border-box;margin-bottom:12px">
  <label style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">📢 Що рекламується</label>
  <input type="text" id="f-name" placeholder="Наприклад: @cryptoalpha_ua" value="${r?r.name:''}" style="width:100%;background:#0d0d0d;border:1px solid #2a2a2a;color:#e0e0e0;padding:9px 12px;border-radius:7px;font-family:monospace;font-size:13px;box-sizing:border-box;margin-bottom:12px">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
    <div>
      <label style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">🏷 Тип</label>
      <select id="f-type" style="width:100%;background:#0d0d0d;border:1px solid #2a2a2a;color:#e0e0e0;padding:9px 12px;border-radius:7px;font-family:monospace;font-size:12px;box-sizing:border-box">
        ${TYPES.map(t=>`<option ${r&&r.type===t?'selected':''}>${t}</option>`).join('')}
      </select>
    </div>
    <div>
      <label style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">📋 Формат</label>
      <select id="f-format" style="width:100%;background:#0d0d0d;border:1px solid #2a2a2a;color:#e0e0e0;padding:9px 12px;border-radius:7px;font-family:monospace;font-size:12px;box-sizing:border-box">
        ${FORMATS.map(f=>`<option ${r&&r.format===f?'selected':''}>${f}</option>`).join('')}
      </select>
    </div>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
    <label style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1px">💰 Ціна</label>
    <div style="display:flex;align-items:center;gap:6px">
      <span style="font-size:10px;color:#555">Курс:</span>
      <input type="number" id="f-rate" value="${usdRate}" onchange="usdRate=parseFloat(this.value);localStorage.setItem('usdRate',usdRate)" style="width:50px;background:#0d0d0d;border:1px solid #2a2a2a;color:#e0e0e0;padding:4px 6px;border-radius:5px;font-family:monospace;font-size:11px;text-align:center">
      <span style="font-size:10px;color:#555">₴</span>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
    <div>
      <label style="font-size:10px;color:#888;display:block;margin-bottom:4px">В гривнях (₴)</label>
      <input type="number" id="f-uah" placeholder="0" value="${r?r.priceUAH:''}" oninput="syncPrice('uah')" style="width:100%;background:#0d0d0d;border:1px solid #2a2a2a;color:#e0e0e0;padding:9px 12px;border-radius:7px;font-family:monospace;font-size:13px;box-sizing:border-box">
    </div>
    <div>
      <label style="font-size:10px;color:#888;display:block;margin-bottom:4px">В доларах ($)</label>
      <input type="number" id="f-usd" placeholder="0" value="${r?r.priceUSD:''}" oninput="syncPrice('usd')" style="width:100%;background:#0d0d0d;border:1px solid #2a2a2a;color:#e0e0e0;padding:9px 12px;border-radius:7px;font-family:monospace;font-size:13px;box-sizing:border-box">
    </div>
  </div>
  <label style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:4px">📝 Нотатки</label>
  <textarea id="f-notes" placeholder="Статус оплати, контакт..." style="width:100%;background:#0d0d0d;border:1px solid #2a2a2a;color:#e0e0e0;padding:9px 12px;border-radius:7px;font-family:monospace;font-size:13px;box-sizing:border-box;height:70px;resize:vertical;margin-bottom:14px">${r?r.notes:''}</textarea>
  <div style="display:flex;gap:8px">
    <button onclick="submitForm(${editIdx!==null?editIdx:'null'})" style="flex:1;background:#f5c518;border:none;color:#000;padding:11px;border-radius:7px;cursor:pointer;font-family:monospace;font-size:14px;font-weight:bold">${r?'Зберегти':'Додати запис'}</button>
    <button onclick="toggleForm()" style="background:transparent;border:1px solid #333;color:#888;padding:11px 16px;border-radius:7px;cursor:pointer;font-family:monospace;font-size:14px">Скасувати</button>
  </div>
</div>`;
}

function syncPrice(from) {
  const rate = parseFloat(document.getElementById('f-rate').value)||usdRate;
  if(from==='uah') {
    const v = parseFloat(document.getElementById('f-uah').value);
    document.getElementById('f-usd').value = v?(v/rate).toFixed(2):'';
  } else {
    const v = parseFloat(document.getElementById('f-usd').value);
    document.getElementById('f-uah').value = v?(v*rate).toFixed(0):'';
  }
}

function submitForm(editIdx) {
  const name = document.getElementById('f-name').value.trim();
  if(!name) { alert('Вкажи що рекламується'); return; }
  const rec = {
    datetime: document.getElementById('f-dt').value,
    name,
    type: document.getElementById('f-type').value,
    format: document.getElementById('f-format').value,
    priceUAH: document.getElementById('f-uah').value,
    priceUSD: document.getElementById('f-usd').value,
    notes: document.getElementById('f-notes').value
  };
  if(editIdx!==null && editIdx!==undefined) { records[editIdx]=rec; }
  else { records.unshift(rec); }
  save();
  window._showForm=false;
  window._editIdx=null;
  render();
}

function editRecord(i) { window._showForm=true; window._editIdx=i; render(); }
function deleteRecord(i) { if(confirm('Видалити запис?')) { records.splice(i,1); save(); render(); } }

window._showForm=false;
window._editIdx=null;
render();
