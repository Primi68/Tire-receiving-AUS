# Tire Receiving 검증 기준

대상: **0.1.2 / versionCode 3 / `v0.1.2-mvp`**

검증은 정적 계약, Android 빌드·lint, 서명·릴리스 파일, 실제 Android 기기 순서로 진행합니다. 명령이 문서에 있다는 사실은 통과를 뜻하지 않습니다. 각 릴리스 담당자는 실행 결과와 기기 정보를 별도로 기록해야 합니다.

## 0. 0.1.2 릴리스 실행 결과

2026-11-10에 다음 자동 검증을 실행해 통과했습니다.

- `npm test`: 초기 타이어 14종의 고정 값, 4줄 무늬·점선·가까운 줄 조합, 계산식, DOM 79개, Android 오프라인 연결 확인
- `npm run check`: `dist/app.js`, `dist/sw.js` JavaScript 구문 확인
- Chromium 393×852: 새 검수에서 검색창 자동 포커스가 없고 14개 목록이 바로 보이는지, 전체 초기 무늬, 점선, 가까운 줄 간격, 편집 미리보기와 0.1.1 데이터 마이그레이션 확인
- `:app:assembleDebug`, `:app:lintDebug`: 성공
- `:app:assembleRelease`, `:app:lintRelease`: 고정 키로 성공, lint 오류·경고 없음
- `aapt`: package `com.primi.tirereceiving`, version `0.1.2`/`3`, min SDK 26, target SDK 35, 요청 권한 없음 확인
- `apksigner`: APK Signature Scheme v2 검증과 고정 인증서 SHA-256 일치 확인
- 서명 환경 변수를 제거하면 release 빌드가 실패하는지 확인

실제 Android 휴대전화나 에뮬레이터 검증은 이 결과에 포함하지 않습니다. 아래 실제 기기 체크리스트는 아직 완료로 표시하지 않습니다.

## 1. 정적 계약

```bash
npm test
npm run check
```

`npm test`가 확인하는 범위:

- 초기 타이어 14종의 이름, 기본 색상, 예상 수량
- 각 타이어의 위에서 아래 4줄 무늬 초기값, 점선 토큰과 가까운 줄 조합
- Blue/Orange 색상별 랙당 적재량 프리셋
- 프리셋에서 유도한 계산식이 예상 수량을 재현하는지
- JavaScript가 참조하는 DOM ID가 HTML에 존재하는지
- Android Manifest에 `INTERNET` 권한이 없는지
- WebView DOM storage 활성화와 파일 접근 차단
- `TireNative` bridge, JSON 복원, Android 뒤로 가기 진입점

`npm run check`는 `dist/app.js`와 `dist/sw.js`의 JavaScript 구문을 확인합니다.

이 검사는 브라우저 렌더링, 터치 조작, 실제 파일 선택기 동작을 대신하지 않습니다.

## 2. 계산 회귀 점검

아래 대표 입력은 모두 예상 수량과 차이 0이 되어야 합니다.

| 타이어 | 색상 / 적재량 | 묶음 | 추가 | 결과 |
| --- | ---: | ---: | ---: | ---: |
| MYP 19" | Blue 25 | 9 | 75 | 975 |
| Bridgestone 20" | Orange 20 | 12 | 6 | 966 |
| E80 HK Front 20" | Orange 20 | 9 | 36 | 756 |
| E80 HK Rear 20" | Orange 16 | 11 | 52 | 756 |
| HK Performance Front 21" | Orange 20 | 6 | 20 | 500 |
| HK Performance Rear 21" | Orange 16 | 7 | 52 | 500 |
| CT P 20" | Blue 20 | 5 | 20 | 420 |
| E80 Continental Front 19" | Blue 25 | 4 | 0 | 400 |
| E80 Continental Rear 19" | Blue 25 | 4 | 0 | 400 |
| Goodyear 18" | Blue 16 | 4 | 14 | 270 |
| Goodyear 20" | Blue 20 | 7 | 35 | 595 |
| E41 18" HK | Blue 25 | 9 | 0 | 900 |
| W68 Front 18" RT | Orange 16 | 5 | 32 | 352 |
| W68 Rear 18" RT | Blue 20 | 4 | 32 | 352 |

추가 수동 경계값:

- 추가 수량 0일 때 식에 불필요한 `+ 0`이 표시되지 않는지
- 실제 수량이 예상보다 적을 때 음수 차이가 맞는지
- 실제 수량이 예상보다 많을 때 양수 차이가 맞는지
- 직접 실측 총수량이 계산식보다 우선하는지
- 부분 입고 남은 수량이 0보다 작아지지 않는지
- 없는 색상 프리셋을 선택한 뒤 적재량을 입력·저장할 수 있는지

## 3. Android 빌드와 lint

Debug:

```bash
./gradlew --no-daemon :app:assembleDebug :app:lintDebug
```

Release는 고정 서명 환경 변수가 설정된 승인 환경에서만 실행합니다.

```bash
./gradlew --no-daemon :app:assembleRelease :app:lintRelease
```

확인 항목:

