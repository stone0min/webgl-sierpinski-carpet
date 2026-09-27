"use strict";

const canvas = document.getElementById("gl-canvas");
const depthInput = document.getElementById("depth");
const redInput = document.getElementById("red");
const greenInput = document.getElementById("green");
const blueInput = document.getElementById("blue");
const depthValue = document.getElementById("depthValue");
const message = document.getElementById("message");
const gl = canvas.getContext("webgl");
const params = new URLSearchParams(window.location.search);
const startDepth = Number(params.get("depth"));

if (Number.isInteger(startDepth) && startDepth >= 0 && startDepth <= 5) {
  depthInput.value = String(startDepth);
}

for (const [name, input] of [["r", redInput], ["g", greenInput], ["b", blueInput]]) {
  const value = Number(params.get(name));
  if (Number.isInteger(value) && value >= 0 && value <= 255) {
    input.value = String(value);
  }
}

if (!gl) {
  message.textContent = "이 브라우저에서는 WebGL을 사용할 수 없습니다.";
  throw new Error("WebGL unavailable");
}

const program = createProgram(
  document.getElementById("vertex-shader").textContent,
  document.getElementById("fragment-shader").textContent
);
const buffer = gl.createBuffer();
const positionLocation = gl.getAttribLocation(program, "aPosition");
const colorLocation = gl.getUniformLocation(program, "uColor");
let points = [];
let count = 0;

gl.useProgram(program);
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLocation);
gl.clearColor(0.02, 0.03, 0.07, 1.0);

depthInput.addEventListener("input", () => {
  build(Number(depthInput.value));
});

[redInput, greenInput, blueInput].forEach(input => {
  input.addEventListener("input", () => {
    setColor();
    render();
  });
});

setColor();
build(Number(depthInput.value));

function addSquare(x, y, size) {
  const right = x + size;
  const top = y + size;
  points.push(
    x, y,
    right, y,
    right, top,
    x, y,
    right, top,
    x, top
  );
}

function divideSquare(x, y, size, depth) {
  if (depth === 0) {
    addSquare(x, y, size);
    return;
  }

  const childSize = size / 3;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (row === 1 && col === 1) {
        continue;
      }

      divideSquare(
        x + col * childSize,
        y + row * childSize,
        childSize,
        depth - 1
      );
    }
  }
}

function build(depth) {
  points = [];
  divideSquare(-0.92, -0.92, 1.84, depth);

  const data = new Float32Array(points);
  count = data.length / 2;

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  depthValue.value = depth;
  depthValue.textContent = depth;
  render();
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, count);
}

function setColor() {
  const red = clamp(Number(redInput.value));
  const green = clamp(Number(greenInput.value));
  const blue = clamp(Number(blueInput.value));
  redInput.value = red;
  greenInput.value = green;
  blueInput.value = blue;
  gl.uniform4f(colorLocation, red / 255, green / 255, blue / 255, 1.0);
  gl.viewport(0, 0, canvas.width, canvas.height);
}

function clamp(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(255, Math.max(0, Math.round(value)));
}

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(error);
  }

  return shader;
}

function createProgram(vertexSource, fragmentSource) {
  const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);
  const shaderProgram = gl.createProgram();

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(shaderProgram);
    gl.deleteProgram(shaderProgram);
    throw new Error(error);
  }

  return shaderProgram;
}
