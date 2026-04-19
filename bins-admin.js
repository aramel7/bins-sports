// 빈스 스포츠 마케팅 - 신청 관리 공용 스크립트

const STORAGE_KEY = 'bins_applications';

function saveApplication(data) {
  const apps = getApplications();
  const entry = {
    id: Date.now().toString(),
    submittedAt: new Date().toISOString(),
    status: '신규',
    ...data
  };
  apps.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  return entry;
}

function getApplications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function showSuccessPopup(type) {
  const labels = {
    '레슨': '레슨 신청',
    '1박2일패키지': '1박2일 패키지 예약',
    '전지훈련': '전지훈련 신청'
  };
  const label = labels[type] || '신청';

  const overlay = document.createElement('div');
  overlay.id = 'success-popup';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;';
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:24px;padding:48px 40px;max-width:420px;width:100%;text-align:center;box-shadow:0 32px 64px rgba(0,0,0,0.2);">
      <div style="font-size:56px;margin-bottom:16px;">✅</div>
      <h2 style="font-size:24px;font-weight:900;color:#166534;margin-bottom:12px;">${label} 완료!</h2>
      <p style="color:#4b7c5e;font-size:15px;line-height:1.6;margin-bottom:8px;">신청해 주셔서 감사합니다.<br/>24시간 이내 담당자가 연락드립니다.</p>
      <p style="color:#9ca3af;font-size:13px;margin-bottom:28px;">카카오톡 @빈스스포츠로도 문의 가능합니다.</p>
      <button onclick="document.getElementById('success-popup').remove()" style="background:linear-gradient(135deg,#a07d10,#c9a227,#e6c458);color:#fff;font-weight:900;font-size:16px;padding:14px 36px;border-radius:999px;border:none;cursor:pointer;width:100%;">확인</button>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.remove();
  });
}
