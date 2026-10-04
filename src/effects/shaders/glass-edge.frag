// Rounded rectangle distance and edge/rim intensity adapted from
// dashersw/liquid-glass-js, Copyright 2025 Armagan Amcalar, MIT.
// This draws an optical edge only. CSS supplies live backdrop blur;
// no page snapshot, user contents, external textures or animation loop.
precision mediump float;
uniform vec2 u_resolution;
uniform float u_radius;
float roundedRectDistance(vec2 coord,vec2 size,float radius){
 vec2 center=size*.5;
 vec2 toCorner=abs(coord*size-center)-(center-radius);
 return length(max(toCorner,0.0))+min(max(toCorner.x,toCorner.y),0.0)-radius;
}
void main(){
 vec2 uv=gl_FragCoord.xy/u_resolution;
 float distance=roundedRectDistance(uv,u_resolution,u_radius);
 if(distance>0.0)discard;
 float inside=max(-distance,0.0);
 float rim=exp(-inside*.8);
 float edge=exp(-inside*.15);
 float highlight=mix(.08,.42,uv.y)*rim+.025*edge;
 vec3 tint=mix(vec3(.77,.65,.43),vec3(1.0,.97,.99),uv.y);
 gl_FragColor=vec4(tint,highlight);
}
