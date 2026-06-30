# git-document-viewer

GitHub 저장소의 특정 폴더를 문서 루트로 선택해 Markdown/Obsidian 문서를 읽는 개인/팀용 Next.js 앱입니다.

이 저장소는 뷰어 앱 코드 관리용입니다. 실제 문서 저장소는 앱에서 GitHub App으로 연결해 선택합니다.

## 주요 기능

- GitHub App 기반 저장소 연결
- 접근 가능한 저장소 목록 조회
- 브랜치 선택
- 저장소 폴더 탐색
- 선택 폴더의 `.md` 파일 트리 생성
- Markdown/GFM 렌더링
- Obsidian `[[문서]]`, `[[문서|표시명]]`, `![[이미지.png]]`, `#태그` 기본 처리
- 문서 본문 검색
- PC 3단 레이아웃과 모바일 Drawer
- 라이트/다크 모드

## 로컬 실행

```bash
pnpm install
pnpm dev
```

검증 명령:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## GitHub App 생성

GitHub 개인 계정에서 새 GitHub App을 만듭니다.

```txt
App name:
git-document-viewer

Homepage URL:
http://localhost:3000

Callback URL:
http://localhost:3000/api/github/callback

Setup URL:
http://localhost:3000/api/github/callback
```

모바일이나 새 브라우저에서 이미 설치된 GitHub App 정보를 다시 찾을 수 있도록 GitHub App의 OAuth 사용자 인증 흐름도 사용합니다.

Vercel 배포 후에는 URL을 아래처럼 바꿉니다.

```txt
Homepage URL:
https://git-document-viewer.vercel.app

Callback URL:
https://git-document-viewer.vercel.app/api/github/callback

Setup URL:
https://git-document-viewer.vercel.app/api/github/callback
```

권한은 최소 권한으로 설정합니다.

```txt
Repository permissions
- Contents: Read-only
- Metadata: Read-only
```

GitHub App을 만든 뒤 private key를 생성하고, 문서가 들어 있는 저장소에 App을 설치합니다.

## 환경변수

`.env.example`을 참고해 `.env.local`을 만듭니다.

```env
GITHUB_APP_ID=
GITHUB_APP_CLIENT_ID=
GITHUB_APP_CLIENT_SECRET=
GITHUB_APP_PRIVATE_KEY=
GITHUB_APP_INSTALL_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`GITHUB_APP_PRIVATE_KEY`는 PEM 내용을 그대로 넣습니다. Vercel에서는 줄바꿈이 유지되게 붙여 넣거나 `\n`으로 이스케이프해도 됩니다.

## Vercel 배포

1. 이 프로젝트를 GitHub 저장소로 push합니다.
2. Vercel에서 새 프로젝트를 만들고 해당 저장소를 연결합니다.
3. Framework는 Next.js로 자동 감지됩니다.
4. Environment Variables에 위 환경변수를 등록합니다.
5. 배포 후 GitHub App의 Homepage/Callback/Setup URL을 Vercel URL로 변경합니다.
6. GitHub App을 다시 설치하거나 설정을 저장한 뒤 `/setup/repositories`부터 진행합니다.

Vercel 프로젝트명은 `git-document-viewer`를 권장합니다. 동일 이름이 이미 사용 중이면 Vercel URL은 달라질 수 있습니다.

## 사용 방법

1. 사이트 접속
2. `GitHub 연결하기`
3. GitHub 계정 인증 후, GitHub App이 설치되어 있지 않으면 App 설치
4. 문서가 들어 있는 저장소 선택
5. 브랜치 `main` 선택
6. Markdown 문서가 들어 있는 폴더 선택
7. 문서 보기

## 검증용 문서 저장소

현재 기능 검증에는 아래 저장소와 폴더를 사용합니다.

```txt
Repository:
jungminna03/Project-RC

Branch:
main

Docs path:
Project-RC_docs
```

## 보안 기준

- GitHub private key와 client secret은 서버 환경변수로만 관리합니다.
- installation token은 브라우저에 전달하지 않습니다.
- GitHub API 호출은 Next.js API Route에서만 수행합니다.
- 사용자 입력 path는 `..` 이동을 차단합니다.
- Markdown HTML은 기본적으로 raw HTML을 실행하지 않습니다.
- 외부 링크는 새 탭과 `rel="noopener noreferrer"`를 사용합니다.

## 문제 해결

- 저장소가 안 보이면 GitHub App 설치 범위에 저장소가 포함되어 있는지 확인합니다.
- private repo가 안 보이면 해당 개인 계정에 저장소 접근 권한이 있는지 확인합니다.
- 모바일이나 새 브라우저에서 이미 설치된 GitHub App 설정 화면에 머물면, `/api/github/login`으로 다시 연결해 설치 정보를 다시 가져옵니다.
- 문서가 안 보이면 선택한 문서 폴더에 `.md` 파일이 있는지 확인합니다.
- Vercel에서 연결이 실패하면 `NEXT_PUBLIC_APP_URL`, Callback URL, Setup URL이 같은 배포 주소를 가리키는지 확인합니다.
