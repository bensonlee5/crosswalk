import ctypes as C,re,os
from pathlib import Path
import sys,json,math
LOW='--low' in sys.argv
suffix='-low' if LOW else ''
ROOT=Path(sys.argv[1] if len(sys.argv)>1 and not sys.argv[1].startswith('--') else Path(__file__).resolve().parents[1]/'outputs/region-paint')
os.environ['EGL_PLATFORM']='surfaceless'
os.environ['MESA_SHADER_CACHE_DISABLE']='true'
e=C.CDLL('libEGL.so.1'); P=C.c_void_p; I=C.c_int; U=C.c_uint
for name,restype,args in [('eglGetDisplay',P,[P]),('eglInitialize',U,[P,C.POINTER(I),C.POINTER(I)]),('eglBindAPI',U,[U]),('eglChooseConfig',U,[P,C.POINTER(I),C.POINTER(P),I,C.POINTER(I)]),('eglCreatePbufferSurface',P,[P,P,C.POINTER(I)]),('eglCreateContext',P,[P,P,P,C.POINTER(I)]),('eglMakeCurrent',U,[P,P,P,P]),('eglGetProcAddress',P,[C.c_char_p])]:
 f=getattr(e,name);f.restype=restype;f.argtypes=args
D=e.eglGetDisplay(None);major=I();minor=I();assert e.eglInitialize(D,C.byref(major),C.byref(minor)), 'EGL initialization unavailable'
a=(I*17)(0x3033,1,0x3040,4,0x3024,8,0x3023,8,0x3022,8,0x3021,8,0x3025,24,0x3038);cfg=P();n=I();assert e.eglChooseConfig(D,a,C.byref(cfg),1,C.byref(n)) and n.value
assert e.eglBindAPI(0x30A0)
s=e.eglCreatePbufferSurface(D,cfg,(I*5)(0x3057,1280,0x3056,850,0x3038));c=e.eglCreateContext(D,cfg,None,(I*3)(0x3098,3,0x3038));assert c and s and e.eglMakeCurrent(D,s,s,c)
def gl(name,r,args):return C.CFUNCTYPE(r,*args)(e.eglGetProcAddress(name.encode()))
create=gl('glCreateShader',U,[U]);source=gl('glShaderSource',None,[U,I,C.POINTER(C.c_char_p),C.POINTER(I)]);compile=gl('glCompileShader',None,[U]);get=gl('glGetShaderiv',None,[U,U,C.POINTER(I)]);log=gl('glGetShaderInfoLog',None,[U,I,C.POINTER(I),C.c_char_p]);string=gl('glGetString',C.c_char_p,[U]);print('Renderer:',string(0x1F01).decode(),'Version:',string(0x1F02).decode())
from PIL import Image, ImageDraw, ImageFont
programs={}
for key,files in json.load(open(ROOT/'programs.json')).items():
 shaders=[]
 for name,typ in [('vertex',0x8B31),('fragment',0x8B30)]:
  sh=create(typ);data=C.c_char_p((ROOT/files[name]).read_bytes());source(sh,1,C.byref(data),None);compile(sh);ok=I();get(sh,0x8B81,C.byref(ok));b=C.create_string_buffer(16000);log(sh,16000,None,b)
  assert ok.value, key+' '+name+': '+b.value.decode();shaders.append(sh)
 program=gl('glCreateProgram',U,[])();attach=gl('glAttachShader',None,[U,U]);link=gl('glLinkProgram',None,[U]);gp=gl('glGetProgramiv',None,[U,U,C.POINTER(I)])
 for sh in shaders:attach(program,sh)
 link(program);ok=I();gp(program,0x8B82,C.byref(ok));b=C.create_string_buffer(16000);gl('glGetProgramInfoLog',None,[U,I,C.POINTER(I),C.c_char_p])(program,16000,None,b)
 assert ok.value,key+' link: '+b.value.decode();programs[key]=program
 for sh in shaders:gl('glDeleteShader',None,[U])(sh)
 print('PASS GLSL ES 3 compile/link:',key)
