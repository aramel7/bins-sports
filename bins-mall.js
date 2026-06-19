// bins-mall.js - 빈스몰 공용 로직 (상품, 회원, 포인트)

const MALL_PRODUCTS_KEY = 'bins_products';
const MALL_USERS_KEY = 'bins_users';
const MALL_CURRENT_USER_KEY = 'bins_current_user';

// ===== 기본 상품 시드 =====
const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'NX 프리미엄 골프공 (12개입)', points: 800, desc: '최신 NX 기기에 최적화된 공', image: '🏌️' },
  { id: 'p2', name: '프리미엄 천연가죽 장갑', points: 1200, desc: '미끄럼 방지 + 통기성 우수', image: '🧤' },
  { id: 'p3', name: '빈스 로고 자외선 차단 모자', points: 1500, desc: '도안빈스 공식 굿즈', image: '🧢' },
  { id: 'p4', name: '스포츠 냉감 타월 세트 (2매)', points: 450, desc: '여름 필수 아이템', image: '🧴' },
  { id: 'p5', name: '에너지 드링크 4캔 세트', points: 300, desc: '라운드 중 간편 보충', image: '🥤' },
  { id: 'p6', name: '티 + 마커 세트 (빈스 로고)', points: 500, desc: '고급 목재 티 포함', image: '⛳' }
];

// ===== 상품 관리 =====
function getProducts() {
  try {
    const data = JSON.parse(localStorage.getItem(MALL_PRODUCTS_KEY) || '[]');
    return data.length > 0 ? data : DEFAULT_PRODUCTS;
  } catch { return DEFAULT_PRODUCTS; }
}

function saveProducts(products) {
  localStorage.setItem(MALL_PRODUCTS_KEY, JSON.stringify(products));
}

function addProduct(product) {
  const products = getProducts();
  product.id = 'p' + Date.now();
  products.push(product);
  saveProducts(products);
  return product;
}

function updateProduct(id, updates) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx > -1) {
    products[idx] = { ...products[idx], ...updates };
    saveProducts(products);
  }
}

function deleteProduct(id) {
  let products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
}

// ===== 사용자 관리 =====
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(MALL_USERS_KEY) || '[]');
  } catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(MALL_USERS_KEY, JSON.stringify(users));
}

function registerUser({ username, password, name, phone }) {
  const users = getUsers();
  if (users.find(u => u.username === username)) {
    return { success: false, message: '이미 존재하는 아이디입니다.' };
  }
  const user = {
    id: 'u' + Date.now(),
    username,
    password, // 데모용 평문 (실서비스에서는 해시)
    name: name.trim(),
    phone: phone.trim(),
    points: 0,
    verified: false,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  saveUsers(users);
  return { success: true, user };
}

function loginUser(username, password) {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem(MALL_CURRENT_USER_KEY, JSON.stringify(user));
    return { success: true, user };
  }
  return { success: false, message: '아이디 또는 비밀번호가 틀렸습니다.' };
}

function logoutUser() {
  localStorage.removeItem(MALL_CURRENT_USER_KEY);
}

function getCurrentUser() {
  try {
    const data = localStorage.getItem(MALL_CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function updateCurrentUser(updatedUser) {
  localStorage.setItem(MALL_CURRENT_USER_KEY, JSON.stringify(updatedUser));
  // users 배열도 동기화
  const users = getUsers();
  const idx = users.findIndex(u => u.id === updatedUser.id);
  if (idx > -1) {
    users[idx] = updatedUser;
    saveUsers(users);
  }
}

// ===== 포인트 관리 =====
function addPointsToUser(userId, amount) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx > -1) {
    users[idx].points = (users[idx].points || 0) + Number(amount);
    saveUsers(users);

    // 현재 로그인 사용자라면 갱신
    const current = getCurrentUser();
    if (current && current.id === userId) {
      current.points = users[idx].points;
      localStorage.setItem(MALL_CURRENT_USER_KEY, JSON.stringify(current));
    }
    return users[idx];
  }
  return null;
}

function deductPointsFromUser(userId, amount) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx > -1) {
    const currentPoints = users[idx].points || 0;
    if (currentPoints < amount) return { success: false, message: '포인트가 부족합니다.' };
    users[idx].points = currentPoints - Number(amount);
    saveUsers(users);

    const current = getCurrentUser();
    if (current && current.id === userId) {
      current.points = users[idx].points;
      localStorage.setItem(MALL_CURRENT_USER_KEY, JSON.stringify(current));
    }
    return { success: true, user: users[idx] };
  }
  return { success: false, message: '사용자를 찾을 수 없습니다.' };
}

// ===== 관리자용 =====
function setUserVerified(userId, verified) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx > -1) {
    users[idx].verified = !!verified;
    saveUsers(users);
    const current = getCurrentUser();
    if (current && current.id === userId) {
      current.verified = users[idx].verified;
      localStorage.setItem(MALL_CURRENT_USER_KEY, JSON.stringify(current));
    }
    return users[idx];
  }
  return null;
}

// 초기 시드 (처음 실행 시)
function seedInitialData() {
  if (!localStorage.getItem(MALL_PRODUCTS_KEY)) {
    saveProducts(DEFAULT_PRODUCTS);
  }
  // 관리자 편의를 위해 기본 테스트 사용자 1명 (실행 시 생성)
  const users = getUsers();
  if (users.length === 0) {
    users.push({
      id: 'u_demo',
      username: 'testuser',
      password: '1234',
      name: '홍길동',
      phone: '010-1234-5678',
      points: 2500,
      verified: true,
      createdAt: new Date().toISOString()
    });
    saveUsers(users);
  }
}

// 페이지 로드 시 시드 실행
seedInitialData();