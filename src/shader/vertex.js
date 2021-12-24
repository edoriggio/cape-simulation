export default `#version 300 es
layout(location=0) in vec3 Position;
layout(location=1) in vec3 VertexNormal;

uniform mat4 ModelMatrix;
uniform mat4 ViewMatrix;
uniform mat4 ProjectionMatrix;

out vec3 vertexNormal;

void main(){
  vertexNormal = vec4(ViewMatrix * ModelMatrix * vec4(VertexNormal, 0.0)).xyz;
  gl_Position = ProjectionMatrix * ViewMatrix * ModelMatrix * vec4(Position, 1.0);
}`
