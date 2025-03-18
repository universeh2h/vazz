// Helper function to get a readable status message
export function getStatusMessage(resultCode: string): string {
  switch (resultCode) {
    case '00':
    case '0':
      return 'Pembayaran Berhasil';
    case '01':
      return 'Pembayaran Pending';
    case '02':
      return 'Pembayaran Gagal';
    case '03':
      return 'Pembayaran Expired';
    default:
      return 'Status Tidak Diketahui';
  }
}
