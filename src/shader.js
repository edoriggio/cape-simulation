import vertexShaderCode from "./shader/vertex.js";
import fragmentShaderCode from "./shader/fragment.js";

var gl; // WebGL context
var shaderProgram; // The GLSL program we will use for rendering

var terrain_vao; // The vertex array object for the terrain
var cloth_vao; // The vertex array object for the cloth

var terrainVertexBuffer;
var terrainNormalBuffer;

var clothVertexBuffer;
var clothNormalBuffer;
var clothTriangleBuffer;


/**
 * Function to initialize the WebGL context.
 */
function initWebGL() {
  var canvas = document.getElementById("webgl-canvas");
  gl = canvas.getContext("webgl2");

  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  if (gl) {
    console.log("WebGL successfully initialized.");
  } else {
    console.log("Failed to initialize WebGL.")
  }
}


/**
 * Function to compile the shader.
 * @param shader The shader to compile
 * @param source The source of the shader
 * @param type The type of the shader
 * @param name The name of the shader (default: "")
 */
function compileShader(shader, source, type, name = "") {
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (success) {
    console.log(name + " shader compiled successfully.");
  } else {
    console.log(name + " vertex shader error.")
    console.log(gl.getShaderInfoLog(shader));
  }
}


/**
 * Function to link the GLSL program by combining the vertex and
 * fragment shaders.
 * @param program The GLSL program
 * @param vertShader The vertex shader
 * @param fragShader The fragment shader
 */
 function linkProgram(program, vertShader, fragShader) {
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);

  gl.linkProgram(program);

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log("The shaders are initialized.");
  } else {
    console.log("Could not initialize shaders.");
  }
}


function initShaders() {
  let vertShader = gl.createShader(gl.VERTEX_SHADER);
  compileShader(vertShader, vertexShaderCode, gl.VERTEX_SHADER, "Vertex");

  let fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  compileShader(fragShader, fragmentShaderCode, gl.FRAGMENT_SHADER, "Fragment");

  shaderProgram = gl.createProgram();
  linkProgram(shaderProgram, vertShader, fragShader);

  shaderProgram.modelMatrixUniform = gl.getUniformLocation(shaderProgram, "ModelMatrix");
  shaderProgram.viewMatrixUniform = gl.getUniformLocation(shaderProgram, "ViewMatrix");
  shaderProgram.projectionMatrixUniform = gl.getUniformLocation(shaderProgram, "ProjectionMatrix");
  shaderProgram.lightDirectionUniform = gl.getUniformLocation(shaderProgram, "L");
}


/**
 * Function to create the GLSL programs.
 */
function createGLSLProgram(program, vertCode, fragCode) {
  let vertexShader = gl.createShader(gl.VERTEX_SHADER);
  compileShader(vertexShader, vertCode, gl.VERTEX_SHADER, "Vertex shader");

  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  compileShader(fragmentShader, fragCode, gl.VERTEX_SHADER, "Fragment shader");

  linkProgram(program, vertexShader, fragmentShader);
}

function createGLSLPrograms() {
  shaderProgram = gl.createProgram();
  createGLSLProgram(shaderProgram, vertexShaderCode, fragmentShaderCode);

  terrainShaderProgram = gl.createProgram();
  createGLSLProgram(terrainShaderProgram, terrainVertexShaderCode, terrainFragmentShaderCode);
}


function createVAO(vao, shader, vertices, colors, normals) {
  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  let colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  let normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

  gl.bindVertexArray(vao);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  let positionAttributeLocation = gl.getAttribLocation(shader, "a_position");
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  let colorAttributeLocation = gl.getAttribLocation(shader, "a_color");
  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  let normalAttributeLocation = gl.getAttribLocation(shader, "a_normal");
  gl.enableVertexAttribArray(normalAttributeLocation);
  gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
}


/**
 * Function to initialize the buffers.
 */
