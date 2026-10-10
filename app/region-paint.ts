import * as T from 'three';

export type RegionPaintId = 'alder' | 'saffron' | 'glasssteppe' | 'pelagia' | 'embermesa';
export type PaintRole = 'solid' | 'leaf' | 'water' | 'snow' | 'window' | 'copper' | 'figure';
export type RegionPaintStyle = {
  name: string;
  index: number;
  palette: {wall:number;trim:number;roof:number;ground:number;path:number;water:number;leaf:number;accent:number;wood:number};
  light: {sky:number;sun:number;ground:number;fill:number;sunIntensity:number;fillIntensity:number;sunHeight:number;sunSide:number;sunRear:number};
  roughness: number;
  waterRoughness: number;
  faceVariation: number;
};

/** Art direction from the five approved paintings; never written to game/save state. */
export const regionPaintStyles: Record<RegionPaintId, RegionPaintStyle> = {
  alder: {
    name: 'Impressionist oil', index: 0,
    palette: {wall:0xc58262,trim:0xf0ddb0,roof:0x547d80,ground:0x91a66c,path:0xd8c6a0,water:0x529dad,leaf:0x74994c,accent:0xe2b552,wood:0x9b6947},
    light: {sky:0xc4dbdf,sun:0xffdfa6,ground:0x737a98,fill:0xe5f2ff,sunIntensity:2.7,fillIntensity:2.15,sunHeight:35,sunSide:5,sunRear:18},
    roughness:.91, waterRoughness:.62, faceVariation:.045,
  },
  saffron: {
    name: 'Minimalist gouache', index: 1,
    palette: {wall:0xe0c49a,trim:0xf4e2bc,roof:0xc69068,ground:0xc0ad8b,path:0xe0d1b4,water:0x659b9a,leaf:0x7f987e,accent:0x668e89,wood:0x998568},
    light: {sky:0xe8e3d6,sun:0xffefd8,ground:0x919789,fill:0xf3f1e7,sunIntensity:2.05,fillIntensity:2.4,sunHeight:39,sunSide:-8,sunRear:16},
    roughness:.98, waterRoughness:.83, faceVariation:.025,
  },
  glasssteppe: {
    name: 'Geometric modernist oil', index: 2,
    palette: {wall:0x94a5ab,trim:0xe2d7ad,roof:0x3f6282,ground:0x7f9784,path:0xc5c6b0,water:0x48799c,leaf:0x3d6662,accent:0xb18952,wood:0x7f6949},
    light: {sky:0xb2cedd,sun:0xffe5b6,ground:0x4f6187,fill:0xd8ebff,sunIntensity:2.85,fillIntensity:1.95,sunHeight:32,sunSide:-16,sunRear:20},
    roughness:.88, waterRoughness:.69, faceVariation:.18,
  },
  pelagia: {
    name: 'Ink and watercolor', index: 3,
    palette: {wall:0xd3e4dc,trim:0xf4ebd5,roof:0x65aab4,ground:0x88abb0,path:0xd1e0d3,water:0x559fae,leaf:0x76a997,accent:0xc8997f,wood:0x8d9990},
    light: {sky:0xe4ebe4,sun:0xfff2d8,ground:0x7795a0,fill:0xf2f7ef,sunIntensity:1.85,fillIntensity:2.5,sunHeight:37,sunSide:8,sunRear:17},
    roughness:.97, waterRoughness:.89, faceVariation:.055,
  },
  embermesa: {
    name: 'Expressionist impasto', index: 4,
    palette: {wall:0x9b6450,trim:0xd0b18a,roof:0x51516c,ground:0x9c7860,path:0xc59f7b,water:0x567480,leaf:0x6e7f62,accent:0xba794f,wood:0x805746},
    light: {sky:0x444557,sun:0xe7b184,ground:0x48465f,fill:0xa8b3cd,sunIntensity:1.55,fillIntensity:1.9,sunHeight:19,sunSide:-18,sunRear:22},
    roughness:.86, waterRoughness:.73, faceVariation:.085,
  },
};

export function regionPaintId(requested: string): RegionPaintId {
  return requested === 'glass' ? 'glasssteppe' : Object.hasOwn(regionPaintStyles, requested) ? requested as RegionPaintId : 'alder';
}

