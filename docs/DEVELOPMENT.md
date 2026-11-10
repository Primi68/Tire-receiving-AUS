# Tire Receiving 개발, 빌드 및 릴리스

## 개발 환경

| 도구 | 기준 |
| --- | --- |
| Node.js | 22 |
| JDK | 17 |
| Android SDK | compile/target SDK 35 |
| Android Build Tools | 35.0.0 |
| Gradle | Wrapper 8.11.1 |
| Android Gradle Plugin | 8.9.2 |

저장소:

```text
https://github.com/Primi68/Tire-receiving-AUS
```

비공개 저장소이므로 GitHub 접근 권한이 필요합니다.

## 프로젝트 구조

```text
dist/                              웹 앱 원본이자 Android assets 입력
  index.html
  styles.css
  app.js
  sw.js
  manifest.webmanifest
  icon.svg
app/
  build.gradle                    Android 버전, assets, release 서명
  src/main/AndroidManifest.xml    권한 및 Activity 선언
  src/main/java/.../MainActivity.java
tests/validate-static.mjs         정적 계약 검사
.github/workflows/android.yml     CI 검증과 서명 빌드
.github/scripts/                  키 복원과 서명 검증
docs/                             제품 명세와 릴리스 노트
```

`app/build.gradle`은 다음 설정으로 저장소 루트의 `dist/`를 Android assets로 **직접 사용**합니다.

```groovy
sourceSets {
    main.assets.srcDirs = ["$rootDir/dist"]
}
```

`dist/`를 다른 디렉터리로 복사하거나 생성하는 별도 단계는 없습니다. 웹 UI를 고친 뒤 Android를 다시 빌드하면 같은 파일이 APK에 포함됩니다.

## 로컬 검증

웹 정적 계약과 JavaScript 구문을 먼저 확인합니다.

```bash
npm test
npm run check
```

`npm test`의 정적 검사는 다음 계약을 확인합니다.

- 초기 타이어가 정확히 14종인지
- 이름, 기본 색상, 예상 수량, 색상별 랙당 적재량이 기준값과 같은지
- 각 프리셋으로 유도한 식이 예상 수량을 재현하는지
- JavaScript가 찾는 DOM ID가 HTML에 존재하는지
- Android Manifest에 `INTERNET` 권한이 없는지
- WebView DOM storage, 파일 접근 차단, `TireNative` bridge가 설정됐는지
- JSON 복원과 Android 뒤로 가기 진입점이 존재하는지

Android debug 빌드와 lint:

```bash
./gradlew --no-daemon :app:assembleDebug :app:lintDebug
```

산출물:

```text
app/build/outputs/apk/debug/app-debug.apk
app/build/reports/lint-results-debug.html
```

Debug APK는 개발 확인용이며 GitHub Release에 배포하지 않습니다.

## 변경 규칙

### 타이어 마스터

초기값을 바꿀 때는 `dist/app.js`의 `SEED_TIRES`, [제품 명세](SPEC.md), README 표와 정적 검사를 함께 수정합니다. 정상 트레일러 수량은 추측하지 말고 확인된 값만 반영합니다.

### 계산

핵심 식 `qtyPerRack × 4 × groupCount + extraQty`에서 상수 4는 2×2 랙 묶음을 뜻합니다. 계산 로직을 바꾸면 다음 경우를 확인합니다.

- 추가 수량이 0인 경우
- 추가 수량이 있는 경우
- 사용자가 직접 총수량을 입력한 경우
- 예상 수량보다 많거나 적은 경우
- 부분 입고 받은 수량이 실제 수량보다 큰 경우

### 로컬 데이터

기존 저장 키 `tire-receiving.tires.v1`, `tire-receiving.records.v1`의 구조를 호환성 검토 없이 바꾸지 않습니다. 스키마를 바꾸면 구버전 JSON 복원과 마이그레이션 정책을 함께 설계합니다.

### 보안

- 실제 Trailer, Dock, 생산 수량, 메모가 담긴 백업을 커밋하지 않습니다.
- keystore, 비밀번호, base64 키, 임시 복원 파일을 커밋하지 않습니다.
- `INTERNET` 권한을 추가하거나 외부 URL 로드를 허용할 때는 제품 범위와 개인정보 문서를 먼저 검토합니다.
- JSON import 검증과 20MB 제한을 제거하지 않습니다.

## 버전 올리기

릴리스마다 다음 값을 함께 바꿉니다.

1. `package.json`의 `version`
2. `app/build.gradle`의 `versionName`과 단조 증가하는 `versionCode`
3. APK 파일명을 만드는 workflow
4. README의 최신 변경 내역
5. `docs/releases/<version>.md`
6. 필요한 경우 웹 service worker cache 이름

