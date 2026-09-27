# WebGL Sierpinski Carpet

WebGL 1과 재귀 분할을 사용해 Sierpinski Carpet을 그리는 과제 프로젝트입니다. 분할 횟수와 도형 색상을 실시간으로 바꿀 수 있습니다.

## 실행

프로젝트 폴더에서 로컬 서버를 실행합니다.

```bash
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000`을 엽니다.

## 기능

- 분할 횟수 0-5 조절
- RGB 값으로 도형 색상 변경

## 구현 구조

- `divideSquare`: 현재 정사각형을 3×3으로 분할하고 가운데를 제외한 8개를 재귀적으로 처리합니다.
- `addSquare`: 최종 정사각형 하나를 두 삼각형, 여섯 정점으로 변환합니다.
- `build`: 단계에 맞는 정점을 다시 생성하고 GPU 버퍼에 업로드합니다.
- `setColor`: R, G, B 입력값을 0.0-1.0 범위로 변환하여 단편 셰이더의 uniform으로 전달합니다.
- `render`: 현재 버퍼의 모든 정점을 삼각형으로 그립니다.

## 파일

- `index.html`: 화면 요소와 GLSL 셰이더
- `app.js`: 재귀 생성과 WebGL 렌더링
- `style.css`: 화면 스타일
- `REPORT.md`: 제출 보고서 초안
