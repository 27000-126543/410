const success = (res, data = null, message = 'success', code = 200) => {
  res.status(code).json({
    code,
    message,
    data
  });
};

const error = (res, message = 'error', code = 500, data = null) => {
  res.status(code).json({
    code,
    message,
    data
  });
};

const pagination = (page, pageSize) => {
  const p = Math.max(1, parseInt(page) || 1);
  const ps = Math.min(100, Math.max(1, parseInt(pageSize) || 10));
  return {
    page: p,
    pageSize: ps,
    offset: (p - 1) * ps,
    limit: ps
  };
};

const paginateResult = (rows, count, page, pageSize) => {
  return {
    list: rows,
    total: count,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    totalPages: Math.ceil(count / pageSize)
  };
};

const generateOrderNo = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `CP${year}${month}${day}${random}${Date.now().toString().slice(-4)}`;
};

const generateTripNo = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `TR${year}${month}${day}${random}`;
};

const generateInvoiceNo = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `INV${year}${month}${day}${random}`;
};

const generateAgreementNo = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `AGR${year}${month}${day}${random}`;
};

const generateComplaintNo = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `CMP${year}${month}${day}${random}`;
};

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateDistanceScore = (distance, maxDistance = 10) => {
  if (distance <= 1) return 100;
  if (distance >= maxDistance) return 0;
  return Math.max(0, 100 - (distance - 1) * (100 / (maxDistance - 1)));
};

const calculateTimeScore = (time1, time2, maxDiffMinutes = 60) => {
  const diff = Math.abs(new Date(time1) - new Date(time2)) / (1000 * 60);
  if (diff <= 5) return 100;
  if (diff >= maxDiffMinutes) return 0;
  return Math.max(0, 100 - (diff - 5) * (100 / (maxDiffMinutes - 5)));
};

const calculateReputationScore = (reputation) => {
  if (reputation >= 95) return 100;
  if (reputation >= 88) return 90;
  if (reputation >= 80) return 80;
  if (reputation >= 70) return 60;
  return 40;
};

const validatePhone = (phone) => {
  return /^1[3-9]\d{9}$/.test(phone);
};

const validateIdCard = (idCard) => {
  return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(idCard);
};

const formatMoney = (amount) => {
  return Number(amount).toFixed(2);
};

const maskPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

const maskIdCard = (idCard) => {
  if (!idCard) return '';
  return idCard.replace(/(\d{6})\d{8,11}(\d{3}|\d{2}[\dXx])/, '$1********$2');
};

module.exports = {
  success,
  error,
  pagination,
  paginateResult,
  generateOrderNo,
  generateTripNo,
  generateInvoiceNo,
  generateAgreementNo,
  generateComplaintNo,
  haversineDistance,
  calculateDistanceScore,
  calculateTimeScore,
  calculateReputationScore,
  validatePhone,
  validateIdCard,
  formatMoney,
  maskPhone,
  maskIdCard
};