// Coordinates follow the mesh in world space, including batched roofs without authored UVs.
// There are no texture fetches, screen-space postprocess passes, or animated noise.
export const paintShaderDeclarations = /* glsl */`
varying vec3 vCrosswalkPaintPosition;
varying vec3 vCrosswalkPaintNormal;
uniform float crosswalkPaintStrength;
uniform float crosswalkPaintDetail;
float crosswalkHash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float crosswalkNoise(vec2 p) {
  vec2 cell=floor(p), f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(crosswalkHash(cell),crosswalkHash(cell+vec2(1.0,0.0)),f.x),
    mix(crosswalkHash(cell+vec2(0.0,1.0)),crosswalkHash(cell+vec2(1.0,1.0)),f.x),f.y);
}
vec2 crosswalkPlane() {
  vec3 n = abs(normalize(vCrosswalkPaintNormal));
  return n.y >= n.x && n.y >= n.z ? vCrosswalkPaintPosition.xz :
    n.x > n.z ? vCrosswalkPaintPosition.zy : vCrosswalkPaintPosition.xy;
}
`;

export const paintShaderColor = /* glsl */`
vec2 paintPlane = crosswalkPlane();
vec2 paintQ = paintPlane * 1.8;
// Smoothly suppress subpixel marks before they can shimmer on small phone screens.
float paintCoverage = 1.0 - smoothstep(0.20, 0.85, max(fwidth(paintQ.x), fwidth(paintQ.y)));
float paintStrength = crosswalkPaintStrength * paintCoverage;
float paintRelief = 0.0;
#if CROSSWALK_PAINT_STYLE == 0
  vec2 q = paintQ * vec2(1.15, 2.7);
  q.x += crosswalkHash(vec2(floor(q.y),2.0))*0.8;
  vec2 cell = floor(q), f = fract(q) - 0.5;
  float tone = crosswalkHash(cell);
  float dab = 1.0 - smoothstep(0.28, 0.55, length(f * vec2(0.85, 1.45)));
  vec3 oil = mix(vec3(0.83,0.92,1.13), vec3(1.17,1.08,0.83), tone);
  diffuseColor.rgb *= mix(vec3(1.0), oil, paintStrength * (0.5 + 0.5 * dab));
  diffuseColor.rgb += vec3(0.034,0.029,0.015) * dab * tone * paintStrength;
#elif CROSSWALK_PAINT_STYLE == 1
  vec2 q = paintQ * 0.75;
  float block = crosswalkHash(floor(q + vec2(0.12 * sin(q.y * 4.0),0.0)));
  float chalk = crosswalkPaintDetail > 0.5 ? crosswalkHash(floor(paintQ * 12.0)) : 0.5;
  diffuseColor.rgb *= 1.0 + paintStrength * ((block-0.5)*0.055 + (chalk-0.5)*0.022*crosswalkPaintDetail);
#elif CROSSWALK_PAINT_STYLE == 2
  vec2 q = paintQ * 0.48;
  vec2 f = fract(q);
  float plane = step(f.x, f.y);
  float tone = crosswalkHash(floor(q) + vec2(plane,plane*2.0));
  vec3 facet = mix(vec3(0.78,0.89,1.12),vec3(1.17,1.09,0.84),tone);
  diffuseColor.rgb *= mix(vec3(1.0),facet,paintStrength*0.8*mix(1.0,0.48,abs(normalize(vCrosswalkPaintNormal).y)));
#elif CROSSWALK_PAINT_STYLE == 3
  vec2 q = paintQ * 0.8;
  float pool = crosswalkNoise(q*0.65)*0.72+crosswalkNoise(q*1.65)*0.28;
  float grain = crosswalkPaintDetail > 0.5 ? crosswalkHash(floor(paintQ*9.0)) : 0.5;
  float paper = smoothstep(0.54,0.88,pool) * 0.09;
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.92,0.90,0.81),paper*paintStrength);
  diffuseColor.rgb *= 1.0 - paintStrength * ((1.0-pool)*0.085 + grain*0.035*crosswalkPaintDetail);
#elif CROSSWALK_PAINT_STYLE == 4
  vec2 q = vec2(paintQ.x + paintQ.y*0.42, paintQ.y*3.6);
  float stroke = crosswalkHash(floor(q));
  float ridge = crosswalkPaintDetail > 0.5 ? pow(0.5+0.5*sin(q.y*6.28318 + stroke*1.7),3.0) : 0.0;
  vec3 pigment = mix(vec3(0.80,0.84,1.12),vec3(1.12,1.02,0.87),stroke);
  diffuseColor.rgb *= mix(vec3(1.0),pigment,paintStrength*0.85);
  diffuseColor.rgb += vec3(0.033,0.025,0.012)*ridge*paintStrength;
  paintRelief = ridge * paintStrength * crosswalkPaintDetail;
#endif
`;