- 빌드와 lint가 오류 없이 종료되는지
- APK package가 `com.primi.tirereceiving`인지
- `versionName=0.1.2`, `versionCode=3`인지
- `minSdkVersion=26`인지
- APK assets에 현재 `dist/` 파일이 포함되는지
- merged manifest에 `android.permission.INTERNET`이 없는지
- `android:allowBackup=false`, `usesCleartextTraffic=false`인지

## 4. Release 서명

```bash
bash .github/scripts/verify-signature.sh app/build/outputs/apk/release/app-release.apk
```

추가 확인:

```bash
apksigner verify --verbose --print-certs app/build/outputs/apk/release/app-release.apk
```

- APK 서명 검증이 성공해야 합니다.
- Signer certificate SHA-256이 `.github/release-certificate.sha256`과 같아야 합니다.
- debug 인증서나 새로 만든 임시 인증서로 서명한 APK는 배포하지 않습니다.

## 5. Release 파일

`v0.1.2-mvp` Release에는 다음 파일이 있어야 합니다.

- `Tire-Receiving-0.1.2-preview.apk`
- `SHA256SUMS.txt`
- `SIGNING-CERT-SHA256.txt`

게시 후 확인:

1. GitHub Release에서 세 파일을 새 디렉터리에 다시 받습니다.
2. `sha256sum -c SHA256SUMS.txt`를 실행합니다.
3. 내려받은 APK의 인증서 지문을 다시 확인합니다.
4. 릴리스 노트의 package, version, 최소 Android가 실제 APK와 같은지 확인합니다.

## 6. 실제 Android 기기 체크리스트

아래 항목은 에뮬레이터나 정적 검사만으로 완료 처리하지 않습니다. **이 문서 작성 시점에는 특정 실제 기기에서의 통과를 주장하지 않습니다.** 릴리스 담당자가 기종, Android 버전, 실행 날짜와 결과를 기록해야 합니다.

설치:

- [ ] Android 8.0 이상 기기에 공식 APK가 설치된다.
- [ ] 앱 이름과 아이콘이 정상 표시된다.
- [ ] 첫 실행이 네트워크 없이 열린다.
- [ ] 홈 화면에 오프라인 앱 상태가 표시된다.

검수:

- [ ] 초기 타이어가 14종이다.
- [ ] 새 검수를 열면 검색창에 자동 포커스되지 않고 전체 타이어 목록이 바로 보인다.
- [ ] 이름과 한글·영문 별칭 검색이 된다.
- [ ] 14개 타이어의 색선 순서가 명세와 일치하고 Goodyear 18/20은 색선이 없다.
- [ ] E80 Continental Rear의 노랑·주황 점선과 가까운 2·3번째 줄이 구분된다.
- [ ] MYP·CT P의 1·2번째 줄과 W68 Front의 3·4번째 줄이 가까이 보인다.
- [ ] 색상 변경 시 해당 랙당 적재량과 식이 갱신된다.
- [ ] 수량 stepper와 직접 입력이 터치·키보드에서 동작한다.
- [ ] 일치, 양수 차이, 음수 차이가 구분된다.
- [ ] 네 가지 상태와 Dock, Trailer, 메모가 저장된다.
- [ ] 부분 입고 받은 수량과 남은 수량이 맞다.

기록:

- [ ] 검색과 네 가지 필터가 동작한다.
- [ ] 기록 상세, 복사, 수정, 삭제가 동작한다.
- [ ] Android 뒤로 가기가 열린 sheet를 먼저 닫고 Today로 돌아간다.

마스터:

- [ ] 타이어를 추가·수정·삭제할 수 있다.
- [ ] 타이어 무늬 네 줄의 색·점선과 가까운 줄 조합을 편집하고 목록에서 저장 결과를 확인할 수 있다.
- [ ] Blue/Orange 적재량과 기본 색상을 바꿀 수 있다.
- [ ] 현장 검수에서 수정한 적재량을 프리셋으로 저장할 수 있다.

백업:

- [ ] Android 문서 선택기로 JSON을 내보낼 수 있다.
- [ ] 내보낸 JSON을 다시 선택해 복원할 수 있다.
- [ ] 잘못된 JSON을 거절하고 기존 데이터를 유지한다.
- [ ] 복원 확인 전에는 현재 데이터를 교체하지 않는다.

업데이트:

- [ ] 같은 고정 서명의 다음 `versionCode` APK가 기존 앱 위에 설치된다.
- [ ] 업데이트 뒤 기존 마스터와 기록이 유지된다.

## 7. 기기 결과 기록 양식

```text
Release/tag:
APK SHA-256:
Signer certificate SHA-256:
Device:
Android version:
Android System WebView version:
Test date:
Tester:

Install:
Offline launch:
Count/formula:
Records/edit/delete:
Preset edit:
Export/import:
Upgrade:
Known issues:
```

실패가 있으면 재현 입력, 화면, 기대 결과와 실제 결과를 기록합니다. 실제 운영 데이터가 보이는 스크린샷이나 백업 JSON은 GitHub issue에 첨부하지 않습니다.