0.1.1 기준:

| 항목 | 값 |
| --- | --- |
| Package | `com.primi.tirereceiving` |
| Version name | `0.1.1` |
| Version code | `2` |
| 릴리스 태그 | `v0.1.1-mvp` |
| APK | `Tire-Receiving-0.1.1-preview.apk` |

## 고정 release 서명

Release APK는 프로젝트가 정한 한 개의 서명 키로만 빌드합니다. `app/build.gradle`은 다음 조건 중 하나라도 없으면 release 빌드를 실패시킵니다.

- `TIRE_RELEASE_STORE_FILE`: keystore 절대 경로
- `TIRE_RELEASE_STORE_PASSWORD`: keystore 및 `tire-receiving` key alias 비밀번호
- keystore 안의 `tire-receiving` alias

로컬 예시:

```bash
export TIRE_RELEASE_STORE_FILE=/absolute/path/to/tire-receiving-release.keystore
export TIRE_RELEASE_STORE_PASSWORD='use-a-secret-value'
./gradlew --no-daemon :app:assembleRelease :app:lintRelease
```

명령 기록이나 `.env` 파일에 실제 비밀번호를 남기지 않습니다. 기존 앱 업데이트가 가능하려면 이전 릴리스와 같은 keystore를 사용해야 합니다. 키를 잃어버리면 같은 package의 정상 업데이트를 만들 수 없습니다.

프로젝트는 허용된 release 인증서의 SHA-256 지문을 `.github/release-certificate.sha256`에 고정합니다. 빌드 후:

```bash
bash .github/scripts/verify-signature.sh app/build/outputs/apk/release/app-release.apk
```

이 검사가 실패한 APK는 배포하지 않습니다. 새 키 생성은 최초 서명 체계를 만드는 단 한 번의 관리 작업이며, 기존 릴리스가 있는 프로젝트에서 임의로 새 키와 지문을 만들면 업데이트 경로가 끊깁니다.

## GitHub Actions secret

저장소 Settings → Secrets and variables → Actions에 다음 repository secret이 필요합니다.

| Secret | 내용 |
| --- | --- |
| `TIRE_RELEASE_KEYSTORE_BASE64` | 고정 keystore 파일의 base64 문자열 |
| `TIRE_RELEASE_KEYSTORE_PASSWORD` | keystore와 `tire-receiving` alias 비밀번호 |

Linux에서 승인된 keystore를 base64 한 줄로 준비하는 예:

```bash
base64 -w 0 /absolute/path/to/tire-receiving-release.keystore
```

macOS:

```bash
base64 < /absolute/path/to/tire-receiving-release.keystore | tr -d '\n'
```

출력은 터미널 공유, 이슈, PR, 로그에 붙이지 않고 GitHub secret 입력란에만 넣습니다. CI는 임시 권한 제한 디렉터리에 keystore를 복원하고 작업 종료 시 삭제합니다.

## Release 빌드와 게시

0.1.1 릴리스 절차:

1. main 브랜치에서 버전과 릴리스 노트를 최종 확인합니다.
2. `npm test`, `npm run check`, Android release build와 lint를 실행합니다.
3. 고정 인증서 지문 검증을 통과한 APK만 사용합니다.
4. APK 이름을 `Tire-Receiving-0.1.1-preview.apk`로 정합니다.
5. APK SHA-256을 `SHA256SUMS.txt`에 기록합니다.
6. 고정 인증서 지문 파일 `SIGNING-CERT-SHA256.txt`를 함께 준비합니다.
7. GitHub Actions의 **Android MVP** workflow를 `workflow_dispatch`로 실행합니다.
8. 서명 빌드 artifact와 Android lint report를 확인합니다.
9. `v0.1.1-mvp` 태그와 GitHub Release에 APK, 체크섬, 인증서 지문, [릴리스 노트](releases/0.1.1.md)를 게시합니다.
10. Release에서 다시 내려받은 APK의 체크섬과 서명을 확인합니다.
11. 지원 Android 기기의 수동 체크리스트 결과를 [VERIFICATION.md](VERIFICATION.md)에 기록합니다.

자동 검증 통과는 실제 기기 검증을 대신하지 않습니다. 실제 기기에서 실행하지 않은 항목은 완료로 표시하지 않습니다.

## Pull request 확인 항목

- 변경 목적과 현장 동작이 설명되어 있는가
- 초기값 또는 계산 변경 근거가 있는가
- 실제 운영 데이터와 secret이 diff에 없는가
- 정적 검사와 관련 Android 검사가 실행되었는가
- 데이터 스키마 및 구버전 백업 호환성을 검토했는가
- 사용자에게 영향을 주는 변경이 README와 릴리스 노트의 맨 위에 반영되었는가
