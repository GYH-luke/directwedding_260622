/**
 * 다이렉트 결혼준비 — 박람회 신청 폼 수신 + 중복(연락처) 차단
 *
 * ※ 기존 doPost 구조 그대로 유지(openById · getActiveSheet · B열 기준 마지막 행 ·
 *   A~F + I열 기록, G·H는 수동입력 보존)에 아래 2가지만 추가:
 *     1) C열(연락처) 숫자만 정규화 후 중복 검사 → 이미 있으면 저장 없이 duplicate 반환
 *     2) 응답을 JSON으로 반환 (랜딩 index.html이 res.json()으로 ok/duplicate 판독)
 *
 * 폼 필드: name, phone, weddingDate, visitDate, marketing, ct
 * 응답(JSON): { status: 'ok' | 'duplicate' | 'error', message?: string }
 *
 * 배포: 웹 앱 / 실행: 나 / 액세스 권한: 모든 사용자(익명 포함)
 */

var SPREADSHEET_ID = '1yQnp5qTl7jNm9PQJuD10-muIfJTvwO_MEZLcYbUYRbY';

// 전화번호 → 숫자만 (010-1234-5678, "010 1234 5678", 공백 등 통일)
function normPhone(v) {
  return String(v == null ? '' : v).replace(/\D/g, '');
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // 동시 제출 직렬화 → 같은 번호 중복 저장 방지
  } catch (err) {
    return jsonOut({ status: 'error', message: 'busy' });
  }

  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getActiveSheet();

    var name  = (e.parameter.name  || '').toString().trim();
    var phone = (e.parameter.phone || '').toString().trim();
    var target = normPhone(phone);

    if (!name || target.length < 10) {
      return jsonOut({ status: 'error', message: 'invalid' });
    }

    // ===== 중복 검사: C열(연락처) =====
    // 헤더/빈칸은 normPhone 결과가 '' 라 10자리 이상 target과 절대 일치하지 않음.
    var colC = sheet.getRange('C:C').getValues();
    for (var k = 0; k < colC.length; k++) {
      if (normPhone(colC[k][0]) === target) {
        return jsonOut({ status: 'duplicate' });
      }
    }

    // ===== 신규 적재 (기존 방식 유지) =====
    // B열(이름) 기준 마지막 데이터 행 찾기
    var colB = sheet.getRange('B:B').getValues();
    var lastRow = 0;
    for (var i = 0; i < colB.length; i++) {
      if (colB[i][0] !== '') lastRow = i + 1;
    }
    var targetRow = lastRow + 1;

    // A~F 입력
    sheet.getRange(targetRow, 1, 1, 6).setValues([[
      new Date(),
      name,
      phone,
      e.parameter.weddingDate,
      e.parameter.visitDate,
      e.parameter.marketing
    ]]);
    // I열 ct 입력 (G·H는 수동입력 유지)
    sheet.getRange(targetRow, 9).setValue(e.parameter.ct || '');

    return jsonOut({ status: 'ok' });
  } catch (err) {
    return jsonOut({ status: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// 헬스체크 / (선택) 중복 여부만 조회: ...exec?action=check&phone=01012345678
function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  if (p.action === 'check' && p.phone) {
    var target = normPhone(p.phone);
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    var colC = sheet.getRange('C:C').getValues();
    var exists = false;
    for (var k = 0; k < colC.length; k++) {
      if (normPhone(colC[k][0]) === target) { exists = true; break; }
    }
    return jsonOut({ status: 'ok', exists: exists });
  }
  return jsonOut({ status: 'ok', message: 'alive' });
}
