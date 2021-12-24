export default `#version 300 es
precision highp float;

uniform vec3 L;

in vec3 vertexNormal;
out vec4 color;

const float ambient = 0.1;

void main(){
  float diffuse = max(dot(normalize(vertexNormal), normalize(L)), 0.0);
  float lighting = ambient + (1.0 - ambient) * diffuse;

  color = vec4(vec3(lighting),1.0);
}`
