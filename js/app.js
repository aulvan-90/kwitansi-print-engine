/**
 * app.js - Controller Presisi Kwitansi Generator (Sesuai Blangko Toko ATK 250x100mm)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Input Fields
  const inputNo = document.getElementById('inputNo');
  const inputKota = document.getElementById('inputKota');
  const inputTerimaDari = document.getElementById('inputTerimaDari');
  const inputNominal = document.getElementById('inputNominal');
  const feedbackTerbilang = document.getElementById('feedbackTerbilang');
  const inputUntuk = document.getElementById('inputUntuk');
  const inputTanggal = document.getElementById('inputTanggal');
  const inputPenerima = document.getElementById('inputPenerima');
  const inputSaksi = document.getElementById('inputSaksi');
  const groupSaksi = document.getElementById('groupSaksi');

  // Modes & Switches
  const pillModeBlangko = document.getElementById('pillModeBlangko');
  const pillModePolos = document.getElementById('pillModePolos');
  const labelActiveMode = document.getElementById('labelActiveMode');
  const chkShowPhotoOverlay = document.getElementById('chkShowPhotoOverlay');
  const groupOverlayOpacity = document.getElementById('groupOverlayOpacity');
  const sliderOverlayOpacity = document.getElementById('sliderOverlayOpacity');
  const valOverlayOpacity = document.getElementById('valOverlayOpacity');
  const photoOverlayBg = document.getElementById('photoOverlayBg');
  const chkShowSaksi = document.getElementById('chkShowSaksi');
  const chkShowRulers = document.getElementById('chkShowRulers');

  // Preview Fields
  const viewStubNo = document.getElementById('viewStubNo');
  const viewStubTerima = document.getElementById('viewStubTerima');
  const viewStubNominal = document.getElementById('viewStubNominal');

  const viewMainNo = document.getElementById('viewMainNo');
  const viewMainTerima = document.getElementById('viewMainTerima');
  const viewMainTerbilang = document.getElementById('viewMainTerbilang');
  const viewUntukLine1 = document.getElementById('viewUntukLine1');
  const viewUntukLine2 = document.getElementById('viewUntukLine2');
  const viewUntukLine3 = document.getElementById('viewUntukLine3');
  const viewMainKota = document.getElementById('viewMainKota');
  const viewMainTanggal = document.getElementById('viewMainTanggal');
  const viewMainNominal = document.getElementById('viewMainNominal');
  const viewMainPenerima = document.getElementById('viewMainPenerima');
  const viewMainSaksi = document.getElementById('viewMainSaksi');
  const viewBoxSaksi = document.getElementById('viewBoxSaksi');
  const viewMateraiSlot = document.getElementById('viewMateraiSlot');

  // Calibration Controls
  const kwitansiSheet = document.getElementById('kwitansiSheet');
  const sliderOffsetX = document.getElementById('sliderOffsetX');
  const sliderOffsetY = document.getElementById('sliderOffsetY');
  const valOffsetX = document.getElementById('valOffsetX');
  const valOffsetY = document.getElementById('valOffsetY');
  const sliderFontSize = document.getElementById('sliderFontSize');
  const valFontSize = document.getElementById('valFontSize');
  const selectFontFamily = document.getElementById('selectFontFamily');
  const btnSaveCalibration = document.getElementById('btnSaveCalibration');
  const btnResetCalibration = document.getElementById('btnResetCalibration');

  // Actions & Zoom
  const btnPrintPrimary = document.getElementById('btnPrintPrimary');
  const btnResetForm = document.getElementById('btnResetForm');
  const btnSampleData = document.getElementById('btnSampleData');
  const previewWrapper = document.getElementById('previewWrapper');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnZoomFit = document.getElementById('btnZoomFit');
  const textZoomLevel = document.getElementById('textZoomLevel');

  let currentZoom = 1.0;
  const CALIBRATION_STORAGE_KEY = 'kwitansi_calibration_exact_v3';

  // Helper Bulan Indonesia
  const bulanIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  function getFormattedToday() {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = bulanIndo[today.getMonth()];
    const y = today.getFullYear();
    return `${d} ${m} ${y}`;
  }

  function formatRibuan(angkaStr) {
    if (!angkaStr) return '';
    const clean = angkaStr.replace(/\D/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('id-ID').format(clean);
  }

  function parseAngka(angkaStr) {
    if (!angkaStr) return 0;
    return parseInt(angkaStr.replace(/\D/g, ''), 10) || 0;
  }

  /**
   * Pembagi teks cerdas untuk 3 baris fisik blangko "Untuk Pembayaran":
   * Baris 1: setelah label "Untuk pembayaran" (lebar ~144mm, max ~65 char)
   * Baris 2: baris penuh (lebar ~190mm, max ~85 char)
   * Baris 3: baris penuh (lebar ~190mm, max ~85 char)
   */
  function splitUntukPembayaran(text) {
    if (!text) return ['', '', ''];

    // Jika user menekan enter secara eksplisit
    const manualLines = text.split('\n');
    if (manualLines.length > 1) {
      return [
        manualLines[0] || '',
        manualLines[1] || '',
        manualLines.slice(2).join(' ') || ''
      ];
    }

    const words = text.trim().split(/\s+/);
    let line1 = '', line2 = '', line3 = '';
    const MAX_LINE_1 = 62;
    const MAX_LINE_2 = 85;

    for (const w of words) {
      if ((line1 + ' ' + w).trim().length <= MAX_LINE_1 && !line2) {
        line1 = (line1 + ' ' + w).trim();
      } else if ((line2 + ' ' + w).trim().length <= MAX_LINE_2 && !line3) {
        line2 = (line2 + ' ' + w).trim();
      } else {
        line3 = (line3 + ' ' + w).trim();
      }
    }

    return [line1, line2, line3];
  }

  // =========================================================================
  // SINKRONISASI FORM KE PREVIEW
  // =========================================================================
  function updatePreview() {
    const no = inputNo.value.trim() || '-';
    const kota = inputKota.value.trim() || 'Jakarta';
    const terima = inputTerimaDari.value.trim() || '-';
    const rawNominal = inputNominal.value.replace(/\D/g, '');
    const numNominal = parseAngka(rawNominal);
    const nominalFmt = numNominal > 0 ? formatRibuan(rawNominal) + ',-' : '-';
    const terbilangText = formatTerbilangKwitansi(numNominal) || '# Nol Rupiah #';
    const untukText = inputUntuk.value.trim();
    const tanggal = inputTanggal.value.trim() || getFormattedToday();
    const penerima = inputPenerima.value.trim() || 'SUPRIYATNA';
    const saksi = inputSaksi.value.trim() || '-';

    const [l1, l2, l3] = splitUntukPembayaran(untukText);

    // Update Lembar Bonggol
    viewStubNo.textContent = no;
    viewStubTerima.textContent = terima;
    viewStubNominal.textContent = nominalFmt;

    // Update Kwitansi Utama
    viewMainNo.textContent = no;
    viewMainTerima.textContent = terima;
    viewMainTerbilang.textContent = terbilangText;
    feedbackTerbilang.textContent = terbilangText;

    viewUntukLine1.textContent = l1;
    viewUntukLine2.textContent = l2;
    viewUntukLine3.textContent = l3;

    viewMainNominal.textContent = nominalFmt;
    viewMainKota.textContent = kota;
    viewMainTanggal.textContent = tanggal;
    viewMainPenerima.textContent = `( ${penerima} )`;
    viewMainSaksi.textContent = `( ${saksi} )`;

    // Aturan Materai: >= 5 juta tampilkan slot materai pada mode polos
    if (numNominal >= 5000000) {
      viewMateraiSlot.style.display = 'flex';
    } else {
      viewMateraiSlot.style.display = 'none';
    }
  }

  // Event Listener Input Nominal Uang
  inputNominal.addEventListener('input', (e) => {
    const cursorPosition = e.target.selectionStart;
    const oldLength = e.target.value.length;
    const raw = e.target.value.replace(/\D/g, '');

    if (raw) {
      e.target.value = new Intl.NumberFormat('id-ID').format(raw);
    } else {
      e.target.value = '';
    }

    const newLength = e.target.value.length;
    e.target.setSelectionRange(cursorPosition + (newLength - oldLength), cursorPosition + (newLength - oldLength));
    updatePreview();
  });

  // Event Listener Input Lainnya
  [inputNo, inputKota, inputTerimaDari, inputUntuk, inputTanggal, inputPenerima, inputSaksi].forEach(el => {
    el.addEventListener('input', updatePreview);
  });

  // Toggle Saksi
  chkShowSaksi.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.body.classList.add('show-saksi');
      groupSaksi.style.display = 'block';
    } else {
      document.body.classList.remove('show-saksi');
      groupSaksi.style.display = 'none';
    }
  });

  // Toggle & Slider Overlay Blangko Asli
  chkShowPhotoOverlay.addEventListener('change', (e) => {
    photoOverlayBg.style.display = e.target.checked ? 'block' : 'none';
    groupOverlayOpacity.style.display = e.target.checked ? 'block' : 'none';
  });

  sliderOverlayOpacity.addEventListener('input', (e) => {
    const val = e.target.value;
    valOverlayOpacity.textContent = `${val}%`;
    photoOverlayBg.style.opacity = (val / 100).toFixed(2);
  });

  // =========================================================================
  // DUAL PRINT MODE: BLANGKO TOKO vs KERTAS PUTIH POLOS
  // =========================================================================
  function setPrintMode(mode) {
    if (mode === 'blangko') {
      document.body.classList.remove('print-mode-polos', 'preview-polos-mode');
      document.body.classList.add('print-mode-blangko', 'preview-blangko-mode');
      pillModeBlangko.classList.add('active');
      pillModePolos.classList.remove('active');
      labelActiveMode.innerHTML = '<span style="color:#10b981;">●</span> Mode: Blangko Toko (Hanya Teks Isian)';
      photoOverlayBg.style.opacity = (sliderOverlayOpacity.value / 100).toFixed(2);
    } else {
      document.body.classList.remove('print-mode-blangko', 'preview-blangko-mode');
      document.body.classList.add('print-mode-polos', 'preview-polos-mode');
      pillModePolos.classList.add('active');
      pillModeBlangko.classList.remove('active');
      labelActiveMode.innerHTML = '<span style="color:#06b6d4;">●</span> Mode: Kertas Putih Polos (Full Motif Biru)';
      photoOverlayBg.style.opacity = '1';
    }
  }

  pillModeBlangko.addEventListener('click', () => setPrintMode('blangko'));
  pillModePolos.addEventListener('click', () => setPrintMode('polos'));

  // =========================================================================
  // KALIBRASI PRINTER (OFFSET X, OFFSET Y, FONT)
  // =========================================================================
  function applyCalibration(x, y, fontSize, fontFamily) {
    valOffsetX.textContent = `${x > 0 ? '+' : ''}${x} mm`;
    valOffsetY.textContent = `${y > 0 ? '+' : ''}${y} mm`;
    valFontSize.textContent = `${fontSize} pt`;

    document.documentElement.style.setProperty('--offset-x', `${x}mm`);
    document.documentElement.style.setProperty('--offset-y', `${y}mm`);
    document.documentElement.style.setProperty('--base-font', fontFamily);

    // Update sheet offset preview (1mm ~ 3.78px di 96 DPI)
    kwitansiSheet.style.transform = `translate(${x * 3.78}px, ${y * 3.78}px)`;
  }

  function handleCalibrationChange() {
    const x = parseFloat(sliderOffsetX.value) || 0;
    const y = parseFloat(sliderOffsetY.value) || 0;
    const fs = parseFloat(sliderFontSize.value) || 10.5;
    const font = selectFontFamily.value;
    applyCalibration(x, y, fs, font);
  }

  sliderOffsetX.addEventListener('input', handleCalibrationChange);
  sliderOffsetY.addEventListener('input', handleCalibrationChange);
  sliderFontSize.addEventListener('input', handleCalibrationChange);
  selectFontFamily.addEventListener('change', handleCalibrationChange);

  btnSaveCalibration.addEventListener('click', () => {
    const calibData = {
      x: sliderOffsetX.value,
      y: sliderOffsetY.value,
      fontSize: sliderFontSize.value,
      fontFamily: selectFontFamily.value,
      penerima: inputPenerima.value,
      kota: inputKota.value
    };
    localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(calibData));
    btnSaveCalibration.innerHTML = '✓ Tersimpan!';
    setTimeout(() => {
      btnSaveCalibration.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Simpan ke Browser`;
    }, 1500);
  });

  btnResetCalibration.addEventListener('click', () => {
    sliderOffsetX.value = 0;
    sliderOffsetY.value = 0;
    sliderFontSize.value = 10.5;
    selectFontFamily.value = "'Courier New', Courier, monospace";
    handleCalibrationChange();
    localStorage.removeItem(CALIBRATION_STORAGE_KEY);
  });

  function loadSavedCalibration() {
    const saved = localStorage.getItem(CALIBRATION_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.x !== undefined) sliderOffsetX.value = data.x;
        if (data.y !== undefined) sliderOffsetY.value = data.y;
        if (data.fontSize !== undefined) sliderFontSize.value = data.fontSize;
        if (data.fontFamily) selectFontFamily.value = data.fontFamily;
        if (data.penerima) inputPenerima.value = data.penerima;
        if (data.kota) inputKota.value = data.kota;
      } catch (err) {
        console.error('Error loading calibration:', err);
      }
    }
    handleCalibrationChange();
  }

  // =========================================================================
  // ZOOM & RULER CONTROLS
  // =========================================================================
  function setZoom(val) {
    currentZoom = Math.min(Math.max(val, 0.4), 2.0);
    previewWrapper.style.transform = `scale(${currentZoom})`;
    textZoomLevel.textContent = `${Math.round(currentZoom * 100)}%`;
  }

  btnZoomIn.addEventListener('click', () => setZoom(currentZoom + 0.15));
  btnZoomOut.addEventListener('click', () => setZoom(currentZoom - 0.15));
  btnZoomFit.addEventListener('click', () => {
    const container = document.querySelector('.preview-canvas-container');
    const width = container.clientWidth - 100;
    const targetScale = Math.min(width / 945, 1.0);
    setZoom(targetScale);
  });

  chkShowRulers.addEventListener('change', (e) => {
    const rulers = document.querySelectorAll('.ruler-guide');
    rulers.forEach(r => {
      r.style.display = e.target.checked ? 'flex' : 'none';
    });
  });

  // =========================================================================
  // TOMBOL AKSI
  // =========================================================================
  btnPrintPrimary.addEventListener('click', () => {
    updatePreview();
    window.print();
  });

  btnResetForm.addEventListener('click', () => {
    if (confirm('Kosongkan semua isian formulir?')) {
      inputNo.value = '';
      inputTerimaDari.value = '';
      inputNominal.value = '';
      inputUntuk.value = '';
      updatePreview();
    }
  });

  btnSampleData.addEventListener('click', () => {
    inputNo.value = `KW/${new Date().getFullYear()}/09/${String(Math.floor(Math.random() * 900) + 100)}`;
    inputKota.value = 'Jakarta';
    inputTerimaDari.value = 'PT. TEKNOLOGI CIPTA MANDIRI NUSANTARA';
    inputNominal.value = '150.000.000';
    inputNominal.dispatchEvent(new Event('input'));
    inputUntuk.value = 'Pelunasan invoice termin kedua pengadaan server & infrastruktur jaringan sistem cloud';
    inputTanggal.value = getFormattedToday();
    inputPenerima.value = 'SUPRIYATNA';
    updatePreview();
  });

  // Shortcut Cetak Ctrl+P / Cmd+P
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      btnPrintPrimary.click();
    }
  });

  // Inisialisasi awal
  inputTanggal.value = getFormattedToday();
  if (!inputUntuk.value) {
    inputUntuk.value = 'Pembayaran pelunasan pekerjaan instalasi perangkat keras server dan pemeliharaan infrastruktur jaringan cloud.';
  }
  loadSavedCalibration();
  updatePreview();
});
