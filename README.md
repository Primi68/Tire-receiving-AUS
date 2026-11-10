# Tire Receiving · Android MVP

타이어 언로딩 현장에서 Blue/Orange 랙을 빠르게 세고, 예상 입고량과 실제 수량의 차이를 기록하는 모바일 우선 앱입니다. 기존 노트와 계산기 작업을 `랙당 적재량 × 4 × 묶음 수 + 추가 수량` 흐름으로 합쳤습니다.

- Android 8.0(API 26) 이상에서 실행되는 오프라인 APK
- 설치 없이 사용할 수 있는 웹 버전
- 계정, 서버, 자동 동기화 없이 기기에만 저장
- 14개 초기 타이어와 랙 색상별 적재량 프리셋

> 이 저장소는 비공개 저장소입니다. 현장 기록이나 서명 키를 소스에 커밋하지 마세요.

## 최신 변경 내역

최신 버전이 위에 오도록 기록합니다.

### 0.1.0 — 첫 Android MVP

- Blue/Orange 랙 프리셋과 2×2 랙 묶음 자동 계산 추가
- 예상 수량 일치, 차이, 직접 수정 수량을 한 화면에서 확인
- 완료, 검수 중, Pending, 부분 입고 상태와 날짜·Dock·Trailer·메모 기록
- 기록 검색·필터·수정·삭제와 한 줄 요약 복사 지원
- 타이어 마스터 및 색상별 적재량 프리셋 추가·수정·삭제 지원
- JSON 전체 백업·복원과 Android 파일 선택기 연동
- `dist/`를 직접 포함하는 오프라인 Android WebView 앱 추가
- 고정 서명 키가 없으면 release 빌드가 실패하도록 구성

릴리스 정보:

| 항목 | 값 |
| --- | --- |
| 태그 | `v0.1.0-mvp` |
| APK | `Tire-Receiving-0.1.0-preview.apk` |
| Package | `com.primi.tirereceiving` |
| Version | `0.1.0` (`versionCode 1`) |
| 최소 Android | Android 8.0 / API 26 |

