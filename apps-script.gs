/**
 * 다이렉트 결혼준비 — 박람회 신청 폼 수신 + 중복(전화번호) 차단
 *
 * 배포 설정(웹 앱):
 *   - 실행: 나(본인 계정)
 *   - 액세스 권한: 모든 사용자(익명 포함)
 *
 * 폼에서 넘어오는 필드: name, phone, weddingDate, visitDate, marketing, ct
 * 응답(JSON): { status: 'ok' | 'duplicate' | 'error', message?: string }
 *
 * ── 중복 판정 기준 ──────────────────────────────────────────────
 *   전화번호(숫자만)가 이미 시트에 있으면 'duplicate' 반환 → 랜딩에서 차단.
 *   열 위치와 무관하게 기존 행의 모든 셀을 숫자만 정규화해 비교하므로,
 *   과거 데이터가 어느 열에 저장돼 있든 중복이 잡힙니다.
 * ───────────────────────────────────────────────────────────────
 */

// ===== 설정 =====
var CONFIG = {
  // 시트에 '붙어 있는'(컨테이너 바운드) 스크립트면 '' 로 두세요(활성 스프레드시트 사용).
  // 독립형 스크립트면 대상 스프레드시트 ID를 넣으세요.
  SPREADSHEET_ID: '',
  // '' 이면 첫 번째 시트를 사용. 특정 시트면 시트명(탭 이름)을 넣으세요.
  SHEET_NAME: '',
  // 시트가 완전히 비어 있을 때만 자동 생성되는 헤더(실제 시트 열 순서와 동일).
  // 폼이 채우는 열: A유입날짜 B이름 C연락처 D결혼예정월 E방문희망일 F마케팅활용 I광고세트&소재명
  // G방문일경과 · H방문여부 = 운영팀/수식용 → 스크립트가 건드리지 않음.
  HEADER: ['유입날짜', '이름', '연락처', '결혼예정월', '방문희망일', '마케팅 활용', '방문일 경과', '방문여부', '광고세트 & 소재명']
};

function _getSheet() {
  var ss = CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  return CONFIG.SHEET_NAME ? ss.getSheetByName(CONFIG.SHEET_NAME) : ss.getSheets()[0];
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// 전화번호 → 숫자만 (010-1234-5678, "010 1234 5678", 공백 등 모두 통일)
function _normPhone(v) {
  return String(v == null ? '' : v).replace(/\D/g, '');
}

// 대상 번호가 시트에 이미 있는지 검사 (열 위치 무관 전체 스캔)
function _phoneExists(sheet, target) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  var values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  for (var r = 0; r < values.length; r++) {
    for (var c = 0; c < values[r].length; c++) {
      if (_normPhone(values[r][c]) === target) return true;
    }
  }
  return false;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // 동시 제출 직렬화 → 같은 번호 중복 저장 방지
  } catch (err) {
    return _json({ status: 'error', message: 'busy' });
  }

  try {
    var p = (e && e.parameter) ? e.parameter : {};
    var name        = (p.name || '').toString().trim();
    var phone       = (p.phone || '').toString().trim();
    var weddingDate = (p.weddingDate || '').toString();
    var visitDate   = (p.visitDate || '').toString();
    var marketing   = (p.marketing || '').toString();
    var ct          = (p.ct || '').toString();

    var target = _normPhone(phone);
    if (!name || target.length < 10) {
      return _json({ status: 'error', message: 'invalid' });
    }

    var sheet = _getSheet();

    // 완전히 빈 시트면 헤더 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(CONFIG.HEADER);
    }

    // 중복(전화번호) 검사
    if (_phoneExists(sheet, target)) {
      return _json({ status: 'duplicate' });
    }

    // 신규 적재
    // 운영팀 열(G 방문일 경과, H 방문여부)은 덮어쓰지 않도록
    // A~F와 I(광고세트 & 소재명)만 정확히 지정해서 기록.
    var row = sheet.getLastRow() + 1;
    sheet.getRange(row, 1, 1, 6).setValues([[new Date(), name, phone, weddingDate, visitDate, marketing]]); // A~F
    sheet.getRange(row, 9).setValue(ct); // I

    return _json({ status: 'ok' });
  } catch (err) {
    return _json({ status: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// 헬스체크 / (선택) 브라우저에서 중복 여부만 조회: ...exec?action=check&phone=01012345678
function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  if (p.action === 'check' && p.phone) {
    var target = _normPhone(p.phone);
    var exists = _phoneExists(_getSheet(), target);
    return _json({ status: 'ok', exists: exists });
  }
  return _json({ status: 'ok', message: 'alive' });
}