use=gl('glUseProgram',None,[U]);ul=gl('glGetUniformLocation',I,[U,C.c_char_p]);al=gl('glGetAttribLocation',I,[U,C.c_char_p]);bind=gl('glBindBuffer',None,[U,U]);gen=gl('glGenBuffers',None,[I,C.POINTER(U)]);delete=gl('glDeleteBuffers',None,[I,C.POINTER(U)])
f=gl('glUniform1f',None,[I,C.c_float]);f3=gl('glUniform3fv',None,[I,I,P]);ui=gl('glUniform1i',None,[I,I]);matrix4=gl('glUniformMatrix4fv',None,[I,I,U,P]);matrix3=gl('glUniformMatrix3fv',None,[I,I,U,P]);draw=gl('glDrawArrays',None,[U,I,I]);finish=gl('glFinish',None,[])
enable=gl('glEnable',None,[U]);enable(0x0B71);enable(0x0B44);gl('glCullFace',None,[U])(0x0405)
# Three r186 requires its built-in DFG lookup for energy compensation.
texture=U();gl('glGenTextures',None,[I,C.POINTER(U)])(1,C.byref(texture));gl('glActiveTexture',None,[U])(0x84C0);gl('glBindTexture',None,[U,U])(0x0DE1,texture)
raw=C.create_string_buffer((ROOT/'dfg-lut.bin').read_bytes());gl('glTexImage2D',None,[U,I,I,I,I,I,U,U,P])(0x0DE1,0,0x822F,16,16,0,0x8227,0x140B,raw)
for key,value in [(0x2801,0x2601),(0x2800,0x2601),(0x2802,0x812F),(0x2803,0x812F)]:gl('glTexParameteri',None,[U,U,I])(0x0DE1,key,value)
outputs=[]
for region in ['alder','saffron','glasssteppe','pelagia','embermesa']:
 data=json.load(open(ROOT/(region+'.json')));w=data['width'];h=data['height'];sky=data['sky'];gl('glViewport',None,[I,I,I,I])(0,0,w,h);gl('glClearColor',None,[C.c_float]*4)(((sky>>16)&255)/255,((sky>>8)&255)/255,(sky&255)/255,1);gl('glClear',None,[U])(0x4000|0x0100)
 for mesh in data['meshes']:
  program=programs[mesh['program']['key']];use(program);loc=lambda s:ul(program,s.encode());arr=lambda a:(C.c_float*len(a))(*a)
  for name,value in [('modelMatrix',mesh['matrix']),('modelViewMatrix',mesh['modelView']),('projectionMatrix',data['projection']),('viewMatrix',data['view'])]:matrix4(loc(name),1,0,arr(value))
  matrix3(loc('normalMatrix'),1,0,arr(mesh['normalMatrix']))
  for name,value in [('cameraPosition',data['camera']),('diffuse',mesh['color']),('emissive',mesh['emissive']),('ambientLightColor',[0,0,0]),('directionalLights[0].direction',data['light']['direction']),('directionalLights[0].color',data['light']['color']),('hemisphereLights[0].direction',data['light']['hemi']),('hemisphereLights[0].skyColor',data['light']['sky']),('hemisphereLights[0].groundColor',data['light']['ground'])]:f3(loc(name),1,arr(value))
  for name,value in [('roughness',mesh['roughness']),('metalness',mesh['metalness']),('opacity',1),('toneMappingExposure',1.1),('crosswalkPaintStrength',mesh['program']['strength']),('crosswalkPaintDetail',0 if LOW else 1)]:f(loc(name),value)
  ui(loc('dfgLUT'),0);ui(loc('isOrthographic'),0);ui(loc('receiveShadow'),0);buffers=[]
  for name,values in [('position',mesh['position']),('normal',mesh['normal']),('color',mesh['vertexColor'])]:
   index=al(program,name.encode())
   if index<0:continue
   if values is None:
    gl('glDisableVertexAttribArray',None,[U])(index);gl('glVertexAttrib3f',None,[U,C.c_float,C.c_float,C.c_float])(index,1,1,1);continue
   buffer=U();gen(1,C.byref(buffer));bind(0x8892,buffer);values=arr(values);gl('glBufferData',None,[U,C.c_ssize_t,P,U])(0x8892,C.sizeof(values),values,0x88E4);gl('glEnableVertexAttribArray',None,[U])(index);gl('glVertexAttribPointer',None,[U,I,U,U,I,P])(index,3,0x1406,0,0,None);buffers.append((buffer,index))
  draw(4,0,len(mesh['position'])//3)
  for buffer,index in buffers:gl('glDisableVertexAttribArray',None,[U])(index);delete(1,C.byref(buffer))
 finish();pixels=C.create_string_buffer(w*h*4);gl('glReadPixels',None,[I,I,I,I,U,U,P])(0,0,w,h,0x1908,0x1401,pixels);error=gl('glGetError',U,[])();assert error==0,hex(error)
 image=Image.frombytes('RGBA',(w,h),pixels.raw).transpose(Image.Transpose.FLIP_TOP_BOTTOM).convert('RGB');assert len(image.getcolors(w*h) or [])>100, 'Scene did not shade correctly';image.save(ROOT/(region+suffix+'-native.png'));outputs.append((region,data['name'],image));print('PASS native scene:',region,len(data['meshes']),'meshes')
canvas=Image.new('RGB',(1920,2080),'#f4f0e7');ink=ImageDraw.Draw(canvas)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',25);title=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',37)
ink.text((30,20),'Crosswalk • distinct painted settlements',fill='#233a35',font=title)
ink.text((30,70),'Urban ports and rail cities, coastal suburbs, harbor towns and rural mesa life',fill='#657168',font=font)
for i,(region,name,image) in enumerate(outputs):
 x=(i%2)*960;y=120+(i//2)*640;canvas.paste(image.resize((960,585)),(x,y));ink.text((x+25,y+592),region.title()+' • '+name,fill='#233a35',font=font)
ink.text((990,1540),'Offline graphics validation',fill='#233a35',font=title)
for i,line in enumerate(['Actual 3D geometry and surface shaders','No added image textures or postprocessing','Browser UI, shadows and touch not shown']):ink.text((990,1600+i*45),line,fill='#657168',font=font)
canvas.save(ROOT/('Crosswalk-Painted-3D'+suffix+'-Review.png'))
report={'quality':'low' if LOW else 'full','renderer':string(0x1F01).decode(),'version':string(0x1F02).decode(),'programs':len(programs),'compiled_and_linked':list(programs),'rendered_regions':[x[0] for x in outputs],'scope':'Independent native EGL rendering of real scene meshes and exact Three standard shader hooks; no browser, UI, shadow maps or hardware-mobile performance claim.'}
(ROOT/('native-validation'+suffix+'.json')).write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
