import assert from 'node:assert/strict';
import test from 'node:test';
import {
  evaluateDartBusinessNumber,
  matchDartCorporation,
  parseDartCompanyProfile,
  parseDartCorpCodes,
} from '../app/lib/opendart';

test('OpenDART corporation codes match curated Korean names after suffix normalization', () => {
  const rows = parseDartCorpCodes({
    status: '000',
    list: [
      {
        corp_code: '00126380',
        corp_name: '주식회사 오뚜기',
        corp_eng_name: 'OTTOGI CORPORATION',
        stock_code: '007310',
        modify_date: '20260701',
      },
      {
        corp_code: '01258507',
        corp_name: '롯데웰푸드(주)',
        corp_eng_name: 'LOTTE WELLFOOD CO.,LTD.',
        stock_code: '280360',
        modify_date: '20260701',
      },
    ],
  });

  assert.equal(matchDartCorporation(rows, '(주)오뚜기')?.corpCode, '00126380');
  assert.equal(matchDartCorporation(rows, '롯데웰푸드(주)')?.corpCode, '01258507');
  assert.equal(matchDartCorporation(rows, '없는 회사'), undefined);
});

test('OpenDART evidence distinguishes missing, confirmed, and conflicting business numbers', () => {
  const profile = parseDartCompanyProfile({
    status: '000',
    corp_code: '00126380',
    corp_name: '주식회사 오뚜기',
    bizr_no: '1388103260',
  });

  assert.equal(evaluateDartBusinessNumber([profile], '(주)오뚜기').kind, 'available');
  assert.equal(evaluateDartBusinessNumber([profile], '(주)오뚜기', '138-81-03260').kind, 'confirmed');
  assert.equal(evaluateDartBusinessNumber([profile], '(주)오뚜기', '0000000000').kind, 'conflict');
  assert.equal(evaluateDartBusinessNumber([profile], '없는 회사').kind, 'no_match');
});

test('ambiguous OpenDART names fail closed instead of assigning another company number', () => {
  const rows = parseDartCorpCodes({
    status: '000',
    list: [
      { corp_code: '00000001', corp_name: '삼진푸드', stock_code: '', modify_date: '20260701' },
      { corp_code: '00000002', corp_name: '(주)삼진푸드', stock_code: '', modify_date: '20260701' },
    ],
  });

  assert.equal(matchDartCorporation(rows, '삼진푸드'), undefined);
});

test('OpenDART company profiles expose only valid registry business numbers', () => {
  assert.deepEqual(parseDartCompanyProfile({
    status: '000',
    corp_code: '00126380',
    corp_name: '오뚜기',
    corp_name_eng: 'OTTOGI CORPORATION',
    stock_code: '007310',
    jurir_no: '1341110002258',
    bizr_no: '138-81-03260',
    adres: '경기도 안양시',
    hm_url: 'https://www.ottogi.co.kr',
  }), {
    corpCode: '00126380',
    name: '오뚜기',
    nameEn: 'OTTOGI CORPORATION',
    stockCode: '007310',
    jurirNo: '1341110002258',
    bizrno: '1388103260',
    address: '경기도 안양시',
    homepage: 'https://www.ottogi.co.kr',
  });

  assert.throws(
    () => parseDartCompanyProfile({ status: '000', corp_code: '00000001', corp_name: 'bad', bizr_no: '123' }),
    /10-digit/,
  );
  assert.throws(
    () => parseDartCompanyProfile({ status: '013', message: '조회된 데이타가 없습니다.' }),
    /013/,
  );
});