function initBuffers() {
  // cloth
  clothVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, clothVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cloth_vertices), gl.DYNAMIC_DRAW);
  clothNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, clothNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cloth_normals), gl.DYNAMIC_DRAW);
  clothTriangleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, clothTriangleBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(cloth_triangles), gl.STATIC_DRAW);

  cloth_vao = gl.createVertexArray();
  gl.bindVertexArray(cloth_vao);

  gl.enableVertexAttribArray(0);
  gl.bindBuffer(gl.ARRAY_BUFFER, clothVertexBuffer);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(1);
  gl.bindBuffer(gl.ARRAY_BUFFER, clothNormalBuffer);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, clothTriangleBuffer);

  // terrain
  terrainVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrain_vertices), gl.STATIC_DRAW);
  terrainNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, terrainNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(terrain_normals), gl.STATIC_DRAW);

  terrain_vao = gl.createVertexArray();
  gl.bindVertexArray(terrain_vao);

  gl.enableVertexAttribArray(0);
  gl.bindBuffer(gl.ARRAY_BUFFER, terrainVertexBuffer);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(1);
  gl.bindBuffer(gl.ARRAY_BUFFER, terrainNormalBuffer);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
}


function my_drawArray(vao, program, num, modelMatrix) {
  gl.uniformMatrix4fv(program.modelMatrixUniform, false, modelMatrix);
  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, num);
}

function my_drawElements(vao, program, num, modelMatrix) {
  gl.uniformMatrix4fv(program.modelMatrixUniform, false, modelMatrix);
  gl.bindVertexArray(vao);
  gl.drawElements(gl.TRIANGLES, num, gl.UNSIGNED_INT, 0);
}

function drawGeometry(program) {
  let modelMatrix = mat4.create();
  mat4.identity(modelMatrix);
  //draw terrain (flat plane)
  mat4.fromTranslation(modelMatrix, vec3.fromValues(0.0, -1.0, 0.0));
  my_drawArray(terrain_vao, program, terrain_vertices.length / 3, modelMatrix);
  //draw cloth
  mat4.fromTranslation(modelMatrix, vec3.fromValues(0.0, 1.0, -1.0));
  gl.disable(gl.CULL_FACE);
  my_drawElements(cloth_vao, program, cloth_triangles.length, modelMatrix);
  gl.enable(gl.CULL_FACE);
}


/**
 * Function to draw the scene.
 */
function draw() {
  var camera_rotation = document.getElementById("camera_rotation");
  var camera_y = document.getElementById("camera_y");
  var camera_distance = document.getElementById("camera_distance");
  var light_rotation = document.getElementById("light_rotation");
  var light_height = document.getElementById("light_height");

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(shaderProgram);

  // View matrix
  var viewMatrix = mat4.create();
  let rotation = camera_rotation.value / 100 * Math.PI * 2;
  let radius = camera_distance.value / 10;
  mat4.lookAt(viewMatrix, vec3.fromValues(radius * Math.sin(rotation), 5 * (camera_y.value) / 100, radius * Math.cos(rotation)), vec3.fromValues(0, 0.6, 0), vec3.fromValues(0, 1, 0));

  // Light direction
  let lr = light_rotation.value / 100 * Math.PI * 2;
  let r = Math.cos(Math.PI * light_height.value / 200);
  let light_direction = vec3.fromValues(r * Math.sin(lr), Math.sin(Math.PI * light_height.value / 200), r * Math.cos(lr));
  let viewMatrix3x3 = mat3.create();
  mat3.fromMat4(viewMatrix3x3, viewMatrix)
  vec3.transformMat3(light_direction, light_direction, viewMatrix3x3);

  // Projection ViewMatrix
  var projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, 1.3, 1024 / 768, 0.1, 100);

  // Setting uniforms for all objects
  gl.uniformMatrix4fv(shaderProgram.viewMatrixUniform, false, viewMatrix);
  gl.uniformMatrix4fv(shaderProgram.projectionMatrixUniform, false, projectionMatrix);
  gl.uniform3fv(shaderProgram.lightDirectionUniform, light_direction);

  drawGeometry(shaderProgram);
}


var spring_start = []; // the i-th element contains the index of the vertex which starts the i-th spring
var spring_end = []; // the i-th element contains the index of the vertex which ends the i-th spring
var spring_rest = []; // the i-th element contains the rest length of the i-th spring

var time; // variable that counts the time in milliseconds from the initialization of the mass spring system
var v = []; // velocities of the cloth vertices
var f = []; // forces acting on individual cloth vertices (gravity + springs + any external)

var gravity = 9.80665;
var mass = 0.1; // mass of every vertex
var damping = 1.0; // damping coefficient of every spring
var k = 30; // stiffness coefficient of every spring

var deltaT = 0.001; // time step for simulation