자세한 내용은 [게시된 v0.1.0-mvp Release](https://github.com/Primi68/Tire-receiving-AUS/releases/tag/v0.1.0-mvp)와 [0.1.0 릴리스 노트](docs/releases/0.1.0.md)를 참고하세요.

## 바로 사용하기

- 웹 앱: <https://tire-receiving-floor-check.coral-peony-2632.chatgpt.site>
- 비공개 GitHub 저장소: <https://github.com/Primi68/Tire-receiving-AUS>
- APK 설치와 업데이트: [docs/INSTALL.md](docs/INSTALL.md)

게시된 `v0.1.0-mvp` 릴리스에서 APK, `SHA256SUMS.txt`, `SIGNING-CERT-SHA256.txt`를 함께 내려받습니다. APK를 설치하기 전에 체크섬과 서명 인증서 지문을 확인하세요.

## 현장 사용 흐름

1. 앱에서 **검수 시작**을 누르고 타이어를 검색합니다. 한글·영문 별칭도 검색할 수 있습니다.
2. Blue 또는 Orange 랙을 선택합니다. 해당 타이어와 색상에 저장된 랙당 적재량이 자동으로 적용됩니다.
3. 2×2로 묶인 랙 수를 **묶음 수**에 입력하고, 묶음 밖 타이어를 **추가 수량**에 입력합니다.
4. 앱이 `랙당 적재량 × 4 × 묶음 수 + 추가 수량`을 계산하고 예상 수량과 차이를 표시합니다.
5. 값이 맞으면 예상 수량으로 확정합니다. 다르면 계산값 또는 직접 입력한 실측 수량으로 저장합니다.
6. 상태, 날짜, Dock, Trailer, 부분 입고 수량, 특이사항을 기록합니다.
7. 근무 종료 전 **데이터 관리 → 백업 내보내기**로 JSON 파일을 보관합니다.

예: E80 HK Front 20"가 Orange 랙에 20개씩 있고, 2×2 묶음 9개와 낱개 36개가 있으면 `20 × 4 × 9 + 36 = 756`입니다.

## 초기 타이어 14종

아래 값은 최초 실행 시 생성되는 기본값입니다. 타이어 마스터에서 예상 수량, 기본 색상, Blue/Orange 사용 여부와 랙당 적재량을 수정할 수 있습니다.

| 타이어 | 기본 적재 형태 | 기본 계산식 | 예상 수량 | 추가 프리셋 |
| --- | --- | ---: | ---: | --- |
| MYP 19" | Blue 25/rack | `25 × 4 × 9 + 75` | 975 | Orange 20/rack |
| Bridgestone 20" | Orange 20/rack | `20 × 4 × 12 + 6` | 966 | Blue 25/rack |
| E80 HK Front 20" | Orange 20/rack | `20 × 4 × 9 + 36` | 756 | — |
| E80 HK Rear 20" | Orange 16/rack | `16 × 4 × 11 + 52` | 756 | — |
| HK Performance Front 21" | Orange 20/rack | `20 × 4 × 6 + 20` | 500 | — |
| HK Performance Rear 21" | Orange 16/rack | `16 × 4 × 7 + 52` | 500 | — |
| CT P 20" | Blue 20/rack | `20 × 4 × 5 + 20` | 420 | — |
| E80 Continental Front 19" | Blue 25/rack | `25 × 4 × 4` | 400 | Orange 20/rack |
| E80 Continental Rear 19" | Blue 25/rack | `25 × 4 × 4` | 400 | Orange 16/rack |
| Goodyear 18" | Blue 16/rack | `16 × 4 × 4 + 14` | 270 | — |
| Goodyear 20" | Blue 20/rack | `20 × 4 × 7 + 35` | 595 | — |
| E41 18" HK | Blue 25/rack | `25 × 4 × 9` | 900 | — |
| W68 Front 18" RT | Orange 16/rack | `16 × 4 × 5 + 32` | 352 | Blue 20/rack |
| W68 Rear 18" RT | Blue 20/rack | `20 × 4 × 4 + 32` | 352 | — |

계산식의 묶음 수와 추가 수량은 검수할 때 매번 입력하는 값입니다. 표의 식은 정상 트레일러 수량을 맞추는 대표 입력 예시이며 고정된 재고 기록이 아닙니다.

## 저장과 백업

- 타이어 마스터와 검수 기록은 앱이 실행되는 환경의 로컬 저장소에 남습니다.
- Android APK와 웹 앱은 서로 다른 저장소를 사용하며 자동 동기화하지 않습니다.
- 앱 삭제, 브라우저 데이터 삭제, 기기 초기화 전에 JSON 백업을 내보내야 합니다.
- 복원은 파일을 검사한 뒤 현재 타이어 마스터와 검수 기록 전체를 백업 내용으로 교체합니다.
- 백업 JSON에는 현장 운영 정보가 포함될 수 있으므로 승인된 위치에만 보관합니다.

자세한 데이터 취급 방식은 [docs/PRIVACY.md](docs/PRIVACY.md)를 참고하세요.

## 개발 및 빌드

필수 도구는 Node.js 22, JDK 17, Android SDK 35, Gradle 8.11.1입니다.

```bash
npm test
npm run check
./gradlew :app:assembleDebug :app:lintDebug
```

Android 앱은 `app/build.gradle`의 `sourceSets` 설정으로 저장소 루트의 `dist/`를 APK assets로 **직접 사용**합니다. 별도의 복사 단계 없이 `dist/` 수정 내용이 다음 Android 빌드에 포함됩니다.

Release 빌드는 고정 서명 환경 변수가 필요합니다. 서명 키 관리, 환경 변수, CI secret과 검증 순서는 [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)에 정리되어 있습니다.

## 문서

- [제품 및 데이터 명세](docs/SPEC.md)
- [APK 설치·업데이트·백업](docs/INSTALL.md)
- [개발·빌드·서명·릴리스](docs/DEVELOPMENT.md)
- [로컬 데이터와 개인정보](docs/PRIVACY.md)
- [자동/수동 검증 체크리스트](docs/VERIFICATION.md)
- [0.1.0 릴리스 노트](docs/releases/0.1.0.md)

## 현재 범위

0.1.0은 한 작업자가 현장에서 빠르게 수량을 확인하고 기록하는 MVP입니다. Unloading schedule 연동, 계정 로그인, 여러 기기 동기화, 서버 데이터베이스, 카메라/OCR, 알림은 포함하지 않습니다.
