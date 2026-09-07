/**
 * terbilang.js - Pure JavaScript Indonesian Number to Words Converter
 * Konversi angka nominal uang ke kalimat terbilang bahasa Indonesia standar perbankan & akuntansi.
 */

function terbilang(nominal) {
  if (nominal === null || nominal === undefined) return '';

  // Bersihkan karakter non-angka kecuali koma/titik desimal
  let strNominal = nominal.toString().trim();
  if (strNominal === '') return '';

  // Hapus format mata uang (Rp, titik pemisah ribuan)
  strNominal = strNominal.replace(/[^0-9]/g, '');

  if (strNominal === '' || isNaN(Number(strNominal))) return '';

  const angka = BigInt(strNominal);

  if (angka === 0n) {
    return 'Nol Rupiah';
  }

  const huruf = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas'
  ];

  function konversi(n) {
    if (n < 12n) {
      return huruf[Number(n)];
    } else if (n < 20n) {
      return konversi(n - 10n) + ' Belas';
    } else if (n < 100n) {
      const puluh = n / 10n;
      const sisa = n % 10n;
      return huruf[Number(puluh)] + ' Puluh' + (sisa > 0n ? ' ' + konversi(sisa) : '');
    } else if (n < 200n) {
      const sisa = n - 100n;
      return 'Seratus' + (sisa > 0n ? ' ' + konversi(sisa) : '');
    } else if (n < 1000n) {
      const ratus = n / 100n;
      const sisa = n % 100n;
      return huruf[Number(ratus)] + ' Ratus' + (sisa > 0n ? ' ' + konversi(sisa) : '');
    } else if (n < 2000n) {
      const sisa = n - 1000n;
      return 'Seribu' + (sisa > 0n ? ' ' + konversi(sisa) : '');
    } else if (n < 1000000n) {
      const ribu = n / 1000n;
      const sisa = n % 100n === 0n && n % 1000n === 0n ? 0n : n % 1000n;
      return konversi(ribu) + ' Ribu' + (sisa > 0n ? ' ' + konversi(sisa) : '');
    } else if (n < 1000000000n) {
      const juta = n / 1000000n;
      const sisa = n % 1000000n;
      return konversi(juta) + ' Juta' + (sisa > 0n ? ' ' + konversi(sisa) : '');
    } else if (n < 1000000000000n) {
      const miliar = n / 1000000000n;
      const sisa = n % 1000000000n;
      return konversi(miliar) + ' Miliar' + (sisa > 0n ? ' ' + konversi(sisa) : '');
    } else if (n < 1000000000000000n) {
      const triliun = n / 1000000000000n;
      const sisa = n % 1000000000000n;
      return konversi(triliun) + ' Triliun' + (sisa > 0n ? ' ' + konversi(sisa) : '');
    } else {
      return 'Nominal Terlalu Besar';
    }
  }

  const hasil = konversi(angka).replace(/\s+/g, ' ').trim();
  return `${hasil} Rupiah`;
}

/**
 * Format string terbilang dengan pembungkus standar kwitansi # ... #
 */
function formatTerbilangKwitansi(nominal) {
  const t = terbilang(nominal);
  if (!t) return '';
  return `# ${t} #`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { terbilang, formatTerbilangKwitansi };
}