// the function initialized the topology of the mass-spring system
function initMassSpringSystem() {
  // adding springs
  for (let i = 0; i < cloth_size - 1; i++) {
    for (let j = 0; j < cloth_size - 1; j++) {
      let top = i * cloth_size + j;
      // vertical 1
      spring_start.push(top);
      spring_end.push(top + cloth_size);
      spring_rest.push(1.0 / (cloth_size - 1));
      // horizontal 1
      spring_start.push(top);
      spring_end.push(top + 1);
      spring_rest.push(1.0 / (cloth_size - 1));
      // vertical 2
      spring_start.push(top + 1);
      spring_end.push(top + 1 + cloth_size);
      spring_rest.push(1.0 / (cloth_size - 1));
      // horizontal 1
      spring_start.push(top + cloth_size);
      spring_end.push(top + 1 + cloth_size);
      spring_rest.push(1.0 / (cloth_size - 1));
      // diagonal 1
      spring_start.push(top);
      spring_end.push(top + 1 + cloth_size);
      spring_rest.push(Math.sqrt(2) * 1.0 / (cloth_size - 1));
      // diagonal 2
      spring_start.push(top + 1);
      spring_end.push(top + cloth_size);
      spring_rest.push(Math.sqrt(2) * 1.0 / (cloth_size - 1));
    }
  }

  // initializing velocities and forces
  for (let i = 0; i < cloth_size * cloth_size; i++) {
    v.push(vec3.fromValues(0.0, 0.0, 0.0));
    f.push(vec3.fromValues(0.0, 0.0, 0.0));
  }

  time = Date.now();
}


function updateNormals() {

  // ------------ Assignment ------------
  // Impement this funciton to update per-vertex normal vectors of the cloth.
  // More precisly, the function should update cloth_normals array based on cloth_vertices array.
  // Remember that every three consecutive values stored in cloth_normals/cloth_vertices correspond
  // to per-vertex normal/position




  // The three lines below will make sure that the buffer on the GPU,
  // which stores the normal vectors will be updated.
  gl.bindBuffer(gl.ARRAY_BUFFER, clothNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cloth_normals), gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}


function updateCloth() {

  // initializing forces for every particle with gravity and any external forces
  for (let i = 0; i < cloth_size * cloth_size; i++) {
    f[i] = gravity;
  }

  // computing the forces exerted by every spring and adding them to the forces acting on particles
  for (let i = 0; i < spring_start.length; i++) {
    let p = spring_start[i]; // index of the particle/vertex which corresponds to one end of the spring
    let q = spring_end[i]; // index of the particle/vertex which corresponds to one end of the spring

    // positions of the two ends of the spring
    let x_p = vec3.fromValues(cloth_vertices[3 * p], cloth_vertices[3 * p + 1], cloth_vertices[3 * p + 2]);
    let x_q = vec3.fromValues(cloth_vertices[3 * q], cloth_vertices[3 * q + 1], cloth_vertices[3 * q + 2]);

    // Compute forces exert by the spring and the damping forces
    // Use the computed forces to update f[p] and f[q], i.e., accumulated forces which act on the particles
    let hooke = k * (vec3.length(x_q - x_p) / spring_rest[i]) * ((x_q - x_p) / vec3.length(x_q - x_p));
    // console.log(hooke)
    let damping_factor = damping
  }

  // updating position an velocities of the particles based on forces and masses
  for (let i = 0; i < cloth_size * cloth_size; i++) {
    if (i !== 0 && i !== cloth_size - 1) {
      // Here update the velocity and position of every particle

      // let velocity = deltaT * (f[i] / mass)

      // // velocity of i-th particle
      // v[i][0] += velocity;
      // v[i][1] += velocity;
      // v[i][2] += velocity;

      // let position = deltaT * v[i]

      // // position of i-th particle
      // cloth_vertices[3*i] += position.x
      // cloth_vertices[3*i+1] += position.y
      // cloth_vertices[3*i+2] += position.z
    }
  }

  // The three lines below will make sure that the buffer on the GPU,
  // which stores the positions of particles, will be updated.
  gl.bindBuffer(gl.ARRAY_BUFFER, clothVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cloth_vertices), gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}


function run() {
  draw();

  var num_substeps = 1.0 / 60 / deltaT;

  for (let i = 0; i < num_substeps; i++) {
    updateCloth();
  }

  updateNormals();
  window.requestAnimationFrame(function () { run(); });
}


function start() {
  initWebGL();
  initShaders();
  initBuffers();
  initMassSpringSystem();
  run();
}


function main() {
  start();
}

export default main;