export const paintShaderNormal = /* glsl */`
#if CROSSWALK_PAINT_STYLE == 3
  // Fine ink at grazing architectural edges. Text, skin and selection markers are excluded.
  float inkEdge = pow(1.0-abs(dot(normal,normalize(vViewPosition))),5.0);
  diffuseColor.rgb *= 1.0 - inkEdge*0.27*crosswalkPaintStrength;
#elif CROSSWALK_PAINT_STYLE == 4
  // Relief shading changes the painted surface normal, never its silhouette/pick geometry.
  normal = normalize(normal + vec3(-dFdx(paintRelief),dFdy(paintRelief),0.0)*0.22);
#endif
`;

export function createRegionPaintMaterial(region: RegionPaintId, color: number, role: PaintRole, compatibility: boolean) {
  const style = regionPaintStyles[region];
  const roughness = role === 'water' ? style.waterRoughness : role === 'copper' ? Math.max(.64,style.roughness-.14) : style.roughness;
  const material = new T.MeshStandardMaterial({color,roughness,metalness:role==='copper'?.17:0,flatShading:true});
  const protectedRole = role === 'figure' || role === 'window' || role === 'snow';
  material.userData = {originalColor:color,role,baseRoughness:roughness,paintStyle:style.name,paintRegion:region};
  if (!compatibility && !protectedRole) {
    const strength = role === 'water' ? .58 : role === 'copper' ? .48 : role === 'leaf' ? .72 : 1;
    const detail = {value:1};
    material.userData.paintDetail = detail;
    material.onBeforeCompile = shader => {
      shader.defines = {...shader.defines,CROSSWALK_PAINT_STYLE:style.index};
      shader.uniforms.crosswalkPaintStrength = {value:strength};
      shader.uniforms.crosswalkPaintDetail = detail;
      shader.vertexShader = 'varying vec3 vCrosswalkPaintPosition;\nvarying vec3 vCrosswalkPaintNormal;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
        vCrosswalkPaintPosition = (modelMatrix * vec4(transformed,1.0)).xyz;
        vCrosswalkPaintNormal = inverseTransformDirection(transformedNormal,viewMatrix);`);
      shader.fragmentShader = paintShaderDeclarations + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+paintShaderColor);
      shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n'+paintShaderNormal);
    };
    material.customProgramCacheKey = () => `crosswalk-paint-v1:${style.index}`;
  }
  return material;
}

/** Per-face pigment survives SVG fallback with zero extra vertices or draw calls. */
export function paintRegionGeometry(geometry: T.BufferGeometry, region: RegionPaintId, world: T.Matrix4) {
  const position = geometry.getAttribute('position');
  const colors = new Float32Array(position.count*3);
  const center = new T.Vector3();
  const amount = regionPaintStyles[region].faceVariation;
  for (let i=0; i<position.count; i+=3) {
    center.set(0,0,0);
    for(let k=0;k<3;k++)center.add(new T.Vector3().fromBufferAttribute(position,i+k));
    center.multiplyScalar(1/3).applyMatrix4(world);
    const value = Math.sin(center.x*.71 + center.y*1.37 + center.z*.53);
    const warm = region === 'glasssteppe' ? (value>0?1:-1) : value;
    const rgb = [1+warm*amount,1+warm*amount*.35,1-warm*amount*.7];
    for(let k=0;k<3;k++)colors.set(rgb,(i+k)*3);
  }
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
}

/** Uniform update only: switching quality never rebuilds a town or creates resources. */
export function setRegionPaintQuality(materials: Iterable<T.Material>, low: boolean) {
  for(const material of materials)if(material.userData.paintDetail)material.userData.paintDetail.value=low?0:1;
}

/** New climates expose temperature; unmarked saves keep the original seasonal visuals. */
type PaintWeather={season?:string;type?:string;temperature?:string};
export function coldPaintWeather(weather:PaintWeather|null){
  return weather?.temperature?weather.temperature==='cold'||weather.temperature==='cool':weather?.season==='winter';
}
export function snowPaintWeather(weather:PaintWeather|null){
  // Cold desert nights do not imply precipitation or retained snow cover.
  return weather?.temperature?weather.type==='snow':weather?.season==='winter';
}
